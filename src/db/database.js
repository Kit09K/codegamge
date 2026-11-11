const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'codecombat.db');
const db = new DatabaseSync(dbPath);

// Pragmas for high concurrency and low latency (REA Optimization principle)
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA temp_store = MEMORY;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    hero_id TEXT NOT NULL DEFAULT 'tharin',
    preferred_lang TEXT NOT NULL DEFAULT 'python',
    xp INTEGER NOT NULL DEFAULT 0,
    gems INTEGER NOT NULL DEFAULT 150,
    level INTEGER NOT NULL DEFAULT 1,
    equipped_items TEXT NOT NULL DEFAULT '["simple-boots","simple-sword"]',
    class_code TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS level_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    level_slug TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    code TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'python',
    lines_of_code INTEGER NOT NULL DEFAULT 0,
    ticks_taken INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, level_slug),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS classrooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    teacher_id INTEGER NOT NULL,
    language TEXT NOT NULL DEFAULT 'python',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );
`);

// Prepared statements cached once at startup (REA single-producer lookup optimization)
const stmts = {
  getUserByUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
  getUserById: db.prepare('SELECT * FROM users WHERE id = ?'),
  createUser: db.prepare(`
    INSERT INTO users (username, password, display_name, role, hero_id, preferred_lang, xp, gems, level, equipped_items, class_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),
  createSession: db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)'),
  getSession: db.prepare(`
    SELECT u.* FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token = ?'),
  updateUserStats: db.prepare(`
    UPDATE users
    SET xp = ?, gems = ?, level = ?, hero_id = ?, preferred_lang = ?, equipped_items = ?, class_code = ?
    WHERE id = ?
  `),
  getProgressByUser: db.prepare('SELECT * FROM level_progress WHERE user_id = ?'),
  getSingleProgress: db.prepare('SELECT * FROM level_progress WHERE user_id = ? AND level_slug = ?'),
  upsertProgress: db.prepare(`
    INSERT INTO level_progress (user_id, level_slug, completed, stars, code, language, lines_of_code, ticks_taken, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, level_slug) DO UPDATE SET
      completed = MAX(level_progress.completed, excluded.completed),
      stars = MAX(level_progress.stars, excluded.stars),
      code = excluded.code,
      language = excluded.language,
      lines_of_code = excluded.lines_of_code,
      ticks_taken = excluded.ticks_taken,
      updated_at = datetime('now')
  `),
  getLeaderboard: db.prepare(`
    SELECT u.id, u.username, u.display_name, u.hero_id, u.xp, u.gems, u.level, u.role,
           COUNT(CASE WHEN lp.completed = 1 THEN 1 END) AS completed_levels
    FROM users u
    LEFT JOIN level_progress lp ON lp.user_id = u.id
    GROUP BY u.id
    ORDER BY u.xp DESC, completed_levels DESC
    LIMIT 25
  `),
  createClassroom: db.prepare(`
    INSERT INTO classrooms (class_code, name, teacher_id, language)
    VALUES (?, ?, ?, ?)
  `),
  getClassroomByCode: db.prepare('SELECT * FROM classrooms WHERE class_code = ?'),
  getClassroomsByTeacher: db.prepare('SELECT * FROM classrooms WHERE teacher_id = ?'),
  getStudentsByClassCode: db.prepare(`
    SELECT u.id, u.username, u.display_name, u.hero_id, u.xp, u.gems, u.level,
           COUNT(CASE WHEN lp.completed = 1 THEN 1 END) AS completed_levels
    FROM users u
    LEFT JOIN level_progress lp ON lp.user_id = u.id
    WHERE u.class_code = ?
    GROUP BY u.id
    ORDER BY u.xp DESC
  `)
};

function seedDefaults() {
  const existing = stmts.getUserByUsername.get('hero');
  if (!existing) {
    stmts.createUser.run(
      'hero',
      '1234',
      'Sir Tharin (Demo Hero)',
      'student',
      'tharin',
      'python',
      250,
      350,
      3,
      JSON.stringify(['simple-boots', 'simple-sword', 'wooden-shield', 'mahogany-glasses']),
      'COCO-101'
    );
    const heroUser = stmts.getUserByUsername.get('hero');
    stmts.upsertProgress.run(
      heroUser.id,
      'dungeons-of-kithgard',
      1,
      3,
      'hero.moveRight()\nhero.moveDown()\nhero.moveRight()',
      'python',
      3,
      18
    );
  }

  const teacher = stmts.getUserByUsername.get('teacher');
  if (!teacher) {
    stmts.createUser.run(
      'teacher',
      '1234',
      'Master Wizard (Educator)',
      'teacher',
      'amara',
      'python',
      1200,
      2000,
      10,
      JSON.stringify(['simple-boots', 'Compound-boots', 'simple-sword', 'long-sword', 'wooden-shield', 'mahogany-glasses', 'builders-hammer', 'arcane-staff']),
      'COCO-101'
    );
    const teacherUser = stmts.getUserByUsername.get('teacher');
    const existingClass = stmts.getClassroomByCode.get('COCO-101');
    if (!existingClass) {
      stmts.createClassroom.run('COCO-101', 'CS101: Intro to Python & Game Logic', teacherUser.id, 'python');
    }
  }
}

seedDefaults();

function formatUser(row) {
  if (!row) return null;
  let equipped = [];
  try {
    equipped = JSON.parse(row.equipped_items || '[]');
  } catch {
    equipped = ['simple-boots', 'simple-sword'];
  }
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    heroId: row.hero_id,
    preferredLang: row.preferred_lang,
    xp: row.xp,
    gems: row.gems,
    level: row.level,
    equippedItems: equipped,
    classCode: row.class_code
  };
}

function createToken() {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  db,
  stmts,
  formatUser,
  createToken
};
