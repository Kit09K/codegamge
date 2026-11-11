# คู่มือการออกแบบและเขียนโค้ดสร้างด่านใหม่ (Level Creation Guide for Subagents — Gemini Flash 3.8)

เอกสารนี้จัดทำขึ้นสำหรับ AI Subagent (**Gemini 3.8 Flash**) และนักพัฒนา เพื่ออธิบายสถาปัตยกรรมของ **CodeCombat Local Edition** อย่างละเอียดตั้งแต่ต้นจนจบ เพื่อให้สามารถเพิ่มด่านใหม่เข้าไปใน [`src/data/curriculum.js`](file:///Users/kit/codegame/src/data/curriculum.js) ได้อย่างถูกต้อง 100% โดยไม่ทำให้ระบบ Simulation Engine, ตัวแปลงภาษา Python/JS (Transpiler), หรือระบบแสดงผล Canvas พัง

---

## 1. ภาพรวมการทำงานของระบบด่าน (How Levels Work End-to-End)

1. **ไฟล์เก็บข้อมูลด่านทั้งหมด**: [`src/data/curriculum.js`](file:///Users/kit/codegame/src/data/curriculum.js) ในตัวแปรอาร์เรย์ `LEVELS`
2. **การสร้างดัชนีอัตโนมัติ**: ท้ายไฟล์ `src/data/curriculum.js` จะนำ `LEVELS` ไปสร้าง `LEVEL_BY_SLUG = new Map(...)` โดยอัตโนมัติ
3. **เอนจินจำลองการรบ**: [`src/engine/simulator.js`](file:///Users/kit/codegame/src/engine/simulator.js) (`simulateLevel()`) จะอ่านโครงสร้าง `level.grid`, `level.goals`, และรันโค้ดของผู้เล่นใน Sandbox (`MAX_TICKS = 90`)
4. **ตัวแปลงภาษา Python -> JS**: [`src/engine/transpiler.js`](file:///Users/kit/codegame/src/engine/transpiler.js) แปลงโค้ด Python (`while True:`, `if`, `elif`, `else`, `def`, `for`) ให้เป็น JavaScript ก่อนรันใน `simulator.js`
5. **ชุดทดสอบความถูกต้องอัตโนมัติ**: [`tests/verify.js`](file:///Users/kit/codegame/tests/verify.js) จะวนลูปรัน **ทุกด่านใน `LEVELS`** ทั้งภาษา **Python** (ด้วยฮีโร่ `tharin` ที่มี `attackPower = 6 + 4 + 3 = 13`, `maxHp = 15 + 15 + 6 = 36`) และภาษา **JavaScript** (ด้วยฮีโร่ `anya` ที่มี `attackPower = 6 + 5 + 3 = 14`, `maxHp = 15 + 12 + 6 = 33`) โดยใช้โค้ดใน `level.solutionCode.python` และ `level.solutionCode.javascript`
   - **กฎเหล็ก**: ด่านที่เพิ่มใหม่ทุกด่าน **ต้องผ่าน `node tests/verify.js` ทั้งภาษา Python และ JavaScript (ได้ `victory: true`) 100%!**

---

## 2. โครงสร้าง Schema ของด่าน 1 ด่าน (Level Object Schema)

ทุกด่านในอาร์เรย์ `LEVELS` ในไฟล์ [`src/data/curriculum.js`](file:///Users/kit/codegame/src/data/curriculum.js) ต้องมีโครงสร้างครบทุกฟิลด์ดังนี้:

```javascript
{
  id: 21, // ตัวเลขเรียงลำดับไม่ซ้ำกัน (ต่อจากด่านสุดท้าย เช่น 21, 22, 23, 24, 25)
  slug: 'unique-kebab-case-slug', // ชื่ออ้างอิงภาษาอังกฤษตัวพิมพ์เล็กคั่นด้วยขีดกลาง ห้ามซ้ำเด็ดขาด!
  world: 'dungeon', // เลือก 1 จาก 5 โลก: 'dungeon' | 'forest' | 'desert' | 'mountain' | 'glacier'
  number: 21, // หมายเลขด่านตรงกับ id (เช่น 21, 22, 23, 24, 25)
  name: 'English Level Title',
  nameTh: 'ชื่อด่านภาษาไทย',
  concept: 'Programming Concept (e.g. Loops & Conditionals)',
  xpReward: 200, // ค่าประสบการณ์เมื่อผ่านด่าน
  gemReward: 160, // เพชรที่ได้เมื่อผ่านด่าน
  mapPos: { x: 52, y: 35 }, // พิกัดจุดด่านบนแผนที่โลก (x: 12 ถึง 90, y: 20 ถึง 80) อย่าให้ทับกับด่านเดิมใน world เดียวกัน!
  description: 'English explanation of the mission and what code to write.',
  descriptionTh: 'คำอธิบายภารกิจภาษาไทยที่ชัดเจน บอกว่าต้องใช้คำสั่งอะไรและทำอะไร',
  dialogue: 'Short one-sentence hint shown in the bottom banner.',
  goals: [
    // เลือกใส่เฉพาะ Goal ID ที่ระบบรองรับ (ดูตารางด้านล่าง)
    { id: 'defeat-all', text: 'Defeat all enemies.', textTh: 'กำจัดศัตรูทั้งหมด' },
    { id: 'collect-gems', text: 'Collect all gems.', textTh: 'เก็บเพชรทั้งหมด' },
    { id: 'survive', text: 'Your hero must survive.', textTh: 'ฮีโร่ต้องรอดชีวิต' }
  ],
  allowedMethods: [
    // ต้องตรงกับคีย์ใน SPELL_DOCS เท่านั้น!
    'hero.moveXY(x, y)',
    'hero.findNearestEnemy()',
    'hero.attack(target)'
  ],
  starterCode: {
    python: `# โค้ดตั้งต้นภาษา Python สำหรับผู้เล่น\n`,
    javascript: `// โค้ดตั้งต้นภาษา JavaScript สำหรับผู้เล่น\n`
  },
  solutionCode: {
    python: `# โค้ดเฉลยภาษา Python ที่รันผ่านด่านได้จริง 100%`,
    javascript: `// โค้ดเฉลยภาษา JavaScript ที่รันผ่านด่านได้จริง 100%`
  },
  optimalLines: 8, // จำนวนบรรทัดโค้ดที่เหมาะสมสำหรับได้ 3 ดาว (ควร >= จำนวนบรรทัดจริงของ solutionCode)
  hints: [
    'คำใบ้ข้อที่ 1',
    'คำใบ้ข้อที่ 2'
  ],
  grid: {
    width: 12,  // ต้องเป็น 12 เสมอ
    height: 8,  // ต้องเป็น 8 เสมอ (พิกัด x: 0..11, y: 0..7)
    heroStart: { x: 2, y: 4 },
    walls: [ ... ],
    spikes: [ ... ],
    doors: [ ... ], // (ใส่หรือไม่ใส่ก็ได้)
    items: [ ... ],
    enemies: [ ... ]
  }
}
```

---

## 3. กฎสำคัญของ `goals` (Goal IDs ที่ `simulator.js` รองรับ)

ใน `src/engine/simulator.js` ฟังก์ชัน `evaluateGoals()` รองรับ `goal.id` เฉพาะ **5 ประเภทนี้เท่านั้น**:

| `goal.id` | เงื่อนไขการผ่าน (`passed = true`) | ข้อควรระวัง |
| :--- | :--- | :--- |
| `'collect-gems'` | เก็บไอเทมทุกชิ้นที่มี `type: 'gem'` หรือ `type: 'coin'` ใน `grid.items` จนครบ | ถ้าใส่ Goal นี้ ต้องมีอย่างน้อย 1 `gem` หรือ `coin` ใน `grid.items` และเส้นทางต้องเดินไปเก็บได้จริง! |
| `'defeat-all'` | ศัตรูทุกตัวใน `grid.enemies` มี `hp <= 0` | ถ้าใส่ Goal นี้ ต้องมีศัตรูใน `grid.enemies` และ `solutionCode` ต้องโจมตีจนตายครบทุกตัวก่อนครบ 90 Ticks |
| `'open-door'` | ประตูทุกบานใน `grid.doors` มีสถานะ `locked === false` | เปิดประตูได้ด้วยการเดินไปใกล้ประตู (ระยะ `<= 3.5` ช่อง) แล้วเรียก `hero.say("รหัสผ่าน")` หรือพังประตูด้วย `hero.attack("Door")` |
| `'survive'` | `hero.hp > 0` และ **ห้ามเหยียบกับดักหนามเด็ดขาด (`!hero.hitSpike`)** | **สำคัญมาก**: หากฮีโร่เดินผ่านช่องที่มี `spikes` แม้แต่ก้าวเดียว `hero.hitSpike` จะกลายเป็น `true` ทันที และทำให้ Goal `'survive'` ล้มเหลว (`passed: false`) แม้เลือดจะยังไม่หมดก็ตาม! |
| `'under-lines'` | จำนวนบรรทัดโค้ดที่ไม่ใช่คอมเมนต์/บรรทัดว่าง `<= goal.maxLines` | ถ้าใช้ Goal นี้ ต้องระบุฟิลด์ `maxLines: N` และตรวจให้แน่ใจว่าทั้ง `solutionCode.python` และ `solutionCode.javascript` (ซึ่งมีบรรทัด `}` ปิดบล็อกด้วย) มีจำนวนบรรทัดไม่เกิน `maxLines`! |

> **⚠️ ข้อควรระวังเรื่องเวลาหยุดเกมอัตโนมัติ (`areDynamicGoalsComplete`)**:
> ทันทีที่ทุก Goal (ยกเว้น `under-lines`) เป็น `true` พร้อมกัน เกมจะจบและชนะทันทีใน Tick นั้น!
> ดังนั้น หากด่านมีเฉพาะ Goal `'survive'` อย่างเดียวโดยไม่มี `'collect-gems'`, `'defeat-all'`, หรือ `'open-door'` เกมจะชนะตั้งแต่ก้าวแรกทันที! **ทุกด่านจึงต้องมีอย่างน้อย 1 Goal ภารกิจหลัก (`'collect-gems'`, `'defeat-all'`, หรือ `'open-door'`) เสมอ**

---

## 4. กฎของแผนที่ (`grid`) และกลไกการเคลื่อนที่ใน `simulator.js`

1. **ขนาดแผนที่มาตรฐาน**:
   - `width: 12` (พิกัด `x` ตั้งแต่ `0` ถึง `11`)
   - `height: 8` (พิกัด `y` ตั้งแต่ `0` ถึง `7`)
   - แนะนำให้ใส่กำแพงขอบบน (`y: 0`, `x: 0..11`) และขอบล่าง (`y: 7`, `x: 0..11`) เหมือนด่านอื่นๆ เพื่อความสวยงาม
2. **การทำงานของ `hero.moveXY(x, y)` (สำคัญมาก!)**:
   - `hero.moveXY(tx, ty)` เดินทีละ 1 ช่องเข้าหา `(tx, ty)` โดยเลี่ยง `walls` และ `spikes` เฉพาะก้าวถัดไปแบบ Greedy (พยายามลดระยะ `dx` ก่อน ถ้าติดกำแพงหรือหนามจึงลด `dy`) **ไม่ใช่ BFS Pathfinding เต็มรูปแบบ!**
   - **ดังนั้น**: อย่าวาง `walls` หรือ `spikes` ขวางกั้นเป็นรูปตัว U หรือวางขวางเส้นทางตรงระหว่างจุดที่ฮีโร่ยืนอยู่กับเป้าหมายของ `moveXY(x, y)` เพราะฮีโร่อาจติดกำแพงแล้วเดินไม่ถึงเป้าหมายภายใน 90 Ticks!
   - หากมีกำแพงกั้นเป็นห้องหรือทางเลี้ยว ให้สั่ง `hero.moveXY(x1, y1)` ไปที่จุดหัวมุม/ทางเชื่อมก่อน แล้วค่อย `hero.moveXY(x2, y2)` หรือใช้ `hero.moveRight()`, `hero.moveUp()`
3. **ประเภทของ `items` ที่รองรับและมี Sprite แสดงผลใน `renderer.js`**:
   - `{ id: 'gem-1', type: 'gem', x: 5, y: 3, value: 1 }` (เพชร — นับใน `collect-gems`)
   - `{ id: 'coin-1', type: 'coin', x: 6, y: 4, value: 2 }` (เหรียญทอง — นับใน `collect-gems`)
   - `{ id: 'pot-1', type: 'potion', x: 4, y: 4, value: 1 }` (น้ำยาเพิ่มเลือด `+10 HP` เมื่อเดินเหยียบ — ไม่นับใน `collect-gems`)
4. **ประเภทของ `enemies` ที่รองรับและมีอนิเมชัน Sprite ใน `renderer.js`**:
   - `type: 'munchkin'` (Goblin ตัวเล็ก — แนะนำ `hp: 12..18`, `attack: 3..4`)
   - `type: 'thrower'` (Orc Shaman — แนะนำ `hp: 14..18`, `attack: 4`)
   - `type: 'ogre'` (Ogre ยักษ์ — แนะนำ `hp: 20..28`, `attack: 5`)
   - `type: 'skeleton'` (โครงกระดูก — แนะนำ `hp: 15..20`, `attack: 4`)
   - `type: 'skeleton-boss'` (บอสใหญ่ Big Demon — แนะนำ `hp: 32..42`, `attack: 6`)
   - ฟิลด์พิเศษ: `patrolLeft: true` — ถ้าใส่ไว้ ศัตรูจะเดินไปทางซ้าย (`x - 1`) เมื่อมีการวาง `fire-trap` ในแถว `y` เดียวกัน หรือหลังจากผ่านไป 5 Ticks (เหยียบ `fire-trap` แล้วโดนระเบิด `-25 HP`)
5. **ความแรงของการโจมตีและสกิลของฮีโร่ (เพื่อคำนวณ HP ศัตรูให้พอดี)**:
   - ในชุดทดสอบ `tests/verify.js`:
     - `tharin` (Python) มี `attackPower = 13`, `maxHp = 36`
     - `anya` (JavaScript) มี `attackPower = 14`, `maxHp = 33`
   - `hero.attack(target)`: เดินเข้าประชิดศัตรูอัตโนมัติแล้วฟัน `1 ครั้ง` สร้างความเสียหายเท่ากับ `hero.attackPower` (`13` หรือ `14` ดาเมจ)
     - **ข้อควรระวัง**: ถ้าเขียนโค้ดแบบไม่ใช้ลูป เช่น เรียก `hero.attack(enemy)` 2 ครั้งติดกัน จะทำดาเมจรวม `26` (สำหรับ Tharin) และ `28` (สำหรับ Anya) ดังนั้นถ้าไม่ได้อยู่ในลูป `while True:` ควรตั้ง `hp` ของศัตรูให้ทั้ง Tharin (`13 DMG/hit`) และ Anya (`14 DMG/hit`) ตีตายในจำนวนครั้งที่เท่ากัน (เช่น `hp: 12` ตี 1 ครั้งตายทั้งคู่, หรือ `hp: 24` ตี 2 ครั้งตายทั้งคู่)
     - ถ้าอยู่ในลูป `while True:` ที่เช็ก `enemy = hero.findNearestEnemy()` แล้ว `hero.attack(enemy)` ระบบจะตีซ้ำจนกว่าศัตรูจะตายเองโดยอัตโนมัติ!
   - `hero.cleave()`: สร้างความเสียหาย `hero.attackPower + 10` (`23` หรือ `24` ดาเมจ) ให้ศัตรูทุกตัวในรัศมี `<= 2.6` ช่อง และติด Cooldown `3` Ticks
   - `hero.cast("fireball", target)`: ยิงลูกไฟระยะไกล (รัศมี `<= 6.5` ช่อง) สร้างความเสียหาย `18` ดาเมจ
   - `hero.cast("heal", hero)`: ฟื้นฟูเลือดให้ตัวเอง `+12 HP`
   - `hero.buildXY("fire-trap", x, y)`: เดินไปใกล้จุด `(x, y)` แล้ววางกับดักระเบิด (เมื่อศัตรูเดินเข้าใกล้รัศมี `<= 1.1` ช่อง จะระเบิดทำดาเมจ `25 HP`)

---

## 5. รายชื่อ `allowedMethods` ที่อนุญาตให้ใช้ (ต้องตรงกับ `SPELL_DOCS` เท่านั้น)

เลือกใส่ใน `allowedMethods` เฉพาะสตริงที่ตรงกับรายการนี้ทุกตัวอักษร:
- `'hero.moveRight(steps)'`
- `'hero.moveLeft(steps)'`
- `'hero.moveUp(steps)'`
- `'hero.moveDown(steps)'`
- `'hero.moveXY(x, y)'`
- `'hero.attack(target)'`
- `'hero.cleave()'`
- `'hero.shield()'`
- `'hero.say(message)'`
- `'hero.findNearestEnemy()'`
- `'hero.findNearestItem()'`
- `'hero.findEnemies()'`
- `'hero.findItems()'`
- `'hero.distanceTo(target)'`
- `'hero.isReady(action)'`
- `'hero.buildXY(type, x, y)'`
- `'hero.cast(spell, target)'`
- `'hero.wait(steps)'`

---

## 6. กฎของ Transpiler (`src/engine/transpiler.js`) สำหรับเขียน `solutionCode`

เพื่อให้โค้ด Python ใน `solutionCode.python` แปลงเป็น JavaScript ได้โดยไม่มี Syntax Error:
1. ใช้การย่อหน้า (Indentation) ครั้งละ **4 ช่องว่าง (4 spaces)** เสมอ
2. คำสั่งที่รองรับเต็มรูปแบบ:
   - `while True:`
   - `if ...:`, `elif ...:`, `else:`
   - `for enemy in enemies:` หรือ `for i in range(N):`
   - `def myFunction():`
   - ตัวดำเนินการ `and`, `or`, `not`, `True`, `False`, `None`
3. หลีกเลี่ยงการใช้ List Comprehension ซับซ้อน หรือ Lambda ในโค้ดเฉลย ให้เขียนด้วย `while True:`, `if / elif / else`, `for ... in ...`, หรือ `def ...:` ที่ชัดเจนและเข้าใจง่ายสำหรับผู้เรียน

---

## 7. ขั้นตอนการเพิ่มด่านและตรวจสอบ (Step-by-Step Checklist)

1. เปิดไฟล์ [`src/data/curriculum.js`](file:///Users/kit/codegame/src/data/curriculum.js)
2. ตรวจสอบตำแหน่ง `mapPos: { x, y }` ของด่านเดิมในแต่ละ `world` เพื่อกำหนด `mapPos` ของด่านใหม่ไม่ให้ซ้อนทับกัน:
   - **`dungeon`** (ปัจจุบันมีด่าน 1–8): พิกัดเดิมอยู่ที่ `(14,68), (24,52), (34,36), (45,62), (56,42), (67,26), (78,56), (88,40)` -> ด่านใหม่ใน `dungeon` ควรใช้เช่น `{ x: 92, y: 68 }`
   - **`forest`** (ปัจจุบันมีด่าน 9–12): พิกัดเดิมอยู่ที่ `(20,70), (42,55), (65,62), (85,45)` -> ด่านใหม่ใน `forest` ควรใช้เช่น `{ x: 88, y: 72 }`
   - **`desert`** (ปัจจุบันมีด่าน 13–15): พิกัดเดิมอยู่ที่ `(22,64), (52,48), (82,36)` -> ด่านใหม่ใน `desert` ควรใช้เช่น `{ x: 84, y: 66 }`
   - **`mountain`** (ปัจจุบันมีด่าน 16–18): พิกัดเดิมอยู่ที่ `(24,68), (54,50), (82,34)` -> ด่านใหม่ใน `mountain` ควรใช้เช่น `{ x: 84, y: 64 }`
   - **`glacier`** (ปัจจุบันมีด่าน 19–20): พิกัดเดิมอยู่ที่ `(38,58), (76,40)` -> ด่านใหม่ใน `glacier` ควรใช้เช่น `{ x: 88, y: 62 }`
3. เพิ่มด่านใหม่ต่อท้ายอาร์เรย์ `LEVELS` (เช่น `id: 21` ถึง `id: 25`, `number: 21` ถึง `number: 25`)
4. รันคำสั่งทดสอบ:
   ```bash
   node /Users/kit/codegame/tests/verify.js
   ```
5. ตรวจสอบว่าทุกด่านขึ้นเครื่องหมาย `✓` ครบทั้งหมด (เช่น 25 Levels = 50 runs) และได้ `Stars: 3⭐` ทุกด่าน!

---

## 8. วิธีการเพิ่ม "โลก/แผนที่แคมเปญใหม่" (Adding a Brand New World / Campaign Map)

หากต้องการสร้าง **โลกแคมเปญใหม่ทั้งใบ (New Campaign World)** เช่น ดินแดนภูเขาไฟ (`volcano`) หรือปราสาทมืด (`castle`) ต้องแก้ไขครบ **3 จุด** ดังนี้:

### จุดที่ 1: เพิ่มข้อมูลโลกใน `WORLDS` ในไฟล์ [`src/data/curriculum.js`](file:///Users/kit/codegame/src/data/curriculum.js#L300-L370)
```javascript
{
  id: 'volcano',
  slug: 'volcano', // ชื่ออ้างอิงภาษาอังกฤษตัวพิมพ์เล็ก
  name: 'Inferno Volcano',
  nameTh: 'ภูเขาไฟอินเฟอร์โน (Inferno Volcano)',
  subtitle: 'Master advanced algorithms in the volcanic caldera!',
  subtitleTh: 'พิชิตอัลกอริทึมขั้นสูงท่ามกลางลาวาและเปลวเพลิง!',
  theme: 'volcano', // ชื่อธีมสีของสนามรบ
  bgGradient: 'linear-gradient(135deg, #2b0f0f 0%, #5c1916 50%, #1a0909 100%)',
  accentColor: '#e74c3c',
  badgeText: 'CS6: Advanced Algorithms & Boss Raids',
  totalCanonicalLevels: 30
}
```

### จุดที่ 2: เพิ่มสีธีมพื้นและกำแพงสนามรบใน `BattleRenderer.THEMES` ในไฟล์ [`public/js/renderer.js`](file:///Users/kit/codegame/public/js/renderer.js#L100-L141)
```javascript
volcano: {
  floorA: '#3b1714',
  floorB: '#471c18',
  floorOverlay: 'rgba(90, 22, 16, 0.45)',
  wallTop: '#7a2e26',
  wallSide: '#240b09',
  gridLine: 'rgba(255, 180, 150, 0.08)'
}
```
*(หากไม่เพิ่มใน `THEMES` ระบบจะใช้สีของ `dungeon` เป็นค่าเริ่มต้นโดยไม่พัง)*

### จุดที่ 3: เพิ่มด่านเข้าสู่โลกใหม่ใน `LEVELS` ในไฟล์ [`src/data/curriculum.js`](file:///Users/kit/codegame/src/data/curriculum.js)
- ตั้งค่า `world: 'volcano'` ในแต่ละด่านของโลกนั้น
- กำหนด `mapPos: { x, y }` เรียงจากซ้ายไปขวา เช่น `{ x: 20, y: 65 }` -> `{ x: 45, y: 50 }` -> `{ x: 70, y: 38 }` เพื่อให้เส้นประ SVG บนแผนที่โลกเชื่อมต่อกันอย่างสวยงาม
- รัน `node /Users/kit/codegame/tests/verify.js` เพื่อตรวจสอบว่าทุกด่านในโลกใหม่ผ่าน 100%!

