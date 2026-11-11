/**
 * CodeCombat Local Curriculum, Worlds, Heroes, Shop Items & Playable Levels
 * Derived from REA Browser Scenario Evidence:
 * - Landing: ev_00dcb3e5cfeac8358709a2d204b10c6c6e755ffdab4d0d5ca627e95a4e11efdc
 * - World Map (/play): ev_2b8609f187fa7df94e6bdbfab9aff1478b5616f87b5b5369362fa84ed0156858
 * - Kithgard Dungeon (/play/dungeon): ev_5b7fd3f96d2033d27083a4b3f55a3bf758915a70c74be15f8f4652d065db9134
 * - Level Gameplay (/play/level/dungeons-of-kithgard): ev_5054cbf7fe2b61c934df8cf296243865817173ef567713ec56912ce8e0a0b6cd
 */

const HEROES = [
  {
    id: 'tharin',
    name: 'Sir Tharin Thunderfist',
    role: 'Warrior / Knight',
    titleTh: 'อัศวินเกราะเหล็กแห่ง Kithgard',
    hpBonus: 15,
    attackBonus: 4,
    speedBonus: 1.0,
    color: '#e67e22',
    accent: '#f1c40f',
    unlockedByDefault: true,
    cost: 0,
    description: 'A fearless knight with heavy armor and strong melee strikes. Ideal for Kithgard Dungeon and Backwoods Forest.'
  },
  {
    id: 'anya',
    name: 'Captain Anya Weston',
    role: 'Captain / Tactician',
    titleTh: 'กัปตันหญิงผู้ปราดเปรียว',
    hpBonus: 12,
    attackBonus: 5,
    speedBonus: 1.15,
    color: '#3498db',
    accent: '#85c1e9',
    unlockedByDefault: true,
    cost: 0,
    description: 'Balanced warrior with swift movement and tactical precision.'
  },
  {
    id: 'hattori',
    name: 'Hattori Hanzo',
    role: 'Ninja / Assassin',
    titleTh: 'นินจาเงาสังหาร',
    hpBonus: 8,
    attackBonus: 8,
    speedBonus: 1.35,
    color: '#9b59b6',
    accent: '#e74c3c',
    unlockedByDefault: false,
    cost: 150,
    description: 'High-damage shadow striker with fast movement speed and lethal critical strikes.'
  },
  {
    id: 'amara',
    name: 'Amara Arrowhead',
    role: 'Wizard / Arcanist',
    titleTh: 'จอมเวทศรอัคคี',
    hpBonus: 10,
    attackBonus: 7,
    speedBonus: 1.1,
    color: '#1abc9c',
    accent: '#f39c12',
    unlockedByDefault: false,
    cost: 200,
    description: 'Master of arcane magic, ranged fireballs, and algorithmic spellcasting.'
  }
];

const SHOP_ITEMS = [
  {
    id: 'simple-boots',
    name: 'Simple Boots',
    slot: 'boots',
    cost: 0,
    icon: '👢',
    methods: ['hero.moveRight(steps)', 'hero.moveLeft(steps)', 'hero.moveUp(steps)', 'hero.moveDown(steps)'],
    description: 'Grants basic directional movement across dungeon tiles.'
  },
  {
    id: 'compound-boots',
    name: 'Boots of Leaping (XY)',
    slot: 'boots',
    cost: 80,
    icon: '🥾',
    methods: ['hero.moveXY(x, y)', 'hero.wait(steps)'],
    description: 'Enables coordinate-based navigation with hero.moveXY(x, y).'
  },
  {
    id: 'simple-sword',
    name: 'Simple Broadsword',
    slot: 'weapon',
    cost: 0,
    icon: '🗡️',
    methods: ['hero.attack(target)', 'hero.say(message)'],
    description: 'Standard steel sword for attacking named or sensed enemies.'
  },
  {
    id: 'long-sword',
    name: 'Long Sword of Cleaving',
    slot: 'weapon',
    cost: 120,
    icon: '⚔️',
    methods: ['hero.cleave()', 'hero.isReady("cleave")'],
    description: 'Unlocks hero.cleave() to strike all surrounding enemies in a 2-tile radius (+10 DMG).'
  },
  {
    id: 'wooden-shield',
    name: 'Reinforced Oak Shield',
    slot: 'shield',
    cost: 90,
    icon: '🛡️',
    methods: ['hero.shield()'],
    description: 'Unlocks hero.shield() reducing incoming damage by 70% while active (+6 Max HP).'
  },
  {
    id: 'mahogany-glasses',
    name: 'Mahogany Glasses',
    slot: 'glasses',
    cost: 100,
    icon: '👓',
    methods: ['hero.findNearestEnemy()', 'hero.findEnemies()', 'hero.findNearestItem()', 'hero.findItems()', 'hero.distanceTo(target)'],
    description: 'Essential optical lenses for sensing nearby enemies, gems, coins, and distances.'
  },
  {
    id: 'builders-hammer',
    name: "Stone Builder's Hammer",
    slot: 'tool',
    cost: 140,
    icon: '🔨',
    methods: ['hero.buildXY("fire-trap", x, y)', 'hero.buildXY("fence", x, y)'],
    description: 'Allows constructing explosive fire-traps and defensive wooden fences.'
  },
  {
    id: 'arcane-staff',
    name: 'Staff of Fireballs',
    slot: 'magic',
    cost: 180,
    icon: '🪄',
    methods: ['hero.cast("fireball", target)', 'hero.cast("heal", hero)'],
    description: 'Unlocks ranged fireball spells and self-healing magic.'
  }
];

const SPELL_DOCS = {
  'hero.moveRight(steps)': {
    signature: 'hero.moveRight(steps=1)',
    jsSignature: 'hero.moveRight(steps=1);',
    category: 'Movement',
    desc: 'Moves the hero to the right by the specified number of tiles (default 1).',
    descTh: 'เดินไปทางขวาตามจำนวนช่องที่กำหนด (ค่าเริ่มต้น 1 ช่อง)',
    snippetPy: 'hero.moveRight()',
    snippetJs: 'hero.moveRight();'
  },
  'hero.moveLeft(steps)': {
    signature: 'hero.moveLeft(steps=1)',
    jsSignature: 'hero.moveLeft(steps=1);',
    category: 'Movement',
    desc: 'Moves the hero to the left by the specified number of tiles (default 1).',
    descTh: 'เดินไปทางซ้ายตามจำนวนช่องที่กำหนด (ค่าเริ่มต้น 1 ช่อง)',
    snippetPy: 'hero.moveLeft()',
    snippetJs: 'hero.moveLeft();'
  },
  'hero.moveUp(steps)': {
    signature: 'hero.moveUp(steps=1)',
    jsSignature: 'hero.moveUp(steps=1);',
    category: 'Movement',
    desc: 'Moves the hero upward (north) by the specified number of tiles (default 1).',
    descTh: 'เดินขึ้นด้านบนตามจำนวนช่องที่กำหนด (ค่าเริ่มต้น 1 ช่อง)',
    snippetPy: 'hero.moveUp()',
    snippetJs: 'hero.moveUp();'
  },
  'hero.moveDown(steps)': {
    signature: 'hero.moveDown(steps=1)',
    jsSignature: 'hero.moveDown(steps=1);',
    category: 'Movement',
    desc: 'Moves the hero downward (south) by the specified number of tiles (default 1).',
    descTh: 'เดินลงด้านล่างตามจำนวนช่องที่กำหนด (ค่าเริ่มต้น 1 ช่อง)',
    snippetPy: 'hero.moveDown()',
    snippetJs: 'hero.moveDown();'
  },
  'hero.moveXY(x, y)': {
    signature: 'hero.moveXY(x, y)',
    jsSignature: 'hero.moveXY(x, y);',
    category: 'Movement',
    desc: 'Moves the hero directly to tile coordinate (x, y) along shortest walkable path.',
    descTh: 'เดินไปยังพิกัด (x, y) บนแผนที่โดยอัตโนมัติ',
    snippetPy: 'hero.moveXY(5, 3)',
    snippetJs: 'hero.moveXY(5, 3);'
  },
  'hero.attack(target)': {
    signature: 'hero.attack(target)',
    jsSignature: 'hero.attack(target);',
    category: 'Combat',
    desc: 'Moves within melee range and attacks an enemy by name string (e.g. "Brak") or object reference.',
    descTh: 'เดินเข้าไปโจมตีศัตรูด้วยชื่อ (String) หรือตัวแปร Object ศัตรู',
    snippetPy: 'hero.attack(enemy)',
    snippetJs: 'hero.attack(enemy);'
  },
  'hero.cleave()': {
    signature: 'hero.cleave()',
    jsSignature: 'hero.cleave();',
    category: 'Combat',
    desc: 'Swings a massive area-of-effect Whirlwind slash damaging all enemies within 2 tiles.',
    descTh: 'ฟันกวาดรอบตัว สร้างความเสียหายรุนแรงแก่ศัตรูทุกตัวในรัศมี 2 ช่อง',
    snippetPy: 'hero.cleave()',
    snippetJs: 'hero.cleave();'
  },
  'hero.shield()': {
    signature: 'hero.shield()',
    jsSignature: 'hero.shield();',
    category: 'Combat',
    desc: 'Raises shield for 1 turn, reducing all incoming damage by 70%.',
    descTh: 'ยกโล่ตั้งรับเป็นเวลา 1 เทิร์น ลดความเสียหายที่ได้รับลง 70%',
    snippetPy: 'hero.shield()',
    snippetJs: 'hero.shield();'
  },
  'hero.say(message)': {
    signature: 'hero.say(message)',
    jsSignature: 'hero.say(message);',
    category: 'Action',
    desc: 'Speaks a message out loud. Can trigger magic doors, passwords, or allies!',
    descTh: 'พูดข้อความออกมา ใช้สำหรับบอกรหัสผ่านประตูกลหรือเรียกเพื่อนร่วมทีม',
    snippetPy: 'hero.say("Hush")',
    snippetJs: 'hero.say("Hush");'
  },
  'hero.findNearestEnemy()': {
    signature: 'hero.findNearestEnemy()',
    jsSignature: 'hero.findNearestEnemy()',
    category: 'Sensing',
    desc: 'Returns the closest living enemy object, or None/null if no enemy is visible.',
    descTh: 'ค้นหาและคืนค่า Object ของศัตรูที่อยู่ใกล้ที่สุด',
    snippetPy: 'enemy = hero.findNearestEnemy()',
    snippetJs: 'let enemy = hero.findNearestEnemy();'
  },
  'hero.findNearestItem()': {
    signature: 'hero.findNearestItem()',
    jsSignature: 'hero.findNearestItem()',
    category: 'Sensing',
    desc: 'Returns the closest collectible item (gem, coin, or potion) on the map.',
    descTh: 'ค้นหาไอเทม (เพชร, เหรียญทอง, น้ำยา) ที่อยู่ใกล้ที่สุดบนแผนที่',
    snippetPy: 'item = hero.findNearestItem()',
    snippetJs: 'let item = hero.findNearestItem();'
  },
  'hero.findEnemies()': {
    signature: 'hero.findEnemies()',
    jsSignature: 'hero.findEnemies()',
    category: 'Sensing',
    desc: 'Returns an array/list of all living enemies currently on the battlefield.',
    descTh: 'คืนค่ารายการ (Array/List) ของศัตรูทั้งหมดที่ยังมีชีวิตอยู่ในด่าน',
    snippetPy: 'enemies = hero.findEnemies()',
    snippetJs: 'let enemies = hero.findEnemies();'
  },
  'hero.findItems()': {
    signature: 'hero.findItems()',
    jsSignature: 'hero.findItems()',
    category: 'Sensing',
    desc: 'Returns an array/list of all uncollected items on the map.',
    descTh: 'คืนค่ารายการ (Array/List) ของไอเทมทั้งหมดที่ยังไม่ได้เก็บ',
    snippetPy: 'items = hero.findItems()',
    snippetJs: 'let items = hero.findItems();'
  },
  'hero.isReady(action)': {
    signature: 'hero.isReady("cleave")',
    jsSignature: 'hero.isReady("cleave")',
    category: 'Sensing',
    desc: 'Returns True if the special ability cooldown is ready to use.',
    descTh: 'ตรวจสอบว่าสกิลพิเศษ (เช่น "cleave") พร้อมใช้งานหรือยัง',
    snippetPy: 'if hero.isReady("cleave"):',
    snippetJs: 'if (hero.isReady("cleave")) {'
  },
  'hero.distanceTo(target)': {
    signature: 'hero.distanceTo(target)',
    jsSignature: 'hero.distanceTo(target)',
    category: 'Sensing',
    desc: 'Calculates the Euclidean tile distance between the hero and a target.',
    descTh: 'คำนวณระยะห่างระหว่างฮีโร่กับเป้าหมาย',
    snippetPy: 'dist = hero.distanceTo(enemy)',
    snippetJs: 'let dist = hero.distanceTo(enemy);'
  },
  'hero.buildXY(type, x, y)': {
    signature: 'hero.buildXY("fire-trap", x, y)',
    jsSignature: 'hero.buildXY("fire-trap", x, y);',
    category: 'Builder',
    desc: 'Moves to (x, y) and builds a "fire-trap" (explodes on enemy contact) or "fence" (blocks movement).',
    descTh: 'สร้างกับดักระเบิด "fire-trap" หรือรั้วกั้น "fence" ณ พิกัด (x, y)',
    snippetPy: 'hero.buildXY("fire-trap", 6, 3)',
    snippetJs: 'hero.buildXY("fire-trap", 6, 3);'
  },
  'hero.cast(spell, target)': {
    signature: 'hero.cast("fireball", target)',
    jsSignature: 'hero.cast("fireball", target);',
    category: 'Magic',
    desc: 'Casts "fireball" at a distant enemy or "heal" on hero.',
    descTh: 'ร่ายเวทลูกไฟ "fireball" โจมตีระยะไกล หรือ "heal" ฟื้นฟูพลังชีวิต',
    snippetPy: 'hero.cast("fireball", enemy)',
    snippetJs: 'hero.cast("fireball", enemy);'
  }
};

