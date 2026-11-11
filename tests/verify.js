const assert = require('node:assert');
const { LEVELS } = require('../src/data/curriculum');
const { simulateLevel } = require('../src/engine/simulator');
const { analyzeCodeAndAdvise } = require('../src/engine/aiMentor');

console.log('=== CodeCombat Local — REA Verification & Benchmark Suite ===\n');

let totalPyMs = 0;
let totalJsMs = 0;

for (const level of LEVELS) {
  // 1. Test Python solution
  const pyRes = simulateLevel({
    levelSlug: level.slug,
    code: level.solutionCode.python,
    language: 'python',
    heroId: 'tharin',
    equippedItems: ['simple-boots', 'compound-boots', 'simple-sword', 'long-sword', 'wooden-shield', 'mahogany-glasses', 'builders-hammer', 'arcane-staff']
  });

  assert.strictEqual(pyRes.ok, true, `Python sim failed on ${level.slug}`);
  assert.strictEqual(
    pyRes.victory,
    true,
    `Python solution did not win on level #${level.number} (${level.slug}): goals=${JSON.stringify(pyRes.goals)} err=${JSON.stringify(pyRes.runtimeError)}`
  );
  totalPyMs += pyRes.executionTimeMs;

  // 2. Test JavaScript solution
  const jsRes = simulateLevel({
    levelSlug: level.slug,
    code: level.solutionCode.javascript,
    language: 'javascript',
    heroId: 'anya',
    equippedItems: ['simple-boots', 'compound-boots', 'simple-sword', 'long-sword', 'wooden-shield', 'mahogany-glasses', 'builders-hammer', 'arcane-staff']
  });

  assert.strictEqual(jsRes.ok, true, `JS sim failed on ${level.slug}`);
  assert.strictEqual(
    jsRes.victory,
    true,
    `JS solution did not win on level #${level.number} (${level.slug}): goals=${JSON.stringify(jsRes.goals)} err=${JSON.stringify(jsRes.runtimeError)}`
  );
  totalJsMs += jsRes.executionTimeMs;

  console.log(
    `✓ Level #${String(level.number).padStart(2, '0')} [${level.world.padEnd(8)}] ${level.slug.padEnd(24)} | Py: ${pyRes.executionTimeMs.toFixed(2)}ms (${pyRes.ticksTaken}t) | JS: ${jsRes.executionTimeMs.toFixed(2)}ms (${jsRes.ticksTaken}t) | Stars: ${pyRes.stars}⭐`
  );
}

// 3. Test AI Mentor
const mentor = analyzeCodeAndAdvise({
  levelSlug: 'dungeons-of-kithgard',
  code: 'hero.moveRight(1)',
  language: 'python'
});
assert.strictEqual(mentor.ok, true);
assert.ok(mentor.solutionCode.includes('hero.moveRight'));

const mem = process.memoryUsage();
console.log('\n-------------------------------------------------------------');
console.log(`All ${LEVELS.length} Levels Verified (Python + JavaScript = ${LEVELS.length * 2} runs)!`);
console.log(`Total Python Sim Time : ${totalPyMs.toFixed(2)} ms (Avg ${(totalPyMs / LEVELS.length).toFixed(2)} ms/level)`);
console.log(`Total JS Sim Time     : ${totalJsMs.toFixed(2)} ms (Avg ${(totalJsMs / LEVELS.length).toFixed(2)} ms/level)`);
console.log(`Process Memory (RSS)  : ${(mem.rss / 1024 / 1024).toFixed(2)} MB | Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log('-------------------------------------------------------------');
