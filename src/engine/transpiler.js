/**
 * Lightweight, zero-dependency Python-to-JS Transpiler & Line Instrumentation Engine
 * Designed using REA Analysis Optimization principles:
 * - Single-pass line normalization
 * - Automatic loop guard injection (__guard()) so `while True:` loops terminate safely
 * - Line number tracking (__line(n)) so the frontend highlights the exact executing line
 */

function countNonEmptyLines(code, lang = 'python') {
  if (!code) return 0;
  return code
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'))
    .length;
}

function replacePythonOperatorsOutsideStrings(expr) {
  let out = '';
  let inSingle = false;
  let inDouble = false;
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (ch === "'" && !inDouble && expr[i - 1] !== '\\') {
      inSingle = !inSingle;
      out += ch;
      i++;
      continue;
    }
    if (ch === '"' && !inSingle && expr[i - 1] !== '\\') {
      inDouble = !inDouble;
      out += ch;
      i++;
      continue;
    }
    if (inSingle || inDouble) {
      out += ch;
      i++;
      continue;
    }
    // Strip trailing inline python comment
    if (ch === '#') {
      break;
    }
    out += ch;
    i++;
  }

  return out
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null')
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||')
    .replace(/\bnot\s+/g, '!');
}

function transpilePythonToJS(pyCode) {
  const rawLines = (pyCode || '').split(/\r?\n/);
  const indentStack = [0];
  const jsLines = [];
  const declaredVars = new Set();

  for (let idx = 0; idx < rawLines.length; idx++) {
    const lineNum = idx + 1;
    const raw = rawLines[idx];

    // Convert tabs to 4 spaces
    const expanded = raw.replace(/\t/g, '    ');
    const trimmed = expanded.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const indent = expanded.length - expanded.trimStart().length;

    // Close blocks if indentation decreased
    while (indent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsLines.push('}');
    }

    const clean = replacePythonOperatorsOutsideStrings(trimmed).trim();
    if (!clean || clean === 'pass') {
      jsLines.push(`__line(${lineNum}); __guard();`);
      continue;
    }

    // 1. while condition:
    const whileMatch = clean.match(/^while\s+(.+):$/);
    if (whileMatch) {
      jsLines.push(`while ((__line(${lineNum}), __guard(), (${whileMatch[1]}))) {`);
      indentStack.push(indent + 4);
      continue;
    }

    // 2. for i in range(a, b) or range(n):
    const rangeMatch = clean.match(/^for\s+([a-zA-Z_$][\w$]*)\s+in\s+range\(([^)]+)\):$/);
    if (rangeMatch) {
      const varName = rangeMatch[1];
      const args = rangeMatch[2].split(',').map(s => s.trim());
      if (args.length === 1) {
        jsLines.push(`for (let ${varName} = 0; __line(${lineNum}), __guard(), ${varName} < (${args[0]}); ${varName}++) {`);
      } else {
        jsLines.push(`for (let ${varName} = (${args[0]}); __line(${lineNum}), __guard(), ${varName} < (${args[1]}); ${varName}++) {`);
      }
      indentStack.push(indent + 4);
      continue;
    }

    // 3. for item in collection:
    const forInMatch = clean.match(/^for\s+([a-zA-Z_$][\w$]*)\s+in\s+(.+):$/);
    if (forInMatch) {
      const varName = forInMatch[1];
      const collection = forInMatch[2];
      jsLines.push(`for (let ${varName} of (${collection} || [])) { __line(${lineNum}); __guard();`);
      indentStack.push(indent + 4);
      continue;
    }

    // 4. if condition:
    const ifMatch = clean.match(/^if\s+(.+):$/);
    if (ifMatch) {
      jsLines.push(`if ((__line(${lineNum}), (${ifMatch[1]}))) {`);
      indentStack.push(indent + 4);
      continue;
    }

    // 5. elif condition:
    const elifMatch = clean.match(/^elif\s+(.+):$/);
    if (elifMatch) {
      // Pop matching if/elif block if indent matches current block start
      if (jsLines.length > 0 && jsLines[jsLines.length - 1] === '}') {
        jsLines.pop();
        jsLines.push(`} else if ((__line(${lineNum}), (${elifMatch[1]}))) {`);
      } else {
        jsLines.push(`if ((__line(${lineNum}), (${elifMatch[1]}))) {`);
      }
      indentStack.push(indent + 4);
      continue;
    }

    // 6. else:
    if (/^else\s*:$/.test(clean)) {
      if (jsLines.length > 0 && jsLines[jsLines.length - 1] === '}') {
        jsLines.pop();
        jsLines.push('} else {');
      } else {
        jsLines.push('{');
      }
      indentStack.push(indent + 4);
      continue;
    }

    // 7. def funcName(params):
    const defMatch = clean.match(/^def\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)\s*:$/);
    if (defMatch) {
      jsLines.push(`function ${defMatch[1]}(${defMatch[2]}) { __line(${lineNum}); __guard();`);
      indentStack.push(indent + 4);
      continue;
    }

    // 8. Simple variable assignment: varName = expr
    const assignMatch = clean.match(/^([a-zA-Z_$][\w$]*)\s*=\s*([^=].*)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const rhs = assignMatch[2];
      if (!declaredVars.has(varName) && indentStack.length === 1) {
        declaredVars.add(varName);
        jsLines.push(`__line(${lineNum}); var ${varName} = ${rhs};`);
      } else {
        jsLines.push(`__line(${lineNum}); ${varName} = ${rhs};`);
      }
      continue;
    }

    // 9. Normal statement
    jsLines.push(`__line(${lineNum}); ${clean};`);
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    jsLines.push('}');
  }

  return jsLines.join('\n');
}

function instrumentJavaScript(jsCode) {
  const rawLines = (jsCode || '').split(/\r?\n/);
  const out = [];

  for (let idx = 0; idx < rawLines.length; idx++) {
    const lineNum = idx + 1;
    let line = rawLines[idx];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) {
      out.push(line);
      continue;
    }

    // Inject __guard() and __line() into while(...) and for(...)
    if (/^\s*while\s*\(/.test(line)) {
      line = line.replace(/while\s*\((.*)\)\s*\{?/, (m, cond) => {
        const hasBrace = m.trim().endsWith('{');
        return `while ((__line(${lineNum}), __guard(), (${cond}))) ${hasBrace ? '{' : ''}`;
      });
      out.push(line);
      continue;
    }

    if (/^\s*for\s*\(/.test(line)) {
      const hasBrace = trimmed.endsWith('{');
      if (hasBrace) {
        out.push(`${line} __line(${lineNum}); __guard();`);
      } else {
        out.push(line);
      }
      continue;
    }

    if (/^\s*(if|else\s+if|}\s*else\s+if)\s*\(/.test(line) || /^\s*}?\s*else\b/.test(line) || /^\s*function\b/.test(line) || trimmed === '}' || trimmed === '{') {
      out.push(line);
      continue;
    }

    out.push(`__line(${lineNum}); ${line}`);
  }

  return out.join('\n');
}

module.exports = {
  countNonEmptyLines,
  transpilePythonToJS,
  instrumentJavaScript
};