const WORLDS = [
  {
    id: 'dungeon',
    slug: 'dungeon',
    name: 'Kithgard Dungeon',
    nameTh: 'ดันเจี้ยนคิธการ์ด (Kithgard Dungeon)',
    subtitle: 'Escape the dungeon and level up your coding skills!',
    subtitleTh: 'หลบหนีออกจากดันเจี้ยนใต้ดิน เรียนรู้พื้นฐานคำสั่ง ตัวแปร และลูป while!',
    theme: 'dungeon',
    bgGradient: 'linear-gradient(135deg, #1a1c29 0%, #2d1f3d 50%, #141923 100%)',
    accentColor: '#f39c12',
    badgeText: 'CS1: Syntax, Variables & Loops',
    totalCanonicalLevels: 44
  },
  {
    id: 'forest',
    slug: 'forest',
    name: 'Backwoods Forest',
    nameTh: 'ป่าแบ็ควูดส์ (Backwoods Forest)',
    subtitle: 'Outsmart ogres in the forest with conditional logic and procedural thinking!',
    subtitleTh: 'เอาชนะกองทัพยักษ์ Ogre ด้วยตรรกะเงื่อนไข if/else และการสร้างฟังก์ชัน!',
    theme: 'forest',
    bgGradient: 'linear-gradient(135deg, #0f291e 0%, #1e4620 50%, #0d1f18 100%)',
    accentColor: '#2ecc71',
    badgeText: 'CS2: Conditionals, Functions & Events',
    totalCanonicalLevels: 122
  },
  {
    id: 'desert',
    slug: 'desert',
    name: 'Sarven Desert',
    nameTh: 'ทะเลทรายซาร์เวน (Sarven Desert)',
    subtitle: 'Unlock the desert’s mysteries with mathematical calculations and complex conditions.',
    subtitleTh: 'ไขปริศนาแห่งทะเลทรายด้วยการคำนวณพิกัด เงื่อนไขซับซ้อน และการสร้างกับดัก!',
    theme: 'desert',
    bgGradient: 'linear-gradient(135deg, #3d2314 0%, #784212 50%, #2c1810 100%)',
    accentColor: '#e67e22',
    badgeText: 'CS3: Coordinates, Math & Traps',
    totalCanonicalLevels: 97
  },
  {
    id: 'mountain',
    slug: 'mountain',
    name: 'Cloudrip Mountain',
    nameTh: 'หุบเขาคลาวด์ริป (Cloudrip Mountain)',
    subtitle: 'Advance your coding skills by traversing treacherous peaks and data structures.',
    subtitleTh: 'พิชิตยอดเขาหิมะด้วยการจัดการ Array/List การวนลูปข้อมูล และกลยุทธ์การรบ!',
    theme: 'mountain',
    bgGradient: 'linear-gradient(135deg, #1b2631 0%, #2e4053 50%, #17202a 100%)',
    accentColor: '#5dade2',
    badgeText: 'CS4: Arrays, While/For Loops & Tactics',
    totalCanonicalLevels: 115
  },
  {
    id: 'glacier',
    slug: 'glacier',
    name: 'Kelvintaph Glacier',
    nameTh: 'ธารน้ำแข็งเคลวินทาฟ (Kelvintaph Glacier)',
    subtitle: 'Use abstract data structures to solve the glacier’s coolest puzzles.',
    subtitleTh: 'ใช้โครงสร้างข้อมูลขั้นสูง อัลกอริทึม และเวทมนตร์เพื่อไขปริศนาแห่งธารน้ำแข็ง!',
    theme: 'glacier',
    bgGradient: 'linear-gradient(135deg, #0b2545 0%, #134074 50%, #091d36 100%)',
    accentColor: '#00d2ff',
    badgeText: 'CS5: Algorithms, Vectors & Mastery',
    totalCanonicalLevels: 47
  }
];

/**
 * 20 Playable Levels across the 5 Worlds
 * Coordinate system:
 * - Grid width: 12 cols (x: 0..11), height: 8 rows (y: 0..7)
 * - x increases to the right (moveRight -> x + 1)
 * - y increases downward on screen, OR let's make moveUp -> y - 1, moveDown -> y + 1,
 *   and display clear (x, y) coordinates on the grid so students can easily see tile coordinates!
 */
