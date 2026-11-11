const vm = require('node:vm');
const { LEVEL_BY_SLUG, HERO_BY_ID } = require('../data/curriculum');
const { countNonEmptyLines, transpilePythonToJS, instrumentJavaScript } = require('./transpiler');

const MAX_TICKS = 90;
const MAX_LOOP_GUARDS = 600;

class SimulationStopSignal extends Error {
  constructor(reason) {
    super(reason);
    this.isStopSignal = true;
    this.reason = reason;
  }
}

function cloneState(hero, enemies, items, doors, structures, effects, activeLine, logMessage) {
  return {
    activeLine,
    log: logMessage || null,
    hero: {
      x: hero.x,
      y: hero.y,
      hp: hero.hp,
      maxHp: hero.maxHp,
      shielded: hero.shielded,
      facing: hero.facing,
      speech: hero.speech,
      gemsCollected: hero.gemsCollected,
      goldCollected: hero.goldCollected
    },
    enemies: enemies.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      x: e.x,
      y: e.y,
      hp: e.hp,
      maxHp: e.maxHp,
      alive: e.hp > 0
    })),
    items: items.map(i => ({
      id: i.id,
      type: i.type,
      x: i.x,
      y: i.y,
      collected: i.collected
    })),
    doors: doors.map(d => ({
      id: d.id,
      x: d.x,
      y: d.y,
      locked: d.locked
    })),
    structures: structures.map(s => ({
      id: s.id,
      type: s.type,
      x: s.x,
      y: s.y,
      active: s.active
    })),
    effects: effects.slice()
  };
}

