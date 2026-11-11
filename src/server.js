const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const { stmts, formatUser, createToken } = require('./db/database');
const {
  HEROES,
  SHOP_ITEMS,
  SPELL_DOCS,
  WORLDS,
  LEVELS,
  LEVEL_BY_SLUG,
  HERO_BY_ID,
  ITEM_BY_ID
} = require('./data/curriculum');
const { simulateLevel } = require('./engine/simulator');
const { analyzeCodeAndAdvise } = require('./engine/aiMentor');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(body);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'] || '';
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else {
    const cookies = parseCookies(req);
    token = cookies.coco_token || null;
  }
  if (!token) return { user: null, token: null };
  const row = stmts.getSession.get(token);
  return { user: row ? formatUser(row) : null, token };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 512 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getUserProgressMap(userId) {
  if (!userId) return {};
  const rows = stmts.getProgressByUser.all(userId);
  const map = {};
  for (const r of rows) {
    map[r.level_slug] = {
      completed: Boolean(r.completed),
      stars: r.stars,
      code: r.code,
      language: r.language,
      linesOfCode: r.lines_of_code,
      ticksTaken: r.ticks_taken
    };
  }
  return map;
}

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // ==================== API ROUTES ====================
    if (pathname === '/api/health' && method === 'GET') {
      const mem = process.memoryUsage();
      return sendJson(res, 200, {
        ok: true,
        service: 'codecombat-local',
        rssMb: Number((mem.rss / (1024 * 1024)).toFixed(2)),
        heapUsedMb: Number((mem.heapUsed / (1024 * 1024)).toFixed(2)),
        levelsCount: LEVELS.length,
        worldsCount: WORLDS.length
      });
    }

    // 1. Auth: Current User
    if (pathname === '/api/auth/me' && method === 'GET') {
      const { user } = getAuthUser(req);
      const progress = user ? getUserProgressMap(user.id) : {};
      return sendJson(res, 200, { ok: true, user, progress });
    }

    // 2. Auth: Hard Login (Single Fixed Account: hero / 1234)
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await readJsonBody(req);
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '').trim();

      if (!username || !password) {
        return sendJson(res, 400, { ok: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน (Username & Password required)' });
      }

      if (username !== 'hero' || password !== '1234') {
        return sendJson(res, 401, { ok: false, error: 'อนุญาตเฉพาะบัญชี Hard Login: Username "hero" และ Password "1234" เท่านั้น' });
      }

      const row = stmts.getUserByUsername.get('hero');
      if (!row) {
        return sendJson(res, 401, { ok: false, error: 'ไม่พบบัญชีผู้ใช้หลักในระบบ' });
      }

      const token = createToken();
      stmts.createSession.run(token, row.id);
      const user = formatUser(row);
      const progress = getUserProgressMap(user.id);

      return sendJson(
        res,
        200,
        { ok: true, token, user, progress },
        { 'Set-Cookie': `coco_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000` }
      );
    }

    // 3. Auth: Register (Disabled — Hard Login Mode)
    if (pathname === '/api/auth/register' && method === 'POST') {
      return sendJson(res, 403, { ok: false, error: 'ระบบปิดการสมัครสมาชิก (Sign Up disabled — กรุณาใช้บัญชี hero / 1234)' });
    }

    // 4. Auth: Logout
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const { token } = getAuthUser(req);
      if (token) {
        stmts.deleteSession.run(token);
      }
      return sendJson(
        res,
        200,
        { ok: true },
        { 'Set-Cookie': 'coco_token=; Path=/; HttpOnly; Max-Age=0' }
      );
    }

    // 5. Curriculum & Worlds Overview
    if (pathname === '/api/curriculum' && method === 'GET') {
      const { user } = getAuthUser(req);
      const progress = user ? getUserProgressMap(user.id) : {};

      const summaryLevels = LEVELS.map(l => ({
        id: l.id,
        slug: l.slug,
        world: l.world,
        number: l.number,
        name: l.name,
        nameTh: l.nameTh,
        concept: l.concept,
        xpReward: l.xpReward,
        gemReward: l.gemReward,
        mapPos: l.mapPos,
        description: l.description,
        descriptionTh: l.descriptionTh,
        goals: l.goals
      }));

      return sendJson(res, 200, {
        ok: true,
        worlds: WORLDS,
        levels: summaryLevels,
        heroes: HEROES,
        shopItems: SHOP_ITEMS,
        spellDocs: SPELL_DOCS,
        user,
        progress
      });
    }

    // 6. Get Single Level Details
    if (pathname.startsWith('/api/levels/') && method === 'GET') {
      const slug = decodeURIComponent(pathname.slice('/api/levels/'.length));
      const level = LEVEL_BY_SLUG.get(slug);
      if (!level) {
        return sendJson(res, 404, { ok: false, error: 'Level not found' });
      }
      const { user } = getAuthUser(req);
      const saved = user ? stmts.getSingleProgress.get(user.id, slug) : null;
      return sendJson(res, 200, {
        ok: true,
        level,
        spellDocs: SPELL_DOCS,
        savedProgress: saved ? {
          completed: Boolean(saved.completed),
          stars: saved.stars,
          code: saved.code,
          language: saved.language
        } : null
      });
    }

    // 7. Execute Code & Simulate Level on Backend
    if (pathname === '/api/play/execute' && method === 'POST') {
      const body = await readJsonBody(req);
      const { user } = getAuthUser(req);

      const levelSlug = String(body.levelSlug || '');
      const code = String(body.code || '');
      const language = body.language === 'javascript' ? 'javascript' : 'python';
      const heroId = body.heroId || user?.heroId || 'tharin';
      const equippedItems = user?.equippedItems || ['simple-boots', 'simple-sword'];

      const simResult = simulateLevel({
        levelSlug,
        customLevel: body.customLevel || null,
        code,
        language,
        heroId,
        equippedItems
      });

      if (!simResult.ok) {
        return sendJson(res, 400, simResult);
      }

      let rewardGranted = null;
      let updatedUser = user;

      if (user && LEVEL_BY_SLUG.has(levelSlug)) {
        const level = LEVEL_BY_SLUG.get(levelSlug);
        const prev = stmts.getSingleProgress.get(user.id, levelSlug);
        const firstTimeWin = simResult.victory && (!prev || !prev.completed);

        stmts.upsertProgress.run(
          user.id,
          levelSlug,
          simResult.victory ? 1 : 0,
          simResult.stars,
          code,
          language,
          simResult.linesOfCode,
          simResult.ticksTaken
        );

        if (firstTimeWin) {
          const newXp = user.xp + level.xpReward;
          const newGems = user.gems + level.gemReward;
          const newLevel = Math.floor(newXp / 120) + 1;
          stmts.updateUserStats.run(
            newXp,
            newGems,
            newLevel,
            user.heroId,
            language,
            JSON.stringify(user.equippedItems),
            user.classCode,
            user.id
          );
          rewardGranted = {
            xp: level.xpReward,
            gems: level.gemReward,
            newLevel
          };
          updatedUser = formatUser(stmts.getUserById.get(user.id));
        }
      }

      return sendJson(res, 200, {
        ...simResult,
        rewardGranted,
        user: updatedUser,
        progress: updatedUser ? getUserProgressMap(updatedUser.id) : undefined
      });
    }

    // 8. AI Mentor / Hints Assistant
    if (pathname === '/api/play/ai-help' && method === 'POST') {
      const body = await readJsonBody(req);
      const advice = analyzeCodeAndAdvise({
        levelSlug: String(body.levelSlug || ''),
        code: String(body.code || ''),
        language: body.language === 'javascript' ? 'javascript' : 'python',
        question: String(body.question || '')
      });
      return sendJson(res, 200, advice);
    }

    // 9. Shop: Buy / Equip Item or Select Hero
    if (pathname === '/api/user/customize' && method === 'POST') {
      const { user } = getAuthUser(req);
      if (!user) {
        return sendJson(res, 401, { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนซื้ออุปกรณ์หรือเลือกฮีโร่' });
      }
      const body = await readJsonBody(req);
      let { gems, equippedItems, heroId, preferredLang } = user;

      if (body.buyItemId) {
        const item = ITEM_BY_ID.get(body.buyItemId);
        if (!item) return sendJson(res, 404, { ok: false, error: 'ไม่พบไอเทมนี้' });
        if (!equippedItems.includes(item.id)) {
          if (gems < item.cost) {
            return sendJson(res, 400, { ok: false, error: `เพชรไม่พอ! ต้องการ ${item.cost} 💎 (คุณมี ${gems} 💎)` });
          }
          gems -= item.cost;
          equippedItems = [...equippedItems, item.id];
        }
      }

      if (body.selectHeroId) {
        const hero = HERO_BY_ID.get(body.selectHeroId);
        if (!hero) return sendJson(res, 404, { ok: false, error: 'ไม่พบฮีโร่นี้' });
        const heroTag = `hero:${hero.id}`;
        if (!hero.unlockedByDefault && !equippedItems.includes(heroTag) && heroId !== hero.id) {
          if (gems < hero.cost) {
            return sendJson(res, 400, { ok: false, error: `เพชรไม่พอปลดล็อก ${hero.name}! ต้องการ ${hero.cost} 💎` });
          }
          gems -= hero.cost;
          equippedItems = [...equippedItems, heroTag];
        }
        heroId = hero.id;
      }

      if (body.preferredLang === 'python' || body.preferredLang === 'javascript') {
        preferredLang = body.preferredLang;
      }

      stmts.updateUserStats.run(
        user.xp,
        gems,
        user.level,
        heroId,
        preferredLang,
        JSON.stringify(equippedItems),
        user.classCode,
        user.id
      );

      const updated = formatUser(stmts.getUserById.get(user.id));
      return sendJson(res, 200, { ok: true, user: updated });
    }

    // 10. Classroom: Join or Create Class
    if (pathname === '/api/classroom/join' && method === 'POST') {
      const { user } = getAuthUser(req);
      if (!user) {
        return sendJson(res, 401, { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนเข้าร่วมชั้นเรียน' });
      }
      const body = await readJsonBody(req);
      const classCode = String(body.classCode || '').trim().toUpperCase();
      const classroom = stmts.getClassroomByCode.get(classCode);
      if (!classroom) {
        return sendJson(res, 404, { ok: false, error: `ไม่พบรหัสชั้นเรียน "${classCode}" (ลองใช้รหัสตัวอย่าง: COCO-101)` });
      }

      stmts.updateUserStats.run(
        user.xp,
        user.gems,
        user.level,
        user.heroId,
        classroom.language || user.preferredLang,
        JSON.stringify(user.equippedItems),
        classCode,
        user.id
      );
      const updated = formatUser(stmts.getUserById.get(user.id));
      return sendJson(res, 200, { ok: true, classroom, user: updated });
    }

    if (pathname === '/api/classroom/create' && method === 'POST') {
      const { user } = getAuthUser(req);
      if (!user) {
        return sendJson(res, 401, { ok: false, error: 'กรุณาเข้าสู่ระบบก่อนสร้างชั้นเรียน' });
      }
      const body = await readJsonBody(req);
      const name = String(body.name || 'New Coding Classroom').trim();
      const language = body.language === 'javascript' ? 'javascript' : 'python';
      const classCode = String(body.classCode || `COCO-${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();

      const existing = stmts.getClassroomByCode.get(classCode);
      if (existing) {
        return sendJson(res, 409, { ok: false, error: 'รหัสชั้นเรียนนี้ถูกใช้งานแล้ว' });
      }

      stmts.createClassroom.run(classCode, name, user.id, language);
      const classroom = stmts.getClassroomByCode.get(classCode);
      return sendJson(res, 200, { ok: true, classroom });
    }

    if (pathname === '/api/classroom/info' && method === 'GET') {
      const code = (parsedUrl.searchParams.get('code') || 'COCO-101').toUpperCase();
      const classroom = stmts.getClassroomByCode.get(code);
      const students = stmts.getStudentsByClassCode.all(code);
      return sendJson(res, 200, { ok: true, classroom, students });
    }

    // 11. Leaderboard
    if (pathname === '/api/leaderboard' && method === 'GET') {
      const rows = stmts.getLeaderboard.all();
      return sendJson(res, 200, { ok: true, leaderboard: rows });
    }

    // ==================== STATIC ASSETS & SPA FALLBACK ====================
    let relPath = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(PUBLIC_DIR, path.normalize(relPath));

    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (err) {
    sendJson(res, 500, { ok: false, error: err.message || 'Internal Server Error' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`⚔️  CodeCombat Local Server running at http://localhost:${PORT}`);
  });
}

module.exports = { server };