const LEVELS = [
  // ==================== WORLD 1: KITHGARD DUNGEON (8 Levels) ====================
  {
    id: 1,
    slug: 'dungeons-of-kithgard',
    world: 'dungeon',
    number: 1,
    name: 'Dungeons of Kithgard',
    nameTh: 'ดันเจี้ยนแห่งคิธการ์ด',
    concept: 'Basic Syntax & Movement',
    xpReward: 50,
    gemReward: 40,
    mapPos: { x: 14, y: 78 },
    description: 'Grab the gem and escape the dungeon—but don’t run into the spikes! In this first level, learn basic movement commands for your hero.',
    descriptionTh: 'เก็บเพชรและหลบหนีออกจากดันเจี้ยน แต่อย่าเดินชนหนาม! ในด่านแรกนี้ คุณจะได้เรียนรู้คำสั่งเดินพื้นฐานของฮีโร่',
    dialogue: 'Grab the treasure! Follow the hallway without touching the spikes.',
    goals: [
      { id: 'collect-gems', text: 'Collect the gem.', textTh: 'เก็บเพชรให้ครบ' },
      { id: 'survive', text: 'Avoid the spikes.', textTh: 'ห้ามเดินชนหนามและรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# Move towards the gem.\n# Don't touch the spikes!\n# Type your code below and click Run when you're done.\nhero.moveRight(3)\n`,
      javascript: `// Move towards the gem.\n// Don't touch the spikes!\n// Type your code below and click Run when you're done.\nhero.moveRight(3);\n`
    },
    solutionCode: {
      python: `hero.moveRight(3)\nhero.moveDown(3)\nhero.moveRight(3)`,
      javascript: `hero.moveRight(3);\nhero.moveDown(3);\nhero.moveRight(3);`
    },
    optimalLines: 4,
    hints: [
      'Use `hero.moveRight(3)` to move 3 tiles to the right along the upper corridor.',
      'Then use `hero.moveDown(3)` to go down the vertical passage.',
      'Finally, call `hero.moveRight(3)` to grab the glowing cyan gem!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 2 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 },
        { x: 11, y: 1 }, { x: 11, y: 2 }, { x: 11, y: 3 }, { x: 11, y: 4 }, { x: 11, y: 5 }, { x: 11, y: 6 },
        { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 }
      ],
      spikes: [
        { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 },
        { x: 6, y: 2 }, { x: 6, y: 3 },
        { x: 4, y: 5 }, { x: 4, y: 6 }
      ],
      items: [
        { id: 'gem-1', type: 'gem', x: 8, y: 5, value: 1 }
      ],
      enemies: []
    }
  },

  {
    id: 2,
    slug: 'gems-in-the-deep',
    world: 'dungeon',
    number: 2,
    name: 'Gems in the Deep',
    nameTh: 'อัญมณีในห้วงลึก',
    concept: 'Sequencing & Arguments',
    xpReward: 60,
    gemReward: 50,
    mapPos: { x: 24, y: 65 },
    description: 'Quickly collect all the gems scattered in the deep dungeon chambers; you will need them to buy gear!',
    descriptionTh: 'เก็บอัญมณีทั้งหมดที่กระจายอยู่ในห้องโถงใต้ดิน คุณสามารถระบุตัวเลขจำนวนก้าวในวงเล็บได้ เช่น hero.moveRight(4)',
    dialogue: 'Pass a number argument like hero.moveRight(4) to move multiple steps at once!',
    goals: [
      { id: 'collect-gems', text: 'Collect all 3 gems.', textTh: 'เก็บเพชรทั้ง 3 เม็ดให้ครบ' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# Grab all the gems using movement commands.\nhero.moveRight(4)\nhero.moveUp(1)\n`,
      javascript: `// Grab all the gems using movement commands.\nhero.moveRight(4);\nhero.moveUp(1);\n`
    },
    solutionCode: {
      python: `hero.moveRight(4)\nhero.moveUp(1)\nhero.moveRight(3)\nhero.moveDown(4)\nhero.moveLeft(3)`,
      javascript: `hero.moveRight(4);\nhero.moveUp(1);\nhero.moveRight(3);\nhero.moveDown(4);\nhero.moveLeft(3);`
    },
    optimalLines: 6,
    hints: [
      'The first gem is at (6, 2) — already reached after `hero.moveRight(4)` and `hero.moveUp(1)`.',
      'From (6, 2), move right 3 steps to get the second gem at (9, 2).',
      'Then move down 4 steps to (9, 6) and left 3 steps to (6, 6) to collect the final gem!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 3 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 },
        { x: 11, y: 1 }, { x: 11, y: 2 }, { x: 11, y: 3 }, { x: 11, y: 4 }, { x: 11, y: 5 }, { x: 11, y: 6 },
        { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }
      ],
      spikes: [
        { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 8, y: 4 }
      ],
      items: [
        { id: 'gem-1', type: 'gem', x: 6, y: 2, value: 1 },
        { id: 'gem-2', type: 'gem', x: 9, y: 2, value: 1 },
        { id: 'gem-3', type: 'gem', x: 6, y: 6, value: 1 }
      ],
      enemies: []
    }
  },

  {
    id: 3,
    slug: 'true-names',
    world: 'dungeon',
    number: 3,
    name: 'True Names',
    nameTh: 'นามที่แท้จริงของศัตรู',
    concept: 'Strings & Combat Arguments',
    xpReward: 75,
    gemReward: 60,
    mapPos: { x: 35, y: 72 },
    description: 'Learn an enemy’s true name to defeat it! Pass the exact string name of each ogre into hero.attack("Name").',
    descriptionTh: 'เรียนรู้การส่งค่า String (ข้อความในเครื่องหมายคำพูด) เข้าไปในฟังก์ชัน hero.attack("ชื่อศัตรู") เพื่อป้องกันตัวเองจากยักษ์ Brak และ Treg!',
    dialogue: 'Watch your capitalization! Attack "Brak" and "Treg" twice each.',
    goals: [
      { id: 'defeat-all', text: 'Defeat Brak and Treg.', textTh: 'กำจัด Brak และ Treg' },
      { id: 'collect-gems', text: 'Collect the gem.', textTh: 'เก็บเพชร' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)',
      'hero.attack(target)'
    ],
    starterCode: {
      python: `# Defend against "Brak" and "Treg"!\n# You must attack small ogres twice.\nhero.moveRight(2)\nhero.attack("Brak")\nhero.attack("Brak")\n`,
      javascript: `// Defend against "Brak" and "Treg"!\n// You must attack small ogres twice.\nhero.moveRight(2);\nhero.attack("Brak");\nhero.attack("Brak");\n`
    },
    solutionCode: {
      python: `hero.moveRight(2)\nhero.attack("Brak")\nhero.attack("Brak")\nhero.moveRight(3)\nhero.attack("Treg")\nhero.attack("Treg")\nhero.moveRight(2)`,
      javascript: `hero.moveRight(2);\nhero.attack("Brak");\nhero.attack("Brak");\nhero.moveRight(3);\nhero.attack("Treg");\nhero.attack("Treg");\nhero.moveRight(2);`
    },
    optimalLines: 8,
    hints: [
      'Strings are case-sensitive: `"Brak"` and `"Treg"` must start with a capital letter.',
      'After defeating `"Brak"`, move right 3 steps (`hero.moveRight(3)`) and attack `"Treg"` twice.',
      'Finally, move right 2 steps to collect the gem at (9, 4).'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 },
        { x: 11, y: 1 }, { x: 11, y: 2 }, { x: 11, y: 3 }, { x: 11, y: 4 }, { x: 11, y: 5 }, { x: 11, y: 6 },
        { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 9, y: 2 },
        { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 }, { x: 9, y: 6 }
      ],
      spikes: [],
      items: [
        { id: 'gem-1', type: 'gem', x: 9, y: 4, value: 1 }
      ],
      enemies: [
        { id: 'e-brak', name: 'Brak', type: 'munchkin', x: 5, y: 4, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-treg', name: 'Treg', type: 'munchkin', x: 8, y: 4, hp: 12, maxHp: 12, attack: 3 }
      ]
    }
  },

  {
    id: 4,
    slug: 'cell-commentary',
    world: 'dungeon',
    number: 4,
    name: 'Cell Commentary',
    nameTh: 'รหัสลับในห้องขัง',
    concept: 'Comments & hero.say()',
    xpReward: 70,
    gemReward: 55,
    mapPos: { x: 46, y: 58 },
    description: 'Trapped in a prison cell with the famous wizard! Read the comments in the code to find the secret password and open the magic door.',
    descriptionTh: 'ติดอยู่ในห้องขังใต้ดิน! อ่าน Comment ในโค้ดเพื่อหารหัสผ่านลับ แล้วใช้คำสั่ง hero.say() ตะโกนรหัสเพื่อเปิดประตูเวทมนตร์',
    dialogue: 'Say the password "Achoo" to unlock the prison door!',
    goals: [
      { id: 'open-door', text: 'Say the password to open the door.', textTh: 'พูดรหัสผ่านเพื่อเปิดประตู' },
      { id: 'collect-gems', text: 'Collect the gem outside.', textTh: 'เก็บเพชรด้านนอกห้องขัง' }
    ],
    allowedMethods: [
      'hero.say(message)',
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# The wizard says the door password is "Achoo"\n# Use hero.say() to speak the password, then moveUp(4) to get the gem!\nhero.say("What is the password?")\n`,
      javascript: `// The wizard says the door password is "Achoo"\n// Use hero.say() to speak the password, then moveUp(4) to get the gem!\nhero.say("What is the password?");\n`
    },
    solutionCode: {
      python: `hero.say("Achoo")\nhero.moveUp(4)`,
      javascript: `hero.say("Achoo");\nhero.moveUp(4);`
    },
    optimalLines: 3,
    hints: [
      'Read the comment on line 1: the password is `"Achoo"`.',
      'Change `hero.say(...)` to `hero.say("Achoo")` to unlock the door.',
      'Then add `hero.moveUp(4)` to walk through the doorway and grab the gem!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 5, y: 5 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, { x: 7, y: 3 },
        { x: 3, y: 4 }, { x: 7, y: 4 },
        { x: 3, y: 5 }, { x: 7, y: 5 },
        { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }
      ],
      doors: [
        { id: 'cell-door', x: 5, y: 3, password: 'Achoo', hp: 999, locked: true }
      ],
      spikes: [],
      items: [
        { id: 'gem-1', type: 'gem', x: 5, y: 1, value: 1 }
      ],
      enemies: []
    }
  },

  {
    id: 5,
    slug: 'known-enemy',
    world: 'dungeon',
    number: 5,
    name: 'Known Enemy',
    nameTh: 'ศัตรูที่คุ้นเคย (ตัวแปร)',
    concept: 'Variables',
    xpReward: 85,
    gemReward: 65,
    mapPos: { x: 57, y: 70 },
    description: 'Using your first variable to achieve victory! Store enemy names in variables so you don’t have to re-type strings.',
    descriptionTh: 'ใช้ตัวแปร (Variable) ครั้งแรกเพื่อเก็บชื่อของศัตรู แล้วส่งตัวแปรเข้าไปใน hero.attack(enemy1)',
    dialogue: 'Variables act like labeled containers that hold data!',
    goals: [
      { id: 'defeat-all', text: 'Defeat Kratt, Gert, and Ursa.', textTh: 'กำจัด Kratt, Gert และ Ursa ทั้งหมด' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.attack(target)',
      'hero.moveRight(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# You can use a variable like a nametag.\nenemy1 = "Kratt"\nenemy2 = "Gert"\nenemy3 = "Ursa"\n\nhero.attack(enemy1)\nhero.attack(enemy1)\n`,
      javascript: `// You can use a variable like a nametag.\nlet enemy1 = "Kratt";\nlet enemy2 = "Gert";\nlet enemy3 = "Ursa";\n\nhero.attack(enemy1);\nhero.attack(enemy1);\n`
    },
    solutionCode: {
      python: `enemy1 = "Kratt"\nenemy2 = "Gert"\nenemy3 = "Ursa"\nhero.attack(enemy1)\nhero.attack(enemy1)\nhero.attack(enemy2)\nhero.attack(enemy2)\nhero.attack(enemy3)\nhero.attack(enemy3)`,
      javascript: `let enemy1 = "Kratt";\nlet enemy2 = "Gert";\nlet enemy3 = "Ursa";\nhero.attack(enemy1);\nhero.attack(enemy1);\nhero.attack(enemy2);\nhero.attack(enemy2);\nhero.attack(enemy3);\nhero.attack(enemy3);`
    },
    optimalLines: 9,
    hints: [
      'Notice how `enemy1`, `enemy2`, and `enemy3` already store the strings `"Kratt"`, `"Gert"`, and `"Ursa"`.',
      'Pass the variable itself (without quotes!) to `hero.attack(enemy2)` twice.',
      'Then call `hero.attack(enemy3)` twice to defeat Ursa!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 3, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-kratt', name: 'Kratt', type: 'munchkin', x: 5, y: 2, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-gert', name: 'Gert', type: 'munchkin', x: 6, y: 4, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-ursa', name: 'Ursa', type: 'munchkin', x: 5, y: 6, hp: 12, maxHp: 12, attack: 3 }
      ]
    }
  },

  {
    id: 6,
    slug: 'master-of-names',
    world: 'dungeon',
    number: 6,
    name: 'Master of Names',
    nameTh: 'จ้าวแห่งการค้นหาเป้าหมาย',
    concept: 'Sensing with findNearestEnemy()',
    xpReward: 95,
    gemReward: 75,
    mapPos: { x: 68, y: 52 },
    description: 'Use your Mahogany Glasses and hero.findNearestEnemy() to target nameless enemies without knowing their names in advance!',
    descriptionTh: 'คุณไม่รู้ชื่อของศัตรูเหล่านี้! ใช้คำสั่ง hero.findNearestEnemy() เพื่อค้นหาศัตรูที่อยู่ใกล้ที่สุดเก็บไว้ในตัวแปร แล้วสั่งโจมตี',
    dialogue: 'Assign enemy = hero.findNearestEnemy() before attacking each ogre!',
    goals: [
      { id: 'defeat-all', text: 'Defeat all 3 nameless ogres.', textTh: 'กำจัดยักษ์ไร้ชื่อทั้ง 3 ตัว' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.attack(target)',
      'hero.moveRight(steps)'
    ],
    starterCode: {
      python: `# Your hero doesn't know these enemies' names!\n# Use findNearestEnemy() from your glasses.\nenemy1 = hero.findNearestEnemy()\nhero.attack(enemy1)\nhero.attack(enemy1)\n`,
      javascript: `// Your hero doesn't know these enemies' names!\n// Use findNearestEnemy() from your glasses.\nlet enemy1 = hero.findNearestEnemy();\nhero.attack(enemy1);\nhero.attack(enemy1);\n`
    },
    solutionCode: {
      python: `enemy1 = hero.findNearestEnemy()\nhero.attack(enemy1)\nhero.attack(enemy1)\nenemy2 = hero.findNearestEnemy()\nhero.attack(enemy2)\nhero.attack(enemy2)\nenemy3 = hero.findNearestEnemy()\nhero.attack(enemy3)\nhero.attack(enemy3)`,
      javascript: `let enemy1 = hero.findNearestEnemy();\nhero.attack(enemy1);\nhero.attack(enemy1);\nlet enemy2 = hero.findNearestEnemy();\nhero.attack(enemy2);\nhero.attack(enemy2);\nlet enemy3 = hero.findNearestEnemy();\nhero.attack(enemy3);\nhero.attack(enemy3);`
    },
    optimalLines: 9,
    hints: [
      'Once `enemy1` is defeated, call `enemy2 = hero.findNearestEnemy()` to find the next closest living ogre.',
      'Attack `enemy2` twice, then repeat with `enemy3 = hero.findNearestEnemy()`.',
      'Pro tip: You can even use a `while True:` loop to find and attack enemies automatically!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-1', name: 'Ogre #1', type: 'munchkin', x: 4, y: 3, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-2', name: 'Ogre #2', type: 'munchkin', x: 6, y: 5, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-3', name: 'Ogre #3', type: 'munchkin', x: 9, y: 4, hp: 12, maxHp: 12, attack: 3 }
      ]
    }
  },

  {
    id: 7,
    slug: 'fire-dancing',
    world: 'dungeon',
    number: 7,
    name: 'Fire Dancing',
    nameTh: 'ระบำหลบเพลิง (While Loop)',
    concept: 'While True Loops',
    xpReward: 100,
    gemReward: 80,
    mapPos: { x: 78, y: 66 },
    description: 'Save typing (and your hero) with while-true loops! Collect the gems along the corridor with repeating commands.',
    descriptionTh: 'ประหยัดการพิมพ์โค้ดซ้ำๆ ด้วยลูป while True:! โค้ดที่ย่อหน้า (Indent) อยู่ภายในลูปจะทำงานซ้ำไปเรื่อยๆ จนกว่าจะจบด่าน',
    dialogue: 'Put indented movement commands inside while True: to repeat forever!',
    goals: [
      { id: 'collect-gems', text: 'Collect all 4 gems along the hall.', textTh: 'เก็บเพชรทั้ง 4 เม็ด' },
      { id: 'under-lines', text: 'Use 5 lines of code or fewer.', textTh: 'เขียนโค้ดไม่เกิน 5 บรรทัด', maxLines: 5 }
    ],
    allowedMethods: [
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# Code inside a while-true loop will repeat forever!\nwhile True:\n    hero.moveRight(2)\n    # Add a moveDown or moveUp command here:\n    \n`,
      javascript: `// Code inside a while-true loop will repeat forever!\nwhile (true) {\n    hero.moveRight(2);\n    // Add a moveDown or moveUp command here:\n    \n}\n`
    },
    solutionCode: {
      python: `while True:\n    hero.moveRight(2)\n    hero.moveDown(1)`,
      javascript: `while (true) {\n    hero.moveRight(2);\n    hero.moveDown(1);\n}`
    },
    optimalLines: 3,
    hints: [
      'Look at the staircase pattern of gems: each gem is 2 steps right and 1 step down from the previous one!',
      'Inside `while True:`, keep `hero.moveRight(2)` and add `hero.moveDown(1)` right below it.',
      'Make sure both lines inside the loop are indented by 4 spaces!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 1, y: 1 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 1, y: 3 }, { x: 3, y: 4 }, { x: 5, y: 5 }, { x: 7, y: 6 }
      ],
      items: [
        { id: 'gem-1', type: 'gem', x: 3, y: 2, value: 1 },
        { id: 'gem-2', type: 'gem', x: 5, y: 3, value: 1 },
        { id: 'gem-3', type: 'gem', x: 7, y: 4, value: 1 },
        { id: 'gem-4', type: 'gem', x: 9, y: 5, value: 1 }
      ],
      enemies: []
    }
  },

  {
    id: 8,
    slug: 'haunted-kithmaze',
    world: 'dungeon',
    number: 8,
    name: 'Haunted Kithmaze',
    nameTh: 'เขาวงกตผีสิงแห่งคิธการ์ด',
    concept: 'Maze Navigation with Loops',
    xpReward: 120,
    gemReward: 100,
    mapPos: { x: 88, y: 40 },
    description: 'A maze constructed to confuse travelers. Use a while-true loop with a 4-step pattern to escape the Haunted Kithmaze!',
    descriptionTh: 'เขาวงกตโบราณที่มีรูปแบบซ้ำกัน! ใช้ลูป while True: เพื่อสั่งให้ฮีโร่เดินตามจังหวะ ขวา -> ขึ้น -> ขวา -> ลง จนถึงทางออก',
    dialogue: 'Loops are the best way to solve a repeating maze!',
    goals: [
      { id: 'collect-gems', text: 'Collect all 3 gems in the maze.', textTh: 'เก็บเพชรทั้ง 3 เม็ดในเขาวงกต' },
      { id: 'under-lines', text: 'Use 6 lines of code or fewer.', textTh: 'เขียนโค้ดไม่เกิน 6 บรรทัด', maxLines: 6 }
    ],
    allowedMethods: [
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# Loops are a life saver in repeating mazes!\nwhile True:\n    hero.moveRight(2)\n    hero.moveUp(2)\n    # Complete the pattern:\n    \n`,
      javascript: `// Loops are a life saver in repeating mazes!\nwhile (true) {\n    hero.moveRight(2);\n    hero.moveUp(2);\n    // Complete the pattern:\n    \n}\n`
    },
    solutionCode: {
      python: `while True:\n    hero.moveRight(2)\n    hero.moveUp(2)\n    hero.moveRight(2)\n    hero.moveDown(2)`,
      javascript: `while (true) {\n    hero.moveRight(2);\n    hero.moveUp(2);\n    hero.moveRight(2);\n    hero.moveDown(2);\n}`
    },
    optimalLines: 5,
    hints: [
      'The maze zig-zags: Right 2, Up 2, Right 2, Down 2.',
      'Add `hero.moveRight(2)` and `hero.moveDown(2)` inside the `while True:` block.',
      'When the loop repeats, it will navigate the second zig-zag automatically!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 1, y: 5 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 5 }, { x: 4, y: 4 },
        { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 8, y: 5 }, { x: 8, y: 4 }
      ],
      spikes: [],
      items: [
        { id: 'gem-1', type: 'gem', x: 3, y: 3, value: 1 },
        { id: 'gem-2', type: 'gem', x: 5, y: 5, value: 1 },
        { id: 'gem-3', type: 'gem', x: 9, y: 5, value: 1 }
      ],
      enemies: []
    }
  },

  // ==================== WORLD 2: BACKWOODS FOREST (4 Levels) ====================
  {
    id: 9,
    slug: 'defense-of-plainswood',
    world: 'forest',
    number: 9,
    name: 'Defense of Plainswood',
    nameTh: 'ศึกปกป้องหมู่บ้านเพลนส์วูด',
    concept: 'If Statements & Builder Hammer',
    xpReward: 130,
    gemReward: 110,
    mapPos: { x: 20, y: 70 },
    description: 'Build defensive fences or fire-traps to protect the villagers of Plainswood from invading ogres!',
    descriptionTh: 'ใช้ค้อนก่อสร้าง hero.buildXY("fire-trap", x, y) เพื่อวางกับดักระเบิดสกัดกั้นกองทัพ Ogre ที่กำลังบุกเข้ามา!',
    dialogue: 'Build fire-traps at (5, 3) and (5, 5) to blast the approaching ogres!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the invading ogres.', textTh: 'กำจัดยักษ์ Ogre ที่บุกเข้ามาทั้งหมด' },
      { id: 'survive', text: 'Protect the village and survive.', textTh: 'ปกป้องหมู่บ้านและรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.buildXY(type, x, y)',
      'hero.moveXY(x, y)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)',
      'hero.attack(target)'
    ],
    starterCode: {
      python: `# Build two "fire-trap"s on the forest path!\nhero.buildXY("fire-trap", 5, 3)\n# Build the second "fire-trap" at (5, 5):\n\n`,
      javascript: `// Build two "fire-trap"s on the forest path!\nhero.buildXY("fire-trap", 5, 3);\n// Build the second "fire-trap" at (5, 5):\n\n`
    },
    solutionCode: {
      python: `hero.buildXY("fire-trap", 5, 3)\nhero.buildXY("fire-trap", 5, 5)\nhero.moveXY(2, 4)`,
      javascript: `hero.buildXY("fire-trap", 5, 3);\nhero.buildXY("fire-trap", 5, 5);\nhero.moveXY(2, 4);`
    },
    optimalLines: 4,
    hints: [
      'Call `hero.buildXY("fire-trap", 5, 3)` first.',
      'Then call `hero.buildXY("fire-trap", 5, 5)` to trap the bottom lane.',
      'The patrols will march into your fire-traps and explode!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 3, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 6 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-scout1', name: 'Gor', type: 'munchkin', x: 8, y: 3, hp: 16, maxHp: 16, attack: 4, patrolLeft: true },
        { id: 'e-scout2', name: 'Zug', type: 'munchkin', x: 10, y: 5, hp: 16, maxHp: 16, attack: 4, patrolLeft: true }
      ]
    }
  },

  {
    id: 10,
    slug: 'woodland-cleaver',
    world: 'forest',
    number: 10,
    name: 'Woodland Cleaver',
    nameTh: 'ดาบผ่าพงไพร (If / Else & Cleave)',
    concept: 'If / Else & Cooldowns',
    xpReward: 150,
    gemReward: 120,
    mapPos: { x: 42, y: 55 },
    description: 'Use your new Long Sword ability hero.cleave() when it is ready, otherwise use regular hero.attack(enemy)!',
    descriptionTh: 'ใช้เงื่อนไข if hero.isReady("cleave"): เพื่อใช้ท่าฟันกวาดรอบตัวเมื่อพร้อมใช้งาน และใช้ else: เพื่อโจมตีปกติ!',
    dialogue: 'Check if hero.isReady("cleave"): before cleaving the swarm!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the swarm of 4 Forest Munchkins.', textTh: 'กำจัดฝูง Munchkin ทั้ง 4 ตัว' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.attack(target)',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `# Use your new "cleave" skill as often as you can.\nhero.moveXY(6, 4)\nwhile True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            # Cleave them!\n            hero.cleave()\n        else:\n            # Otherwise, normal attack:\n            \n`,
      javascript: `// Use your new "cleave" skill as often as you can.\nhero.moveXY(6, 4);\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            // Otherwise, normal attack:\n            \n        }\n    }\n}\n`
    },
    solutionCode: {
      python: `hero.moveXY(6, 4)\nwhile True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.attack(enemy)`,
      javascript: `hero.moveXY(6, 4);\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.attack(enemy);\n        }\n    }\n}`
    },
    optimalLines: 9,
    hints: [
      '`hero.cleave()` deals massive damage to all enemies within 2 tiles, then goes on cooldown.',
      'Inside the `else:` branch, add `hero.attack(enemy)` so your hero keeps fighting while cleave recharges.'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 3, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-m1', name: 'Munchkin A', type: 'munchkin', x: 6, y: 3, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-m2', name: 'Munchkin B', type: 'munchkin', x: 7, y: 4, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-m3', name: 'Munchkin C', type: 'munchkin', x: 6, y: 5, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-m4', name: 'Brute', type: 'ogre', x: 9, y: 4, hp: 22, maxHp: 22, attack: 5 }
      ]
    }
  },

  {
    id: 11,
    slug: 'peasant-protection',
    world: 'forest',
    number: 11,
    name: 'Peasant Protection',
    nameTh: 'ปกป้องชาวบ้านด้วยระยะทาง',
    concept: 'hero.distanceTo() & Comparisons',
    xpReward: 165,
    gemReward: 135,
    mapPos: { x: 65, y: 62 },
    description: 'Only attack enemies that come closer than 5 tiles! If you chase distant enemies, the peasant will be left undefended.',
    descriptionTh: 'ใช้คำสั่ง hero.distanceTo(enemy) < 5 เพื่อตรวจสอบระยะห่าง โจมตีเฉพาะศัตรูที่เข้ามาใกล้และเก็บเพชรที่อยู่รอบฐาน!',
    dialogue: 'Check if hero.distanceTo(enemy) < 5 before attacking!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the ambush ogres.', textTh: 'กำจัดยักษ์ซุ่มโจมตี' },
      { id: 'collect-gems', text: 'Collect both forest gems.', textTh: 'เก็บเพชรทั้ง 2 เม็ด' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.distanceTo(target)',
      'hero.attack(target)',
      'hero.findNearestItem()',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy and hero.distanceTo(enemy) < 6:\n        hero.attack(enemy)\n    else:\n        item = hero.findNearestItem()\n        if item:\n            # Move to item.x and item.y:\n            \n`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy && hero.distanceTo(enemy) < 6) {\n        hero.attack(enemy);\n    } else {\n        let item = hero.findNearestItem();\n        if (item) {\n            // Move to item.x and item.y:\n            \n        }\n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy and hero.distanceTo(enemy) < 6:\n        hero.attack(enemy)\n    else:\n        item = hero.findNearestItem()\n        if item:\n            hero.moveXY(item.x, item.y)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy && hero.distanceTo(enemy) < 6) {\n        hero.attack(enemy);\n    } else {\n        let item = hero.findNearestItem();\n        if (item) {\n            hero.moveXY(item.x, item.y);\n        }\n    }\n}`
    },
    optimalLines: 9,
    hints: [
      'Each item returned by `hero.findNearestItem()` has `.x` and `.y` coordinates.',
      'Inside `if item:`, call `hero.moveXY(item.x, item.y)` to collect the gem!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 4, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [
        { id: 'gem-1', type: 'gem', x: 3, y: 2, value: 1 },
        { id: 'gem-2', type: 'gem', x: 8, y: 5, value: 1 }
      ],
      enemies: [
        { id: 'e-1', name: 'Stalker', type: 'munchkin', x: 6, y: 3, hp: 14, maxHp: 14, attack: 4 },
        { id: 'e-2', name: 'Raider', type: 'munchkin', x: 7, y: 5, hp: 14, maxHp: 14, attack: 4 }
      ]
    }
  },

  {
    id: 12,
    slug: 'village-champion',
    world: 'forest',
    number: 12,
    name: 'Village Champion',
    nameTh: 'แชมเปี้ยนแห่งพงไพร (Custom Functions)',
    concept: 'Defining Functions (def / function)',
    xpReward: 180,
    gemReward: 150,
    mapPos: { x: 85, y: 45 },
    description: 'Define your own reusable function cleaveOrAttack() to patrol all three forest clearings cleanly!',
    descriptionTh: 'สร้างฟังก์ชันของคุณเองด้วยคำสั่ง def cleaveOrAttack(): เพื่อนำโค้ดการต่อสู้กลับมาใช้ซ้ำในแต่ละจุดลาดตระเวน!',
    dialogue: 'Modularize your combat logic inside a custom function!',
    goals: [
      { id: 'defeat-all', text: 'Clear all 3 ogre camps.', textTh: 'กำจัดค่าย Ogre ทั้ง 3 จุด' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.attack(target)',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `def cleaveOrAttack():\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.attack(enemy)\n            hero.attack(enemy)\n\nhero.moveXY(4, 2)\ncleaveOrAttack()\nhero.moveXY(6, 5)\ncleaveOrAttack()\n# Move to (9, 3) and call cleaveOrAttack():\n`,
      javascript: `function cleaveOrAttack() {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.attack(enemy);\n            hero.attack(enemy);\n        }\n    }\n}\n\nhero.moveXY(4, 2);\ncleaveOrAttack();\nhero.moveXY(6, 5);\ncleaveOrAttack();\n// Move to (9, 3) and call cleaveOrAttack():\n`
    },
    solutionCode: {
      python: `def cleaveOrAttack():\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.attack(enemy)\n            hero.attack(enemy)\n\nhero.moveXY(4, 2)\ncleaveOrAttack()\nhero.moveXY(6, 5)\ncleaveOrAttack()\nhero.moveXY(9, 3)\ncleaveOrAttack()`,
      javascript: `function cleaveOrAttack() {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.attack(enemy);\n            hero.attack(enemy);\n        }\n    }\n}\n\nhero.moveXY(4, 2);\ncleaveOrAttack();\nhero.moveXY(6, 5);\ncleaveOrAttack();\nhero.moveXY(9, 3);\ncleaveOrAttack();`
    },
    optimalLines: 15,
    hints: [
      'The function `cleaveOrAttack()` is already defined at the top.',
      'Add `hero.moveXY(9, 3)` and then call `cleaveOrAttack()` to clear the final camp!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 2 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-c1', name: 'Camp 1 Ogre', type: 'munchkin', x: 5, y: 2, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-c2', name: 'Camp 2 Ogre', type: 'munchkin', x: 7, y: 5, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-c3', name: 'Camp 3 Warlord', type: 'ogre', x: 10, y: 3, hp: 16, maxHp: 16, attack: 4 }
      ]
    }
  },

  // ==================== WORLD 3: SARVEN DESERT (3 Levels) ====================
  {
    id: 13,
    slug: 'sarven-road',
    world: 'desert',
    number: 13,
    name: 'Sarven Road',
    nameTh: 'เส้นทางสายทะเลทรายซาร์เวน',
    concept: 'Coordinate Math & While Loops',
    xpReward: 190,
    gemReward: 160,
    mapPos: { x: 25, y: 65 },
    description: 'Travel northeast across the scorching Sarven Road while defeating desert bandits along the oasis route!',
    descriptionTh: 'เดินทางผ่านเส้นทางทะเลทรายโดยคำนวณพิกัด x, y ที่เพิ่มขึ้นทีละก้าว และกำจัดโจรทะเลทรายที่ขวางทาง!',
    dialogue: 'Attack any nearest enemy, otherwise increment x and y to march across the desert!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the desert bandits.', textTh: 'กำจัดโจรทะเลทรายทั้งหมด' },
      { id: 'collect-gems', text: 'Reach the oasis gem at (9, 2).', textTh: 'เก็บเพชรที่โอเอซิส (9, 2)' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.attack(target)',
      'hero.moveXY(x, y)',
      'hero.moveRight(steps)',
      'hero.moveUp(steps)'
    ],
    starterCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        hero.attack(enemy)\n    else:\n        # Move right 2 and up 1 towards the oasis:\n        hero.moveRight(2)\n        \n`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        hero.attack(enemy);\n    } else {\n        // Move right 2 and up 1 towards the oasis:\n        hero.moveRight(2);\n        \n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        hero.attack(enemy)\n    else:\n        hero.moveRight(2)\n        hero.moveUp(1)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        hero.attack(enemy);\n    } else {\n        hero.moveRight(2);\n        hero.moveUp(1);\n    }\n}`
    },
    optimalLines: 8,
    hints: [
      'When no enemy is left alive, move 2 steps right and 1 step up.',
      'Add `hero.moveUp(1)` right after `hero.moveRight(2)` in the `else:` block.'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 1, y: 6 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 2, y: 2 }, { x: 8, y: 6 }
      ],
      items: [
        { id: 'gem-1', type: 'gem', x: 7, y: 4, value: 1 },
        { id: 'gem-2', type: 'gem', x: 9, y: 3, value: 1 }
      ],
      enemies: [
        { id: 'e-b1', name: 'Sand Raider', type: 'thrower', x: 4, y: 5, hp: 14, maxHp: 14, attack: 4 },
        { id: 'e-b2', name: 'Dune Stalker', type: 'munchkin', x: 6, y: 3, hp: 16, maxHp: 16, attack: 4 }
      ]
    }
  },

  {
    id: 14,
    slug: 'oasis-gold-rush',
    world: 'desert',
    number: 14,
    name: 'Oasis Gold Rush',
    nameTh: 'ตื่นทองกลางโอเอซิส (Value Filtering)',
    concept: 'Item Properties & Priority Logic',
    xpReward: 210,
    gemReward: 180,
    mapPos: { x: 55, y: 50 },
    description: 'Collect treasure worth at least 10 gold by prioritizing high-value gems and gold coins across the desert oasis!',
    descriptionTh: 'เก็บสมบัติให้ได้มูลค่ารวมอย่างน้อย 10 เหรียญ โดยใช้ hero.findNearestItem() และเดินไปยังพิกัด item.x, item.y!',
    dialogue: 'Collect every gem and gold coin in the oasis!',
    goals: [
      { id: 'collect-gems', text: 'Collect all 5 oasis treasures.', textTh: 'เก็บสมบัติทั้ง 5 ชิ้นในโอเอซิส' },
      { id: 'survive', text: 'Avoid the desert sand-spikes.', textTh: 'หลีกเลี่ยงหนามทะเลทราย' }
    ],
    allowedMethods: [
      'hero.findNearestItem()',
      'hero.moveXY(x, y)',
      'hero.findNearestEnemy()',
      'hero.attack(target)'
    ],
    starterCode: {
      python: `while True:\n    item = hero.findNearestItem()\n    if item:\n        # Move to the item's x and y coordinates:\n        hero.moveXY(item.x, item.y)\n`,
      javascript: `while (true) {\n    let item = hero.findNearestItem();\n    if (item) {\n        // Move to the item's x and y coordinates:\n        hero.moveXY(item.x, item.y);\n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        hero.attack(enemy)\n    item = hero.findNearestItem()\n    if item:\n        hero.moveXY(item.x, item.y)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        hero.attack(enemy);\n    }\n    let item = hero.findNearestItem();\n    if (item) {\n        hero.moveXY(item.x, item.y);\n    }\n}`
    },
    optimalLines: 8,
    hints: [
      'Watch out! There is a Desert Ogre guarding the oasis.',
      'Check `enemy = hero.findNearestEnemy()` and `if enemy: hero.attack(enemy)` before collecting the items!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 5, y: 1 }, { x: 5, y: 6 }
      ],
      items: [
        { id: 'coin-1', type: 'coin', x: 4, y: 2, value: 2 },
        { id: 'gem-1', type: 'gem', x: 7, y: 2, value: 3 },
        { id: 'coin-2', type: 'coin', x: 6, y: 4, value: 2 },
        { id: 'gem-2', type: 'gem', x: 9, y: 3, value: 3 },
        { id: 'gem-3', type: 'gem', x: 8, y: 5, value: 3 }
      ],
      enemies: [
        { id: 'e-guard', name: 'Oasis Guard', type: 'ogre', x: 5, y: 4, hp: 18, maxHp: 18, attack: 4 }
      ]
    }
  },

  {
    id: 15,
    slug: 'sandstorm-siege',
    world: 'desert',
    number: 15,
    name: 'Sandstorm Siege',
    nameTh: 'พายุทรายถล่มป้อม',
    concept: 'Compound Boolean Logic (and / or)',
    xpReward: 230,
    gemReward: 190,
    mapPos: { x: 82, y: 42 },
    description: 'Combine cleave, shield, and ranged fireballs using compound boolean conditions to survive the Sandstorm Siege!',
    descriptionTh: 'ผสมผสานการใช้สกิล cleave, attack และการเก็บน้ำยาฟื้นพลังเพื่อเอาชีวิตรอดจากศึกพายุทราย!',
    dialogue: 'Use cleave when ready, otherwise attack the nearest enemy!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the Sandstorm Warband.', textTh: 'กำจัดกองทัพพายุทรายทั้งหมด' },
      { id: 'collect-gems', text: 'Collect the sacred desert gem.', textTh: 'เก็บเพชรศักดิ์สิทธิ์แห่งทะเลทราย' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.findNearestItem()',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.attack(target)',
      'hero.shield()',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.attack(enemy)\n    elif item:\n        # Collect the item:\n        \n`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.attack(enemy);\n        }\n    } else if (item) {\n        // Collect the item:\n        \n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.attack(enemy)\n    elif item:\n        hero.moveXY(item.x, item.y)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.attack(enemy);\n        }\n    } else if (item) {\n        hero.moveXY(item.x, item.y);\n    }\n}`
    },
    optimalLines: 11,
    hints: [
      'In the `elif item:` branch, call `hero.moveXY(item.x, item.y)` to pick up the potion and gem after enemies fall.'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 4, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [
        { id: 'pot-1', type: 'potion', x: 2, y: 4, value: 1 },
        { id: 'gem-1', type: 'gem', x: 10, y: 4, value: 1 }
      ],
      enemies: [
        { id: 'e-s1', name: 'Dune Cleaver', type: 'munchkin', x: 5, y: 3, hp: 14, maxHp: 14, attack: 4 },
        { id: 'e-s2', name: 'DuneBasher', type: 'munchkin', x: 5, y: 5, hp: 14, maxHp: 14, attack: 4 },
        { id: 'e-s3', name: 'Desert Chieftain', type: 'ogre', x: 8, y: 4, hp: 24, maxHp: 24, attack: 5 }
      ]
    }
  },

  // ==================== WORLD 4: CLOUDRIP MOUNTAIN (3 Levels) ====================
  {
    id: 16,
    slug: 'mountain-mercenaries',
    world: 'mountain',
    number: 16,
    name: 'Mountain Mercenaries',
    nameTh: 'ทหารรับจ้างแห่งหุบเขา (Arrays & For Loops)',
    concept: 'Arrays / Lists & Iteration',
    xpReward: 250,
    gemReward: 210,
    mapPos: { x: 28, y: 66 },
    description: 'Iterate through the array returned by hero.findEnemies() using a for-loop to eliminate every mountain ogre!',
    descriptionTh: 'ใช้ hero.findEnemies() เพื่อดึงรายการศัตรูทั้งหมดเป็น Array/List แล้วใช้ลูป for enemy in enemies: ไล่โจมตีทีละตัว!',
    dialogue: 'Loop over enemies = hero.findEnemies() to defeat the whole pack!',
    goals: [
      { id: 'defeat-all', text: 'Defeat all Mountain Ogres using array iteration.', textTh: 'กำจัดยักษ์ภูเขาทั้งหมดด้วยการวนลูป Array' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findEnemies()',
      'hero.attack(target)',
      'hero.cleave()',
      'hero.isReady(action)'
    ],
    starterCode: {
      python: `enemies = hero.findEnemies()\nfor enemy in enemies:\n    # Attack each enemy twice:\n    hero.attack(enemy)\n    \n`,
      javascript: `let enemies = hero.findEnemies();\nfor (let enemy of enemies) {\n    // Attack each enemy twice:\n    hero.attack(enemy);\n    \n}\n`
    },
    solutionCode: {
      python: `enemies = hero.findEnemies()\nfor enemy in enemies:\n    hero.attack(enemy)\n    hero.attack(enemy)`,
      javascript: `let enemies = hero.findEnemies();\nfor (let enemy of enemies) {\n    hero.attack(enemy);\n    hero.attack(enemy);\n}`
    },
    optimalLines: 5,
    hints: [
      '`hero.findEnemies()` returns an array of all living enemies.',
      'Inside the `for enemy in enemies:` loop, call `hero.attack(enemy)` a second time so each 12-HP enemy is defeated!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-m1', name: 'Frost Scout 1', type: 'munchkin', x: 4, y: 2, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-m2', name: 'Frost Scout 2', type: 'munchkin', x: 6, y: 5, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-m3', name: 'Frost Scout 3', type: 'munchkin', x: 8, y: 2, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-m4', name: 'Frost Scout 4', type: 'munchkin', x: 9, y: 5, hp: 12, maxHp: 12, attack: 3 }
      ]
    }
  },

  {
    id: 17,
    slug: 'cloudrip-treasure',
    world: 'mountain',
    number: 17,
    name: 'Cloudrip Treasure',
    nameTh: 'ขุมทรัพย์บนยอดเมฆา (Array Indexing)',
    concept: 'For-Loops over Items Array',
    xpReward: 270,
    gemReward: 230,
    mapPos: { x: 58, y: 48 },
    description: 'Use hero.findItems() and a for-loop to sweep every gem from the icy ridges of Cloudrip Mountain!',
    descriptionTh: 'ดึงรายการสมบัติทั้งหมดด้วย items = hero.findItems() แล้ววนลูปเดินเก็บทุกชิ้นบนสันเขา!',
    dialogue: 'Iterate over hero.findItems() and moveXY to each item!',
    goals: [
      { id: 'collect-gems', text: 'Collect all 5 Mountain Gems.', textTh: 'เก็บเพชรภูเขาทั้ง 5 เม็ด' },
      { id: 'survive', text: 'Avoid the icy crevasse spikes.', textTh: 'หลีกเลี่ยงหนามน้ำแข็ง' }
    ],
    allowedMethods: [
      'hero.findItems()',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `items = hero.findItems()\nfor item in items:\n    # Move to each item's x and y:\n    \n`,
      javascript: `let items = hero.findItems();\nfor (let item of items) {\n    // Move to each item's x and y:\n    \n}\n`
    },
    solutionCode: {
      python: `items = hero.findItems()\nfor item in items:\n    hero.moveXY(item.x, item.y)`,
      javascript: `let items = hero.findItems();\nfor (let item of items) {\n    hero.moveXY(item.x, item.y);\n}`
    },
    optimalLines: 4,
    hints: [
      'Inside the `for item in items:` loop, call `hero.moveXY(item.x, item.y)` to visit every gem in order.'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 1, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 4, y: 4 }, { x: 7, y: 4 }
      ],
      items: [
        { id: 'g-1', type: 'gem', x: 3, y: 2, value: 1 },
        { id: 'g-2', type: 'gem', x: 3, y: 6, value: 1 },
        { id: 'g-3', type: 'gem', x: 6, y: 2, value: 1 },
        { id: 'g-4', type: 'gem', x: 6, y: 6, value: 1 },
        { id: 'g-5', type: 'gem', x: 9, y: 4, value: 1 }
      ],
      enemies: []
    }
  },

  {
    id: 18,
    slug: 'the-skeleton-king',
    world: 'mountain',
    number: 18,
    name: 'The Skeleton King',
    nameTh: 'ราชาโครงกระดูกยักษ์ (Boss Battle)',
    concept: 'Tactical Combat & Spells',
    xpReward: 300,
    gemReward: 260,
    mapPos: { x: 84, y: 38 },
    description: 'A giant skeleton! Its sword is very blunt, but very heavy. Combine cleave, fireball spells, and healing potions to defeat the Skeleton King!',
    descriptionTh: 'ศึกตัดสินกับราชาโครงกระดูกยักษ์! ใช้ทั้งเวทลูกไฟ fireball, ท่าฟันกวาด cleave และการโจมตีต่อเนื่องเพื่อโค่นบอส!',
    dialogue: 'Unleash fireballs and cleave attacks to bring down the Skeleton King!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the Skeleton King and his guards.', textTh: 'โค่นราชาโครงกระดูกและทหารองครักษ์' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.cast(spell, target)',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.attack(target)',
      'hero.shield()'
    ],
    starterCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.cast("fireball", enemy)\n            # Follow up with hero.attack(enemy):\n            \n`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.cast("fireball", enemy);\n            // Follow up with hero.attack(enemy):\n            \n        }\n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.cast("fireball", enemy)\n            hero.attack(enemy)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.cast("fireball", enemy);\n            hero.attack(enemy);\n        }\n    }\n}`
    },
    optimalLines: 9,
    hints: [
      'Add `hero.attack(enemy)` after `hero.cast("fireball", enemy)` to deal maximum combined damage each round!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-sk1', name: 'Bone Guard 1', type: 'skeleton', x: 5, y: 3, hp: 16, maxHp: 16, attack: 4 },
        { id: 'e-sk2', name: 'Bone Guard 2', type: 'skeleton', x: 5, y: 5, hp: 16, maxHp: 16, attack: 4 },
        { id: 'e-boss', name: 'Skeleton King', type: 'skeleton-boss', x: 8, y: 4, hp: 36, maxHp: 36, attack: 6 }
      ]
    }
  },

  // ==================== WORLD 5: KELVINTAPH GLACIER (2 Levels) ====================
  {
    id: 19,
    slug: 'kelvintaph-cipher',
    world: 'glacier',
    number: 19,
    name: 'Kelvintaph Cipher',
    nameTh: 'รหัสลับธารน้ำแข็งเคลวินทาฟ',
    concept: 'Multi-Stage Puzzle & Doors',
    xpReward: 340,
    gemReward: 300,
    mapPos: { x: 38, y: 58 },
    description: 'Solve the glacier vault cipher: speak the Ice Gate password, defeat the Frost Guardian, and claim the Glacier Crystal!',
    descriptionTh: 'ไขปริศนาป้อมปราการน้ำแข็ง: พูดรหัสผ่าน "Frost" เพื่อเปิดประตูน้ำแข็ง สังหารผู้พิทักษ์ และเก็บผลึกน้ำแข็ง!',
    dialogue: 'Say "Frost" to open the Glacier Gate, defeat the guardian, and take the crystal!',
    goals: [
      { id: 'open-door', text: 'Unlock the Glacier Gate with password "Frost".', textTh: 'ปลดล็อกประตูน้ำแข็งด้วยรหัส "Frost"' },
      { id: 'defeat-all', text: 'Defeat the Frost Guardian.', textTh: 'กำจัดผู้พิทักษ์น้ำแข็ง' },
      { id: 'collect-gems', text: 'Claim the Glacier Crystal.', textTh: 'เก็บผลึกน้ำแข็ง' }
    ],
    allowedMethods: [
      'hero.say(message)',
      'hero.findNearestEnemy()',
      'hero.cast(spell, target)',
      'hero.attack(target)',
      'hero.findNearestItem()',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `# 1. Speak "Frost" to open the gate\nhero.say("Frost")\n# 2. Defeat the Frost Guardian and collect the crystal:\nenemy = hero.findNearestEnemy()\nif enemy:\n    hero.cast("fireball", enemy)\n    hero.attack(enemy)\n    hero.attack(enemy)\n`,
      javascript: `// 1. Speak "Frost" to open the gate\nhero.say("Frost");\n// 2. Defeat the Frost Guardian and collect the crystal:\nlet enemy = hero.findNearestEnemy();\nif (enemy) {\n    hero.cast("fireball", enemy);\n    hero.attack(enemy);\n    hero.attack(enemy);\n}\n`
    },
    solutionCode: {
      python: `hero.say("Frost")\nenemy = hero.findNearestEnemy()\nif enemy:\n    hero.cast("fireball", enemy)\n    hero.attack(enemy)\n    hero.attack(enemy)\nitem = hero.findNearestItem()\nif item:\n    hero.moveXY(item.x, item.y)`,
      javascript: `hero.say("Frost");\nlet enemy = hero.findNearestEnemy();\nif (enemy) {\n    hero.cast("fireball", enemy);\n    hero.attack(enemy);\n    hero.attack(enemy);\n}\nlet item = hero.findNearestItem();\nif (item) {\n    hero.moveXY(item.x, item.y);\n}`
    },
    optimalLines: 9,
    hints: [
      'After defeating the Frost Guardian, find the crystal with `item = hero.findNearestItem()`.',
      'Then move to it with `hero.moveXY(item.x, item.y)`!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 5 }, { x: 5, y: 6 }
      ],
      doors: [
        { id: 'ice-gate', x: 5, y: 4, password: 'Frost', hp: 999, locked: true }
      ],
      spikes: [],
      items: [
        { id: 'gem-crystal', type: 'gem', x: 9, y: 4, value: 5 }
      ],
      enemies: [
        { id: 'e-guardian', name: 'Frost Guardian', type: 'ogre', x: 7, y: 4, hp: 24, maxHp: 24, attack: 5 }
      ]
    }
  },

  {
    id: 20,
    slug: 'kelvintaph-grandmaster',
    world: 'glacier',
    number: 20,
    name: 'Kelvintaph Grandmaster',
    nameTh: 'ปรมาจารย์แห่งเคลวินทาฟ (Capstone Challenge)',
    concept: 'Full Algorithm Synthesis',
    xpReward: 500,
    gemReward: 400,
    mapPos: { x: 76, y: 40 },
    description: 'The ultimate CodeCombat Capstone trial! Combine sensing, spellcasting, cleaving, and treasure collection in a single autonomous algorithm.',
    descriptionTh: 'บททดสอบสุดท้ายของ CodeCombat! เขียนอัลกอริทึมอัตโนมัติที่ผสานการค้นหาศัตรู ร่ายเวท ฟันกวาด และเก็บสมบัติทั้งหมดในลูปเดียว!',
    dialogue: 'Write a complete autonomous hero AI loop to conquer Kelvintaph Glacier!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the Kelvintaph Warlord & Warlocks.', textTh: 'กำจัดจอมทัพและจอมเวทน้ำแข็งทั้งหมด' },
      { id: 'collect-gems', text: 'Collect all 4 Grandmaster Gems.', textTh: 'เก็บเพชรปรมาจารย์ทั้ง 4 เม็ด' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.findNearestItem()',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.cast(spell, target)',
      'hero.attack(target)',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `# Capstone Challenge: Conquer the Glacier!\nwhile True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.cast("fireball", enemy)\n            hero.attack(enemy)\n    elif item:\n        # Move to item coordinates:\n        \n`,
      javascript: `// Capstone Challenge: Conquer the Glacier!\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.cast("fireball", enemy);\n            hero.attack(enemy);\n        }\n    } else if (item) {\n        // Move to item coordinates:\n        \n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.cast("fireball", enemy)\n            hero.attack(enemy)\n    elif item:\n        hero.moveXY(item.x, item.y)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.cast("fireball", enemy);\n            hero.attack(enemy);\n        }\n    } else if (item) {\n        hero.moveXY(item.x, item.y);\n    }\n}`
    },
    optimalLines: 12,
    hints: [
      'Complete the `elif item:` branch with `hero.moveXY(item.x, item.y)`.',
      'Your hero will first eliminate every enemy using cleave & fireball, then automatically collect all 4 gems!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 6, y: 1 }, { x: 6, y: 6 }
      ],
      items: [
        { id: 'gm-1', type: 'gem', x: 3, y: 2, value: 2 },
        { id: 'gm-2', type: 'gem', x: 3, y: 6, value: 2 },
        { id: 'gm-3', type: 'gem', x: 9, y: 2, value: 2 },
        { id: 'gm-4', type: 'gem', x: 10, y: 5, value: 2 }
      ],
      enemies: [
        { id: 'e-g1', name: 'Glacier Witch', type: 'thrower', x: 5, y: 3, hp: 16, maxHp: 16, attack: 4 },
        { id: 'e-g2', name: 'Ice Brute', type: 'ogre', x: 5, y: 5, hp: 20, maxHp: 20, attack: 5 },
        { id: 'e-g3', name: 'Kelvintaph Warlord', type: 'skeleton-boss', x: 8, y: 4, hp: 38, maxHp: 38, attack: 6 }
      ]
    }
  },

  // ==================== EXPANDED LEVELS (Levels 21 - 25) ====================
  {
    id: 21,
    slug: 'kithgard-vault',
    world: 'dungeon',
    number: 21,
    name: 'Kithgard Vault',
    nameTh: 'ห้องนิรภัยแห่งคิธการ์ด',
    concept: 'Vault Passwords & Spikes',
    xpReward: 120,
    gemReward: 90,
    mapPos: { x: 92, y: 68 },
    description: 'Speak the secret password "Sesame" to unlock the ancient vault door, defeat the Vault Guard, and collect the gems while avoiding lethal floor spikes!',
    descriptionTh: 'พูดรหัสผ่าน "Sesame" เพื่อปลดล็อกประตูห้องนิรภัย กำจัดยามเฝ้าห้อง และเดินไปเก็บเพชรโดยระวังกับดักหนาม!',
    dialogue: 'Say "Sesame" to open the vault gate, strike the guard, and grab the gems!',
    goals: [
      { id: 'open-door', text: 'Unlock the Vault Gate with password "Sesame".', textTh: 'ปลดล็อกประตูห้องนิรภัยด้วยรหัส "Sesame"' },
      { id: 'defeat-all', text: 'Defeat the Vault Guard.', textTh: 'กำจัดยามเฝ้าห้องนิรภัย' },
      { id: 'collect-gems', text: 'Collect all gems inside the vault.', textTh: 'เก็บเพชรทั้งหมดในห้องนิรภัย' },
      { id: 'survive', text: 'Avoid the lethal floor spikes.', textTh: 'ฮีโร่ต้องรอดชีวิตและไม่เหยียบหนาม' }
    ],
    allowedMethods: [
      'hero.say(message)',
      'hero.attack(target)',
      'hero.moveRight(steps)',
      'hero.moveLeft(steps)',
      'hero.moveUp(steps)',
      'hero.moveDown(steps)'
    ],
    starterCode: {
      python: `# Say the secret password "Sesame" to open the Vault Gate:\nhero.say("Sesame")\n# Defeat the Vault Guard and collect the treasure:\n`,
      javascript: `// Say the secret password "Sesame" to open the Vault Gate:\nhero.say("Sesame");\n// Defeat the Vault Guard and collect the treasure:\n`
    },
    solutionCode: {
      python: `hero.say("Sesame")\nhero.attack("Vault Guard")\nhero.moveRight(5)`,
      javascript: `hero.say("Sesame");\nhero.attack("Vault Guard");\nhero.moveRight(5);`
    },
    optimalLines: 4,
    hints: [
      'Call `hero.say("Sesame")` to unlock the vault door.',
      'Call `hero.attack("Vault Guard")` to defeat the sentry.',
      'Then call `hero.moveRight(5)` to march safely down the corridor and pick up both gems!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 5 }, { x: 4, y: 6 }
      ],
      doors: [
        { id: 'vault-door', x: 4, y: 4, password: 'Sesame', locked: true }
      ],
      spikes: [
        { x: 6, y: 3 }, { x: 7, y: 3 }, { x: 8, y: 3 }, { x: 9, y: 3 },
        { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 }
      ],
      items: [
        { id: 'gem-vault-1', type: 'gem', x: 7, y: 4, value: 2 },
        { id: 'gem-vault-2', type: 'gem', x: 9, y: 4, value: 2 }
      ],
      enemies: [
        { id: 'e-vault-guard', name: 'Vault Guard', type: 'munchkin', x: 6, y: 4, hp: 12, maxHp: 12, attack: 3 }
      ]
    }
  },

  {
    id: 22,
    slug: 'backwoods-ambush',
    world: 'forest',
    number: 22,
    name: 'Backwoods Ambush',
    nameTh: 'การซุ่มโจมตีในป่าแบ็ควูดส์',
    concept: 'While Loops & Cleave Cooldowns',
    xpReward: 180,
    gemReward: 150,
    mapPos: { x: 88, y: 72 },
    description: 'Surrounded by ogres in the deep forest! Use a while-true loop to check if cleave is ready. When ready, cleave the pack; otherwise, attack with your sword!',
    descriptionTh: 'ถูกล้อมด้วยฝูงโอเกอร์ในป่าลึก! ใช้ลูป while-true ตรวจสอบว่าสกิล cleave พร้อมใช้งานหรือไม่ ถ้าพร้อมให้ cleave มิฉะนั้นให้ฟันด้วยดาบ!',
    dialogue: 'Check hero.isReady("cleave") to cleave when ready, or attack normally!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the ambushing ogres.', textTh: 'กำจัดกองทัพโอเกอร์ที่ซุ่มโจมตี' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.attack(target)'
    ],
    starterCode: {
      python: `# Defeat the ambushing ogres using cleave when ready!\nwhile True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        # Check if cleave is ready; if so, cleave! Otherwise attack:\n        \n`,
      javascript: `// Defeat the ambushing ogres using cleave when ready!\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        // Check if cleave is ready; if so, cleave! Otherwise attack:\n        \n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.attack(enemy)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.attack(enemy);\n        }\n    }\n}`
    },
    optimalLines: 12,
    hints: [
      'Inside the loop, find the nearest enemy with `enemy = hero.findNearestEnemy()`.',
      'Check `if hero.isReady("cleave"):` to trigger `hero.cleave()`.',
      'In the `else:` branch, call `hero.attack(enemy)`!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 5, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [],
      items: [],
      enemies: [
        { id: 'e-ogre1', name: 'Scout Ogre', type: 'munchkin', x: 4, y: 3, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-ogre2', name: 'Brawler Ogre', type: 'munchkin', x: 6, y: 3, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-ogre3', name: 'Chieftain Ogre', type: 'ogre', x: 5, y: 6, hp: 26, maxHp: 26, attack: 4 }
      ]
    }
  },

  {
    id: 23,
    slug: 'mirage-canyon',
    world: 'desert',
    number: 23,
    name: 'Mirage Canyon',
    nameTh: 'หุบผาภาพลวงตาแห่งซาร์เวน',
    concept: 'Conditionals & Coordinate Sensing',
    xpReward: 240,
    gemReward: 200,
    mapPos: { x: 84, y: 66 },
    description: 'Navigate the treacherous canyon! Use if-elif logic to prioritize attacking enemies first, and once the coast is clear, navigate to and gather all desert gems.',
    descriptionTh: 'ลุยผ่านหุบผาอันตราย! ใช้เงื่อนไข if-elif จัดการศัตรูก่อนเป็นอันดับแรก และเมื่อไม่มีศัตรูให้เดินเก็บเพชรทะเลทรายทั้งหมด',
    dialogue: 'Prioritize enemies with if enemy, and collect items with elif item!',
    goals: [
      { id: 'defeat-all', text: 'Defeat the canyon ambushers.', textTh: 'กำจัดศัตรูในหุบผา' },
      { id: 'collect-gems', text: 'Collect all desert gems.', textTh: 'เก็บเพชรทะเลทรายทั้งหมด' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findNearestEnemy()',
      'hero.findNearestItem()',
      'hero.attack(target)',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `# Clear the canyon of enemies and gather all desert gems:\nwhile True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        hero.attack(enemy)\n    elif item:\n        # Move to item coordinates:\n        \n`,
      javascript: `// Clear the canyon of enemies and gather all desert gems:\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        hero.attack(enemy);\n    } else if (item) {\n        // Move to item coordinates:\n        \n    }\n}\n`
    },
    solutionCode: {
      python: `while True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        hero.attack(enemy)\n    elif item:\n        hero.moveXY(item.x, item.y)`,
      javascript: `while (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        hero.attack(enemy);\n    } else if (item) {\n        hero.moveXY(item.x, item.y);\n    }\n}`
    },
    optimalLines: 12,
    hints: [
      'Sense both `enemy = hero.findNearestEnemy()` and `item = hero.findNearestItem()`.',
      'If `enemy` exists, attack it with `hero.attack(enemy)`.',
      'Else if `item` exists, move to it using `hero.moveXY(item.x, item.y)`!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 10, y: 1 }, { x: 2, y: 6 }, { x: 10, y: 6 }
      ],
      items: [
        { id: 'gem-mc-1', type: 'gem', x: 9, y: 4, value: 2 },
        { id: 'gem-mc-2', type: 'gem', x: 9, y: 2, value: 2 },
        { id: 'gem-mc-3', type: 'gem', x: 5, y: 2, value: 2 }
      ],
      enemies: [
        { id: 'e-mc1', name: 'Sand Scout', type: 'thrower', x: 5, y: 4, hp: 13, maxHp: 13, attack: 3 },
        { id: 'e-mc2', name: 'Dune Raider', type: 'munchkin', x: 7, y: 4, hp: 13, maxHp: 13, attack: 3 }
      ]
    }
  },

  {
    id: 24,
    slug: 'summit-defender',
    world: 'mountain',
    number: 24,
    name: 'Summit Defender',
    nameTh: 'ผู้พิทักษ์ยอดเขาคลาวด์ริป',
    concept: 'Functions & Array Iteration',
    xpReward: 300,
    gemReward: 250,
    mapPos: { x: 84, y: 64 },
    description: 'Defend the summit using structured programming! Define a custom helper function to defeat an enemy, then iterate over hero.findEnemies() to protect the mountain.',
    descriptionTh: 'ปกป้องยอดเขาด้วยการเขียนโปรแกรมเชิงโครงสร้าง! นิยามฟังก์ชันช่วยกำจัดศัตรู แล้ววนลูปรายการศัตรูจาก hero.findEnemies() เพื่อปราบผู้บุกรุกทั้งหมด',
    dialogue: 'Define a function defeatEnemy(enemy) and call it in a for-loop!',
    goals: [
      { id: 'defeat-all', text: 'Defeat all summit invaders using a custom function.', textTh: 'กำจัดศัตรูบนยอดเขาด้วยฟังก์ชันที่สร้างขึ้น' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.findEnemies()',
      'hero.attack(target)'
    ],
    starterCode: {
      python: `# Define a function to eliminate a single enemy:\ndef defeatEnemy(enemy):\n    hero.attack(enemy)\n\n# Find all summit invaders:\nenemies = hero.findEnemies()\nfor enemy in enemies:\n    # Call your function to defeat each enemy:\n    \n`,
      javascript: `// Define a function to eliminate a single enemy:\nfunction defeatEnemy(enemy) {\n    hero.attack(enemy);\n}\n\n// Find all summit invaders:\nlet enemies = hero.findEnemies();\nfor (let enemy of enemies) {\n    // Call your function to defeat each enemy:\n    \n}\n`
    },
    solutionCode: {
      python: `def defeatEnemy(enemy):\n    hero.attack(enemy)\n\nenemies = hero.findEnemies()\nfor enemy in enemies:\n    defeatEnemy(enemy)`,
      javascript: `function defeatEnemy(enemy) {\n    hero.attack(enemy);\n}\nlet enemies = hero.findEnemies();\nfor (let enemy of enemies) {\n    defeatEnemy(enemy);\n}`
    },
    optimalLines: 9,
    hints: [
      'Functions encapsulate reusable actions: `def defeatEnemy(enemy): hero.attack(enemy)`.',
      'Loop over each enemy in `enemies` and invoke `defeatEnemy(enemy)`!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 }
      ],
      spikes: [
        { x: 5, y: 1 }, { x: 5, y: 6 }
      ],
      items: [],
      enemies: [
        { id: 'e-sd1', name: 'Summit Scout', type: 'munchkin', x: 5, y: 3, hp: 12, maxHp: 12, attack: 3 },
        { id: 'e-sd2', name: 'Peak Shaman', type: 'thrower', x: 7, y: 4, hp: 12, maxHp: 12, attack: 4 },
        { id: 'e-sd3', name: 'Glacier Raider', type: 'skeleton', x: 9, y: 3, hp: 12, maxHp: 12, attack: 4 }
      ]
    }
  },

  {
    id: 25,
    slug: 'glacier-citadel',
    world: 'glacier',
    number: 25,
    name: 'Glacier Citadel',
    nameTh: 'ป้อมปราการธารน้ำแข็ง',
    concept: 'Advanced Tactics & Citadel Siege',
    xpReward: 600,
    gemReward: 500,
    mapPos: { x: 88, y: 62 },
    description: 'The ultimate siege on Kelvintaph Citadel! Speak "Avalanche" to unlock the Citadel Gate, eliminate guards with fireball, cleave, and sword strikes, and harvest the ancient citadel gems.',
    descriptionTh: 'การปิดล้อมป้อมปราการเคลวินทาฟขั้นสูงสุด! พูด "Avalanche" เพื่อเปิดประตูป้อมปราการ กำจัดยามด้วยลูกไฟ ฟันกวาด และดาบ จากนั้นเก็บเพชรโบราณทั้งหมด',
    dialogue: 'Speak "Avalanche" to breach the gate, eliminate the guards, and secure the citadel gems!',
    goals: [
      { id: 'open-door', text: 'Speak password "Avalanche" to unlock the Citadel Gate.', textTh: 'พูดรหัสผ่าน "Avalanche" เพื่อเปิดประตูเมืองน้ำแข็ง' },
      { id: 'defeat-all', text: 'Defeat all Citadel defenders.', textTh: 'กำจัดผู้พิทักษ์ป้อมปราการทั้งหมด' },
      { id: 'collect-gems', text: 'Collect all Glacier Citadel gems.', textTh: 'เก็บเพชรแห่งป้อมน้ำแข็งทั้งหมด' },
      { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
    ],
    allowedMethods: [
      'hero.say(message)',
      'hero.findNearestEnemy()',
      'hero.findNearestItem()',
      'hero.isReady(action)',
      'hero.cleave()',
      'hero.cast(spell, target)',
      'hero.attack(target)',
      'hero.moveXY(x, y)'
    ],
    starterCode: {
      python: `# Speak "Avalanche" to unlock the Citadel Gate, then fight and collect:\nhero.say("Avalanche")\nwhile True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.cast("fireball", enemy)\n            hero.attack(enemy)\n    elif item:\n        # Move to the gem:\n        \n`,
      javascript: `// Speak "Avalanche" to unlock the Citadel Gate, then fight and collect:\nhero.say("Avalanche");\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.cast("fireball", enemy);\n            hero.attack(enemy);\n        }\n    } else if (item) {\n        // Move to the gem:\n        \n    }\n}\n`
    },
    solutionCode: {
      python: `hero.say("Avalanche")\nwhile True:\n    enemy = hero.findNearestEnemy()\n    item = hero.findNearestItem()\n    if enemy:\n        if hero.isReady("cleave"):\n            hero.cleave()\n        else:\n            hero.cast("fireball", enemy)\n            hero.attack(enemy)\n    elif item:\n        hero.moveXY(item.x, item.y)`,
      javascript: `hero.say("Avalanche");\nwhile (true) {\n    let enemy = hero.findNearestEnemy();\n    let item = hero.findNearestItem();\n    if (enemy) {\n        if (hero.isReady("cleave")) {\n            hero.cleave();\n        } else {\n            hero.cast("fireball", enemy);\n            hero.attack(enemy);\n        }\n    } else if (item) {\n        hero.moveXY(item.x, item.y);\n    }\n}`
    },
    optimalLines: 14,
    hints: [
      'First, call `hero.say("Avalanche")` to open the Citadel Gate.',
      'Inside your combat loop, check `if hero.isReady("cleave"): hero.cleave()`.',
      'Otherwise, cast fireball and attack with `hero.attack(enemy)`.',
      'When all enemies fall, collect each remaining gem with `hero.moveXY(item.x, item.y)`!'
    ],
    grid: {
      width: 12,
      height: 8,
      heroStart: { x: 2, y: 4 },
      walls: [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 }, { x: 8, y: 0 }, { x: 9, y: 0 }, { x: 10, y: 0 }, { x: 11, y: 0 },
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 }, { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 11, y: 7 },
        { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 5 }, { x: 4, y: 6 }
      ],
      doors: [
        { id: 'citadel-gate', x: 4, y: 4, password: 'Avalanche', locked: true }
      ],
      spikes: [
        { x: 7, y: 2 }, { x: 7, y: 6 }
      ],
      items: [
        { id: 'gem-citadel-1', type: 'gem', x: 9, y: 2, value: 3 },
        { id: 'gem-citadel-2', type: 'gem', x: 9, y: 6, value: 3 }
      ],
      enemies: [
        { id: 'e-cit1', name: 'Citadel Guard', type: 'munchkin', x: 6, y: 4, hp: 14, maxHp: 14, attack: 3 },
        { id: 'e-cit2', name: 'Frost Sorcerer', type: 'thrower', x: 8, y: 4, hp: 16, maxHp: 16, attack: 4 }
      ]
    }
  }
];

// O(1) lookup maps (REA Optimization: single normalized producer index)
const LEVEL_BY_SLUG = new Map(LEVELS.map(l => [l.slug, l]));
const HERO_BY_ID = new Map(HEROES.map(h => [h.id, h]));
const ITEM_BY_ID = new Map(SHOP_ITEMS.map(i => [i.id, i]));
const WORLD_BY_SLUG = new Map(WORLDS.map(w => [w.slug, w]));

module.exports = {
  HEROES,
  SHOP_ITEMS,
  SPELL_DOCS,
  WORLDS,
  LEVELS,
  LEVEL_BY_SLUG,
  HERO_BY_ID,
  ITEM_BY_ID,
  WORLD_BY_SLUG
};