function simulateLevel({ levelSlug, customLevel, code, language = 'python', heroId = 'tharin', equippedItems = [] }) {
  const startHr = process.hrtime.bigint();
  const level = customLevel || LEVEL_BY_SLUG.get(levelSlug);
  if (!level) {
    return { ok: false, error: `Level "${levelSlug}" not found.` };
  }

  const heroMeta = HERO_BY_ID.get(heroId) || HERO_BY_ID.get('tharin');
  const hasShieldBonus = equippedItems.includes('wooden-shield') ? 6 : 0;
  const hasSwordBonus = equippedItems.includes('long-sword') ? 3 : 0;

  const width = level.grid.width || 12;
  const height = level.grid.height || 8;
  const wallSet = new Set((level.grid.walls || []).map(w => `${w.x},${w.y}`));
  const spikeSet = new Set((level.grid.spikes || []).map(s => `${s.x},${s.y}`));

  const hero = {
    x: level.grid.heroStart.x,
    y: level.grid.heroStart.y,
    hp: 15 + heroMeta.hpBonus + hasShieldBonus,
    maxHp: 15 + heroMeta.hpBonus + hasShieldBonus,
    attackPower: 6 + heroMeta.attackBonus + hasSwordBonus,
    shielded: false,
    facing: 'right',
    speech: null,
    gemsCollected: 0,
    goldCollected: 0,
    hitSpike: false,
    cleaveCooldown: 0
  };

  const enemies = (level.grid.enemies || []).map(e => ({
    ...e,
    hp: e.hp || 12,
    maxHp: e.maxHp || e.hp || 12,
    attack: e.attack || 3
  }));

  const items = (level.grid.items || []).map(i => ({
    ...i,
    collected: false
  }));

  const doors = (level.grid.doors || []).map(d => ({
    ...d,
    locked: d.locked !== false
  }));

  const structures = [];
  const frames = [];
  let currentEffects = [];
  let activeLine = 1;
  let tickCount = 0;
  let guardCount = 0;
  const linesOfCode = countNonEmptyLines(code, language);

  function isBlocked(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return true;
    if (wallSet.has(`${x},${y}`)) return true;
    const lockedDoor = doors.find(d => d.locked && d.x === x && d.y === y);
    if (lockedDoor) return true;
    const fence = structures.find(s => s.active && s.type === 'fence' && s.x === x && s.y === y);
    if (fence) return true;
    return false;
  }

  function evaluateGoals() {
    const results = [];
    for (const g of level.goals || []) {
      let passed = false;
      if (g.id === 'collect-gems') {
        passed = items.filter(i => i.type === 'gem' || i.type === 'coin').every(i => i.collected);
      } else if (g.id === 'defeat-all') {
        passed = enemies.every(e => e.hp <= 0);
      } else if (g.id === 'open-door') {
        passed = doors.every(d => !d.locked);
      } else if (g.id === 'survive') {
        passed = hero.hp > 0 && !hero.hitSpike;
      } else if (g.id === 'under-lines') {
        passed = linesOfCode > 0 && linesOfCode <= (g.maxLines || 6);
      } else {
        passed = hero.hp > 0;
      }
      results.push({
        id: g.id,
        text: g.text,
        textTh: g.textTh,
        passed
      });
    }
    return results;
  }

  function areDynamicGoalsComplete() {
    if (hero.hp <= 0) return false;
    const goals = evaluateGoals();
    // Check all gameplay goals (excluding static line count which is checked at the end)
    const gameplayGoals = goals.filter(g => g.id !== 'under-lines');
    return gameplayGoals.length > 0 && gameplayGoals.every(g => g.passed);
  }

  function recordFrame(logMessage) {
    frames.push(cloneState(hero, enemies, items, doors, structures, currentEffects, activeLine, logMessage));
    currentEffects = [];
    hero.speech = null;
  }

  // Record initial state at frame 0
  recordFrame('Simulation started');

  function stepEnemiesAndEnvironment() {
    if (hero.cleaveCooldown > 0) hero.cleaveCooldown--;

    // Check spikes under hero
    if (spikeSet.has(`${hero.x},${hero.y}`)) {
      hero.hitSpike = true;
      hero.hp = Math.max(0, hero.hp - 12);
      currentEffects.push({ type: 'spike-hit', x: hero.x, y: hero.y, text: '-12 SPIKES!' });
    }

    // Check items pickup under hero
    for (const item of items) {
      if (!item.collected && item.x === hero.x && item.y === hero.y) {
        item.collected = true;
        if (item.type === 'potion') {
          hero.hp = Math.min(hero.maxHp, hero.hp + 10);
          currentEffects.push({ type: 'heal', x: hero.x, y: hero.y, text: '+10 HP' });
        } else {
          hero.gemsCollected += 1;
          hero.goldCollected += item.value || 1;
          currentEffects.push({ type: 'pickup', x: hero.x, y: hero.y, text: `+${item.value || 1} 💎` });
        }
      }
    }

    // Enemy turns
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;

      if (enemy.patrolLeft) {
        // Patrol enemies advance when a trap is laid on their lane or after tick 4
        const hasTrapInLane = structures.some(s => s.active && s.type === 'fire-trap' && s.y === enemy.y);
        if (hasTrapInLane || tickCount > 5) {
          const nextX = enemy.x - 1;
          if (!isBlocked(nextX, enemy.y)) {
            enemy.x = nextX;
          }
        }
      } else {
        const dist = Math.hypot(enemy.x - hero.x, enemy.y - hero.y);
        if (dist <= 1.5) {
          // Attack hero
          const rawDmg = enemy.attack || 3;
          const dmg = hero.shielded ? Math.max(1, Math.round(rawDmg * 0.3)) : rawDmg;
          hero.hp = Math.max(0, hero.hp - dmg);
          currentEffects.push({
            type: 'enemy-attack',
            fromX: enemy.x,
            fromY: enemy.y,
            x: hero.x,
            y: hero.y,
            text: `-${dmg}`
          });
        } else if (dist <= 3.6) {
          // Step closer to hero
          const dx = Math.sign(hero.x - enemy.x);
          const dy = Math.sign(hero.y - enemy.y);
          if (dx !== 0 && !isBlocked(enemy.x + dx, enemy.y)) {
            enemy.x += dx;
          } else if (dy !== 0 && !isBlocked(enemy.x, enemy.y + dy)) {
            enemy.y += dy;
          }
        }
      }

      // Check fire-trap trigger on enemy position
      for (const trap of structures) {
        if (trap.active && trap.type === 'fire-trap' && Math.hypot(trap.x - enemy.x, trap.y - enemy.y) <= 1.1) {
          trap.active = false;
          enemy.hp = Math.max(0, enemy.hp - 25);
          currentEffects.push({
            type: 'explosion',
            x: trap.x,
            y: trap.y,
            text: 'BOOM! -25'
          });
        }
      }
    }
  }

  function advanceTick(logMessage) {
    tickCount++;
    stepEnemiesAndEnvironment();
    recordFrame(logMessage);
    hero.shielded = false;

    if (hero.hp <= 0) {
      throw new SimulationStopSignal('HERO_DEFEATED');
    }
    if (areDynamicGoalsComplete()) {
      throw new SimulationStopSignal('GOALS_COMPLETED');
    }
    if (tickCount >= MAX_TICKS) {
      throw new SimulationStopSignal('MAX_TICKS');
    }
  }

  function moveDelta(dx, dy, steps = 1, dirName = 'right') {
    const count = Math.max(1, Math.min(12, Number(steps) || 1));
    hero.facing = dirName;
    for (let s = 0; s < count; s++) {
      const nx = hero.x + dx;
      const ny = hero.y + dy;
      if (!isBlocked(nx, ny)) {
        hero.x = nx;
        hero.y = ny;
      } else {
        currentEffects.push({ type: 'bump', x: hero.x, y: hero.y, text: 'Blocked!' });
      }
      advanceTick(`hero.move${dirName[0].toUpperCase() + dirName.slice(1)}() -> (${hero.x}, ${hero.y})`);
    }
  }

  function resolveEnemyTarget(target) {
    if (!target) return null;
    if (typeof target === 'string') {
      return enemies.find(e => e.hp > 0 && e.name.toLowerCase() === target.toLowerCase()) || null;
    }
    if (typeof target === 'object' && target.id) {
      return enemies.find(e => e.hp > 0 && e.id === target.id) || null;
    }
    return null;
  }

  function isSafeTile(x, y) {
    return !isBlocked(x, y) && !spikeSet.has(`${x},${y}`);
  }

  function stepTowards(tx, ty) {
    let safety = 0;
    while ((hero.x !== tx || hero.y !== ty) && safety < 24) {
      safety++;
      const dx = Math.sign(tx - hero.x);
      const dy = Math.sign(ty - hero.y);
      let moved = false;
      if (dx !== 0 && isSafeTile(hero.x + dx, hero.y)) {
        hero.x += dx;
        hero.facing = dx > 0 ? 'right' : 'left';
        moved = true;
      } else if (dy !== 0 && isSafeTile(hero.x, hero.y + dy)) {
        hero.y += dy;
        moved = true;
      } else if (dx !== 0 && isSafeTile(hero.x + dx, hero.y + (dy || 1))) {
        hero.y += (dy || 1);
        moved = true;
      } else if (dx !== 0 && !isBlocked(hero.x + dx, hero.y)) {
        hero.x += dx;
        moved = true;
      } else if (dy !== 0 && !isBlocked(hero.x, hero.y + dy)) {
        hero.y += dy;
        moved = true;
      }
      advanceTick(`Moving to (${tx}, ${ty})`);
      if (!moved) break;
    }
  }

  const heroApi = {
    get x() { return hero.x; },
    get y() { return hero.y; },
    get pos() { return { x: hero.x, y: hero.y }; },
    get health() { return hero.hp; },
    get maxHealth() { return hero.maxHp; },

    moveRight(steps = 1) { moveDelta(1, 0, steps, 'right'); },
    moveLeft(steps = 1) { moveDelta(-1, 0, steps, 'left'); },
    moveUp(steps = 1) { moveDelta(0, -1, steps, 'up'); },
    moveDown(steps = 1) { moveDelta(0, 1, steps, 'down'); },

    moveXY(x, y) {
      const tx = Math.max(1, Math.min(width - 2, Math.round(Number(x) || 0)));
      const ty = Math.max(1, Math.min(height - 2, Math.round(Number(y) || 0)));
      stepTowards(tx, ty);
    },

    wait(steps = 1) {
      const count = Math.max(1, Math.min(5, Number(steps) || 1));
      for (let i = 0; i < count; i++) {
        advanceTick('Waiting...');
      }
    },

    say(message) {
      const msg = String(message ?? '');
      hero.speech = msg;
      // Check if any door unlocks with this password
      for (const d of doors) {
        if (d.locked && d.password && msg.toLowerCase().includes(d.password.toLowerCase())) {
          d.locked = false;
          currentEffects.push({ type: 'door-open', x: d.x, y: d.y, text: '🔓 UNLOCKED!' });
        }
      }
      advanceTick(`hero.say("${msg}")`);
    },

    findNearestEnemy() {
      let best = null;
      let bestDist = Infinity;
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        const d = Math.hypot(e.x - hero.x, e.y - hero.y);
        if (d < bestDist) {
          bestDist = d;
          best = { id: e.id, name: e.name, type: e.type, x: e.x, y: e.y, health: e.hp, pos: { x: e.x, y: e.y } };
        }
      }
      return best;
    },

    findEnemies() {
      return enemies
        .filter(e => e.hp > 0)
        .map(e => ({ id: e.id, name: e.name, type: e.type, x: e.x, y: e.y, health: e.hp, pos: { x: e.x, y: e.y } }));
    },

    findNearestItem() {
      let best = null;
      let bestDist = Infinity;
      for (const i of items) {
        if (i.collected) continue;
        const d = Math.hypot(i.x - hero.x, i.y - hero.y);
        if (d < bestDist) {
          bestDist = d;
          best = { id: i.id, type: i.type, x: i.x, y: i.y, value: i.value || 1, pos: { x: i.x, y: i.y } };
        }
      }
      return best;
    },

    findItems() {
      return items
        .filter(i => !i.collected)
        .map(i => ({ id: i.id, type: i.type, x: i.x, y: i.y, value: i.value || 1, pos: { x: i.x, y: i.y } }));
    },

    distanceTo(target) {
      if (!target) return 999;
      const tx = typeof target.x === 'number' ? target.x : target.pos?.x;
      const ty = typeof target.y === 'number' ? target.y : target.pos?.y;
      if (typeof tx !== 'number' || typeof ty !== 'number') return 999;
      return Math.hypot(tx - hero.x, ty - hero.y);
    },

    isReady(action = 'cleave') {
      if (action === 'cleave') return hero.cleaveCooldown <= 0;
      return true;
    },

    attack(target) {
      const enemy = resolveEnemyTarget(target);
      if (!enemy) {
        advanceTick('hero.attack() - target not found');
        return;
      }

      // Move within melee range (distance <= 1.5)
      let approachSteps = 0;
      while (Math.hypot(enemy.x - hero.x, enemy.y - hero.y) > 1.5 && approachSteps < 12) {
        approachSteps++;
        const dx = Math.sign(enemy.x - hero.x);
        const dy = Math.sign(enemy.y - hero.y);
        if (dx !== 0 && !isBlocked(hero.x + dx, hero.y)) {
          hero.x += dx;
          hero.facing = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0 && !isBlocked(hero.x, hero.y + dy)) {
          hero.y += dy;
        }
        advanceTick(`Approaching ${enemy.name}`);
        if (enemy.hp <= 0) return;
      }

      if (Math.hypot(enemy.x - hero.x, enemy.y - hero.y) <= 1.6) {
        hero.facing = enemy.x >= hero.x ? 'right' : 'left';
        enemy.hp = Math.max(0, enemy.hp - hero.attackPower);
        currentEffects.push({
          type: 'slash',
          fromX: hero.x,
          fromY: hero.y,
          x: enemy.x,
          y: enemy.y,
          text: `-${hero.attackPower}`
        });
        advanceTick(`Attacked ${enemy.name} (-${hero.attackPower} HP)`);
      }
    },

    cleave() {
      hero.cleaveCooldown = 3;
      let hitCount = 0;
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (Math.hypot(e.x - hero.x, e.y - hero.y) <= 2.5) {
          const dmg = hero.attackPower + 8;
          e.hp = Math.max(0, e.hp - dmg);
          hitCount++;
          currentEffects.push({
            type: 'slash',
            fromX: hero.x,
            fromY: hero.y,
            x: e.x,
            y: e.y,
            text: `CLEAVE -${dmg}!`
          });
        }
      }
      currentEffects.push({ type: 'cleave-ring', x: hero.x, y: hero.y, text: '🌀 CLEAVE!' });
      advanceTick(`hero.cleave() hit ${hitCount} enemies`);
    },

    shield() {
      hero.shielded = true;
      currentEffects.push({ type: 'shield', x: hero.x, y: hero.y, text: '🛡️ SHIELD' });
      advanceTick('hero.shield() raised');
    },

    buildXY(type, x, y) {
      const tx = Math.max(1, Math.min(width - 2, Math.round(Number(x) || 0)));
      const ty = Math.max(1, Math.min(height - 2, Math.round(Number(y) || 0)));
      // Move adjacent or onto tile
      stepTowards(tx, ty);
      structures.push({
        id: `struct-${structures.length + 1}`,
        type: type === 'fence' ? 'fence' : 'fire-trap',
        x: tx,
        y: ty,
        active: true
      });
      // Step 1 tile back if possible so enemies can walk onto the trap
      if (!isBlocked(hero.x - 1, hero.y)) {
        hero.x -= 1;
      }
      currentEffects.push({ type: 'build', x: tx, y: ty, text: `🔨 Built ${type}` });
      advanceTick(`Built ${type} at (${tx}, ${ty})`);
    },

    cast(spell, target) {
      if (spell === 'heal') {
        hero.hp = Math.min(hero.maxHp, hero.hp + 12);
        currentEffects.push({ type: 'heal', x: hero.x, y: hero.y, text: '✨ +12 HP' });
        advanceTick('Cast heal');
        return;
      }
      const enemy = resolveEnemyTarget(target);
      if (!enemy) {
        advanceTick('Cast fizzled (no target)');
        return;
      }
      const dmg = hero.attackPower + 10;
      enemy.hp = Math.max(0, enemy.hp - dmg);
      currentEffects.push({
        type: 'fireball',
        fromX: hero.x,
        fromY: hero.y,
        x: enemy.x,
        y: enemy.y,
        text: `🔥 -${dmg}`
      });
      advanceTick(`Cast fireball at ${enemy.name} (-${dmg} HP)`);
    }
  };

  let compiledJS = '';
  let runtimeError = null;

  try {
    compiledJS = language === 'javascript'
      ? instrumentJavaScript(code)
      : transpilePythonToJS(code);

    const sandbox = {
      hero: heroApi,
      self: heroApi,
      Math,
      Number,
      String,
      Boolean,
      Array,
      __line(n) {
        activeLine = n;
      },
      __guard() {
        guardCount++;
        if (guardCount > MAX_LOOP_GUARDS) {
          throw new SimulationStopSignal('INFINITE_LOOP_GUARD');
        }
      }
    };

    vm.runInNewContext(compiledJS, sandbox, { timeout: 250 });

    // If enemies are still marching toward traps after hero script finishes, run up to 6 settling ticks
    let settle = 0;
    while (!areDynamicGoalsComplete() && hero.hp > 0 && settle < 6 && structures.some(s => s.active)) {
      settle++;
      advanceTick('Waiting for patrol...');
    }
  } catch (err) {
    if (!err || !err.isStopSignal) {
      runtimeError = {
        message: err ? err.message : 'Unknown error',
        line: activeLine
      };
    }
  }

  const goals = evaluateGoals();
  const allPassed = !runtimeError && goals.length > 0 && goals.every(g => g.passed);
  const elapsedMs = Number(process.hrtime.bigint() - startHr) / 1e6;

  let stars = 0;
  if (allPassed) {
    stars = 3;
    if (level.optimalLines && linesOfCode > level.optimalLines + 3) {
      stars = 2;
    }
    if (hero.hp < hero.maxHp * 0.4) {
      stars = Math.max(1, stars - 1);
    }
  }

  return {
    ok: true,
    levelSlug: level.slug,
    victory: allPassed,
    stars,
    linesOfCode,
    ticksTaken: tickCount,
    executionTimeMs: Number(elapsedMs.toFixed(3)),
    goals,
    runtimeError,
    frames
  };
}

module.exports = {
  simulateLevel
};
