/**
 * CodeCombat Local — Main Frontend Controller
 */
const PILLARS_DATA = [
  {
    icon: '🎮',
    title: 'Game-Based Learning (การเรียนรู้ผ่านการเล่นเกม)',
    desc: 'เขียนโค้ดสั่งการฮีโร่ตั้งแต่ก้าวแรกของการผจญภัย เปลี่ยนตรรกะการเขียนโปรแกรมให้เป็นภารกิจการเดินทัพ การหลบกับดัก และการต่อสู้กับกองทัพ Ogre อย่างสนุกสนาน'
  },
  {
    icon: '💻',
    title: 'Python & JavaScript (เขียนโค้ดจริงได้ทั้ง 2 ภาษา)',
    desc: 'สลับภาษาระหว่าง Python และ JavaScript ได้ตลอดเวลา พร้อมแผงคาถา Spell Palette ช่วยแนะนำคำสั่งและตรวจสอบไวยากรณ์ทันทีที่กดรัน'
  },
  {
    icon: '🤖',
    title: 'AI Mentor Hints (ผู้ช่วยแนะนำทีละขั้นตอน)',
    desc: 'เมื่อติดขัดในด่านใด สามารถกด Ask AI Mentor เพื่อให้ระบบวิเคราะห์โค้ด บอกใบ้แนวคิดของด่านนั้น และดูตัวอย่างโค้ดที่ถูกต้องได้ทันที'
  },
  {
    icon: '🛡️',
    title: 'Heroes & Armory (สะสมเพชรอัปเกรดฮีโร่และอาวุธ)',
    desc: 'ผ่านด่านเพื่อรับ XP และเพชร 💎 นำไปปลดล็อกฮีโร่ใหม่และสวมใส่อาวุธ/ชุดเกราะเพื่อเปิดใช้คำสั่งสกิลขั้นสูง เช่น Cleave, Shield และ Fireball'
  }
];

const App = {
  locale: 'th',
  user: null,
  progress: {},
  worlds: [],
  levels: [],
  heroes: [],
  shopItems: [],
  spellDocs: {},

  currentView: 'home',
  currentWorldSlug: 'dungeon',
  currentLevel: null,
  currentLang: 'python',

  // Playback state
  simFrames: [],
  currentFrameIdx: 0,
  playbackTimer: null,
  playbackPaused: false,
  playbackSpeed: 1,
  lastMentorSolution: '',
  authMode: 'login',

  async init() {
    BattleRenderer.init(document.getElementById('battle-canvas'));
    this.selectPillar(0);
    this.bindEditorEvents();
    await this.loadCurriculum();

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeModals();
        this.closeLevelPopover();
        const banner = document.getElementById('dialogue-banner');
        if (banner) banner.classList.add('hidden');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && this.currentView === 'level') {
        e.preventDefault();
        this.runCode();
      }
    });
  },

  bindEditorEvents() {
    const editor = document.getElementById('code-editor');
    const gutter = document.getElementById('editor-gutter');
    if (!editor) return;

    editor.addEventListener('input', () => {
      this.updateEditorGutter();
    });

    editor.addEventListener('scroll', () => {
      gutter.scrollTop = editor.scrollTop;
    });

    editor.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        this.updateEditorGutter();
      }
    });
  },

  updateEditorGutter() {
    const editor = document.getElementById('code-editor');
    const gutter = document.getElementById('editor-gutter');
    const countEl = document.getElementById('tome-line-count');
    if (!editor || !gutter) return;
    const lines = editor.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) {
      html += `<div>${i}</div>`;
    }
    gutter.innerHTML = html;
    if (countEl) {
      countEl.textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
    }
  },

  highlightEditorLine(lineNum) {
    const bar = document.getElementById('editor-active-line-bar');
    if (!bar) return;
    if (!lineNum || lineNum < 1) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');
    const topPx = 14 + (lineNum - 1) * 22;
    bar.style.top = `${topPx}px`;
  },

  async api(url, method = 'GET', body = null) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
  },

  async loadCurriculum() {
    const data = await this.api('/api/curriculum');
    if (!data.ok) return;
    this.worlds = data.worlds || [];
    this.levels = data.levels || [];
    this.heroes = data.heroes || [];
    this.shopItems = data.shopItems || [];
    this.spellDocs = data.spellDocs || {};
    this.user = data.user || null;
    this.progress = data.progress || {};
    if (this.user?.preferredLang) {
      this.currentLang = this.user.preferredLang;
    }
    this.renderAuthBar();
    this.renderWorlds();
  },

  renderAuthBar() {
    const userBar = document.getElementById('nav-user-stats');
    const guestBar = document.getElementById('nav-guest-buttons');
    if (this.user) {
      userBar.classList.remove('hidden');
      guestBar.classList.add('hidden');
      document.getElementById('nav-user-name').textContent = this.user.displayName;
      document.getElementById('nav-user-level').textContent = this.user.level;
      document.getElementById('nav-user-xp').textContent = this.user.xp;
      document.getElementById('nav-user-gems').textContent = this.user.gems;
      const heroId = this.user.heroId || 'tharin';
      const navAvatarEl = document.getElementById('nav-hero-avatar');
      if (navAvatarEl) {
        navAvatarEl.innerHTML = `<img src="/assets/sprites/portrait_${heroId}.svg" class="nav-avatar-icon" alt="${heroId}">`;
      }
    } else {
      userBar.classList.add('hidden');
      guestBar.classList.remove('hidden');
    }
  },

  navigate(viewName, param = null) {
    this.stopPlaybackTimer();
    this.closeLevelPopover();
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.remove('mobile-open');
    this.currentView = viewName;

    document.querySelectorAll('.coco-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');

    if (viewName === 'worlds') {
      this.renderWorlds();
    } else if (viewName === 'world-map') {
      this.openWorldMap(param || this.currentWorldSlug);
    } else if (viewName === 'level' && param) {
      this.openLevel(param);
    }
  },

  selectPillar(idx) {
    const p = PILLARS_DATA[idx] || PILLARS_DATA[0];
    document.querySelectorAll('.pillar-tab').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });
    const box = document.getElementById('pillar-content');
    if (box) {
      box.innerHTML = `
        <div class="pillar-icon-large">${p.icon}</div>
        <div class="pillar-text">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
        </div>
      `;
    }
  },

  renderWorlds() {
    const grid = document.getElementById('worlds-grid');
    if (!grid) return;

    const worldIcons = {
      dungeon: 'sword',
      forest: 'shield',
      desert: 'potion-red',
      mountain: 'magic-slot',
      glacier: 'potion-blue'
    };

    grid.innerHTML = this.worlds.map(w => {
      const worldLevels = this.levels.filter(l => l.world === w.slug);
      const completedCount = worldLevels.filter(l => this.progress[l.slug]?.completed).length;
      const title = this.locale === 'th' ? w.nameTh : w.name;
      const sub = this.locale === 'th' ? w.subtitleTh : w.subtitle;
      const rpgIcon = worldIcons[w.slug] || 'sword';

      return `
        <div class="world-card rpgui-container framed-golden rpgui-flow-box" style="background: ${w.bgGradient}" onclick="App.navigate('world-map', '${w.slug}')">
          <div>
            <div class="world-badge-row">
              <span class="world-cs-tag"><span class="rpgui-icon ${rpgIcon} rpgui-icon-xs"></span> ${w.badgeText}</span>
              <span class="world-progress-pill">⭐ ${completedCount} / ${worldLevels.length}</span>
            </div>
            <h2>${title}</h2>
            <hr class="golden rpgui-hr-divider" />
            <p>${sub}</p>
          </div>
          <div class="world-card-footer">
            <span style="font-size:12.5px; color:#cbd5e1;">${worldLevels.length} Playable Levels</span>
            <button class="rpgui-button golden rpgui-btn-nav" type="button"><p>Play ➔</p></button>
          </div>
        </div>
      `;
    }).join('');
  },

  openWorldMap(worldSlug) {
    this.currentWorldSlug = worldSlug;
    const world = this.worlds.find(w => w.slug === worldSlug) || this.worlds[0];
    const stage = document.getElementById('world-map-stage');
    if (stage && world) {
      stage.style.background = world.bgGradient;
      document.getElementById('world-map-title').textContent = this.locale === 'th' ? world.nameTh : world.name;
      document.getElementById('world-map-subtitle').textContent = this.locale === 'th' ? world.subtitleTh : world.subtitle;
    }

    const worldLevels = this.levels.filter(l => l.world === worldSlug);
    const svg = document.getElementById('map-paths-svg');
    const nodesLayer = document.getElementById('map-nodes-layer');

    // Draw SVG dashed paths between consecutive level nodes
    let pathD = '';
    worldLevels.forEach((lv, idx) => {
      const cmd = idx === 0 ? 'M' : 'L';
      pathD += `${cmd} ${lv.mapPos.x} ${lv.mapPos.y} `;
    });
    svg.innerHTML = pathD
      ? `<path d="${pathD}" fill="none" stroke="rgba(255, 215, 100, 0.45)" stroke-width="0.6" stroke-dasharray="1.5,1.5" />`
      : '';

    nodesLayer.innerHTML = worldLevels.map(lv => {
      const prog = this.progress[lv.slug];
      const isCompleted = prog?.completed;
      const stars = prog?.stars || 0;
      const starStr = isCompleted ? '⭐'.repeat(stars) : '';

      return `
        <div class="map-level-node ${isCompleted ? 'completed' : ''}"
             style="left: ${lv.mapPos.x}%; top: ${lv.mapPos.y}%"
             onclick="App.showLevelPopover('${lv.slug}')">
          <div class="node-banner">${lv.number}</div>
          ${starStr ? `<div class="node-stars">${starStr}</div>` : ''}
          <div class="node-label">${lv.name}</div>
        </div>
      `;
    }).join('');
  },

  showLevelPopover(slug) {
    const lv = this.levels.find(l => l.slug === slug);
    if (!lv) return;
    const pop = document.getElementById('level-popover');
    pop.classList.remove('hidden');
    document.getElementById('pop-level-num').textContent = `Level ${lv.number}`;
    document.getElementById('pop-level-concept').textContent = lv.concept;
    document.getElementById('pop-level-name').textContent = this.locale === 'th' ? `${lv.name} (${lv.nameTh})` : lv.name;
    document.getElementById('pop-level-desc').textContent = this.locale === 'th' ? lv.descriptionTh : lv.description;
    document.getElementById('pop-xp').textContent = lv.xpReward;
    document.getElementById('pop-gems').textContent = lv.gemReward;

    const goalsHtml = (lv.goals || []).map(g => `<div>🎯 ${this.locale === 'th' ? g.textTh : g.text}</div>`).join('');
    document.getElementById('pop-level-goals').innerHTML = goalsHtml;

    const btn = document.getElementById('pop-play-btn');
    btn.onclick = () => {
      this.closeLevelPopover();
      this.navigate('level', lv.slug);
    };
  },

  closeLevelPopover() {
    const pop = document.getElementById('level-popover');
    if (pop) pop.classList.add('hidden');
  },

  backToCurrentWorld() {
    this.navigate('world-map', this.currentWorldSlug);
  },

  async openLevel(slug) {
    const data = await this.api(`/api/levels/${encodeURIComponent(slug)}`);
    if (!data.ok) {
      this.toast('ไม่พบด่านที่เลือก');
      return;
    }

    const level = data.level;
    this.currentLevel = level;
    this.currentWorldSlug = level.world;

    // Header details
    document.getElementById('play-level-number').textContent = `#${level.number}`;
    document.getElementById('play-level-name').textContent = level.name;
    document.getElementById('play-level-concept').textContent = level.concept;

    // Language selector
    const langSelect = document.getElementById('select-code-lang');
    if (data.savedProgress?.language) {
      this.currentLang = data.savedProgress.language;
    }
    langSelect.value = this.currentLang;
    document.getElementById('tome-filename').textContent = this.currentLang === 'javascript' ? 'hero_script.js' : 'hero_script.py';

    // Code Editor content
    const editor = document.getElementById('code-editor');
    editor.value = data.savedProgress?.code || level.starterCode?.[this.currentLang] || level.starterCode?.python || '';
    this.updateEditorGutter();
    this.highlightEditorLine(null);

    // Hide problem banner & next level button initially
    document.getElementById('problem-alert-view').classList.add('hidden');
    document.getElementById('btn-next-level').classList.toggle('hidden', !data.savedProgress?.completed);
    this.closeHintsDrawer();

    // Dialogue banner
    const dialogueBanner = document.getElementById('dialogue-banner');
    dialogueBanner.classList.remove('hidden');
    document.getElementById('dialogue-text').textContent = this.locale === 'th' ? level.descriptionTh : (level.dialogue || level.description);

    // Render Spell Palette
    this.renderSpellPalette(level);

    // Render initial Goals
    this.renderLiveGoals(level.goals.map(g => ({ ...g, passed: false })), false);

    // Configure Intro Briefing Overlay
    const introOverlay = document.getElementById('level-intro-overlay');
    introOverlay.classList.remove('hidden');
    document.getElementById('intro-world-badge').textContent = `${level.world.toUpperCase()} • LEVEL ${level.number} • ${level.concept}`;
    document.getElementById('intro-level-title').textContent = `${level.name} — ${level.nameTh}`;
    document.getElementById('intro-goals-list').innerHTML = level.goals
      .map(g => `<li>⭕ ${this.locale === 'th' ? g.textTh : g.text}</li>`)
      .join('');
    document.getElementById('intro-narrative').textContent = this.locale === 'th' ? level.descriptionTh : level.description;

    const activeHero = this.heroes.find(h => h.id === (this.user?.heroId || 'tharin')) || this.heroes[0];
    document.getElementById('intro-hero-summary').innerHTML = `<img src="/assets/sprites/portrait_${activeHero.id}.svg" class="nav-avatar-icon" style="width:20px;height:20px;margin-right:6px;" alt=""> Hero: <strong>${activeHero.name}</strong> | Language: <strong>${this.currentLang.toUpperCase()}</strong>`;
    document.getElementById('hud-hero-name').textContent = activeHero.name.split(' ')[1] || activeHero.name;

    // Load initial frame into BattleRenderer
    BattleRenderer.loadLevel(level, level.world, activeHero.color, activeHero.id);
    const initialFrame = {
      activeLine: 1,
      hero: {
        x: level.grid.heroStart.x,
        y: level.grid.heroStart.y,
        hp: 15 + activeHero.hpBonus,
        maxHp: 15 + activeHero.hpBonus,
        shielded: false,
        speech: null
      },
      enemies: (level.grid.enemies || []).map(e => ({ ...e, alive: true })),
      items: (level.grid.items || []).map(i => ({ ...i, collected: false })),
      doors: (level.grid.doors || []).map(d => ({ ...d })),
      structures: [],
      effects: []
    };
    this.simFrames = [initialFrame];
    this.applyFrameAtIndex(0);
  },

  dismissIntroOverlay() {
    document.getElementById('level-intro-overlay').classList.add('hidden');
    CocoAudio.init();
  },

  renderSpellPalette(level) {
    const listEl = document.getElementById('spell-palette-list');
    const previewEl = document.getElementById('spell-doc-preview');
    if (!listEl) return;

    const methods = level.allowedMethods || [];
    listEl.innerHTML = methods.map(m => {
      const doc = this.spellDocs[m] || { signature: m, snippetPy: m, snippetJs: m };
      const label = this.currentLang === 'javascript' ? (doc.jsSignature || doc.signature) : doc.signature;
      return `
        <button class="spell-pill"
                onmouseenter="App.previewSpellDoc('${m.replace(/'/g, "\\'")}')"
                onclick="App.insertSpellSnippet('${m.replace(/'/g, "\\'")}')">
          ${label}
        </button>
      `;
    }).join('');

    previewEl.textContent = this.locale === 'th'
      ? 'ชี้เมาส์ที่คำสั่งเพื่อดูคำอธิบาย หรือคลิกเพื่อแทรกโค้ดลงใน Editor'
      : 'Hover over any method to read docs, or click to insert into your code.';
  },

  previewSpellDoc(methodKey) {
    const doc = this.spellDocs[methodKey];
    const previewEl = document.getElementById('spell-doc-preview');
    if (!doc || !previewEl) return;
    const text = this.locale === 'th' ? doc.descTh : doc.desc;
    previewEl.innerHTML = `<strong style="color:#ffd86b; margin-right:8px;">${doc.signature}:</strong> <span>${text}</span>`;
  },

  insertSpellSnippet(methodKey) {
    const doc = this.spellDocs[methodKey];
    const editor = document.getElementById('code-editor');
    if (!editor) return;
    const snippet = this.currentLang === 'javascript'
      ? (doc?.snippetJs || methodKey)
      : (doc?.snippetPy || methodKey);

    const val = editor.value;
    const needsNewline = val.length > 0 && !val.endsWith('\n');
    editor.value = val + (needsNewline ? '\n' : '') + snippet + '\n';
    editor.focus();
    this.updateEditorGutter();
  },

  switchCodeLanguage(newLang) {
    this.currentLang = newLang === 'javascript' ? 'javascript' : 'python';
    document.getElementById('tome-filename').textContent = this.currentLang === 'javascript' ? 'hero_script.js' : 'hero_script.py';
    if (this.currentLevel) {
      const editor = document.getElementById('code-editor');
      editor.value = this.currentLevel.starterCode?.[this.currentLang] || '';
      this.updateEditorGutter();
      this.renderSpellPalette(this.currentLevel);
    }
    if (this.user) {
      this.api('/api/user/customize', 'POST', { preferredLang: this.currentLang });
    }
  },

  resetStarterCode() {
    if (!this.currentLevel) return;
    const editor = document.getElementById('code-editor');
    editor.value = this.currentLevel.starterCode?.[this.currentLang] || '';
    this.updateEditorGutter();
    this.highlightEditorLine(null);
    this.toast('รีเซ็ตโค้ดเริ่มต้นเรียบร้อย');
  },

  async runCode() {
    if (!this.currentLevel) return;
    CocoAudio.init();
    const code = document.getElementById('code-editor').value;
    const perfBadge = document.getElementById('sim-perf-badge');
    perfBadge.textContent = 'Simulating...';

    const res = await this.api('/api/play/execute', 'POST', {
      levelSlug: this.currentLevel.slug,
      code,
      language: this.currentLang,
      heroId: this.user?.heroId || 'tharin'
    });

    if (!res.ok) {
      this.toast(res.error || 'Simulation error');
      return;
    }

    if (res.user) {
      this.user = res.user;
      this.progress = res.progress || this.progress;
      this.renderAuthBar();
    }

    perfBadge.textContent = `⚡ Backend Sim: ${res.executionTimeMs} ms (${res.ticksTaken} ticks)`;

    // Runtime / syntax error display
    const alertBox = document.getElementById('problem-alert-view');
    if (res.runtimeError) {
      alertBox.classList.remove('hidden');
      document.getElementById('problem-alert-text').textContent = `Line ${res.runtimeError.line}: ${res.runtimeError.message}`;
      this.highlightEditorLine(res.runtimeError.line);
      CocoAudio.playError();
      this.switchMobileLevelTab('code');
    } else {
      alertBox.classList.add('hidden');
      this.switchMobileLevelTab('arena');
    }

    // Animate timeline frames
    this.simFrames = res.frames || [];
    const scrubber = document.getElementById('playback-scrubber');
    scrubber.max = Math.max(0, this.simFrames.length - 1);
    scrubber.value = 0;

    this.playbackPaused = false;
    document.getElementById('btn-playback-toggle').textContent = '⏸ Pause';

    this.startPlayback(res.goals, res.victory, res.rewardGranted);
  },

  startPlayback(finalGoals, isVictory, rewardGranted) {
    this.stopPlaybackTimer();
    this.currentFrameIdx = 0;
    this.applyFrameAtIndex(0);

    const intervalMs = Math.round(280 / this.playbackSpeed);
    this.playbackTimer = setInterval(() => {
      if (this.playbackPaused) return;
      if (this.currentFrameIdx < this.simFrames.length - 1) {
        this.currentFrameIdx++;
        this.applyFrameAtIndex(this.currentFrameIdx);
      } else {
        this.stopPlaybackTimer();
        this.renderLiveGoals(finalGoals, isVictory);
        if (isVictory) {
          CocoAudio.playVictory();
          document.getElementById('btn-next-level').classList.remove('hidden');
          const msg = rewardGranted
            ? `🎉 ชนะด่านสำเร็จ! รับรางวัล +${rewardGranted.xp} XP และ +${rewardGranted.gems} 💎`
            : '🎉 ชนะด่านสำเร็จ! ผ่านครบทุกเป้าหมายแล้ว!';
          this.toast(msg);
        }
      }
    }, intervalMs);
  },

  stopPlaybackTimer() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
  },

  applyFrameAtIndex(idx) {
    const frame = this.simFrames[idx];
    if (!frame) return;
    const prev = idx > 0 ? this.simFrames[idx - 1] : frame;
    BattleRenderer.setFrame(frame, prev);

    // Play SFX for frame events
    if (idx > 0) {
      const effs = frame.effects || [];
      if (effs.some(e => e.type === 'cleave-ring')) CocoAudio.playCleave();
      else if (effs.some(e => e.type === 'fireball' || e.type === 'explosion')) CocoAudio.playFireball();
      else if (effs.some(e => e.type === 'slash')) CocoAudio.playSlash();
      else if (effs.some(e => e.type === 'pickup' || e.type === 'heal' || e.type === 'door-open')) CocoAudio.playPickup();
      else CocoAudio.playStep();
    }

    // Update scrubber & HUD
    document.getElementById('playback-scrubber').value = idx;
    document.getElementById('frame-counter').textContent = `Tick ${idx} / ${this.simFrames.length - 1}`;
    document.getElementById('hud-hp-val').textContent = `${frame.hero.hp}/${frame.hero.maxHp}`;
    const hpFillEl = document.getElementById('hud-hp-fill');
    if (hpFillEl) {
      const pct = Math.max(0, Math.min(100, Math.round((frame.hero.hp / Math.max(1, frame.hero.maxHp)) * 100)));
      hpFillEl.style.width = `${pct}%`;
    }
    document.getElementById('hud-pos-val').textContent = `${frame.hero.x}, ${frame.hero.y}`;

    this.highlightEditorLine(frame.activeLine);
  },

  scrubToFrame(val) {
    this.playbackPaused = true;
    document.getElementById('btn-playback-toggle').textContent = '▶ Play';
    this.currentFrameIdx = Number(val) || 0;
    this.applyFrameAtIndex(this.currentFrameIdx);
  },

  togglePlaybackPause() {
    this.playbackPaused = !this.playbackPaused;
    document.getElementById('btn-playback-toggle').textContent = this.playbackPaused ? '▶ Play' : '⏸ Pause';
  },

  cyclePlaybackSpeed() {
    const speeds = [1, 2, 4];
    const nextIdx = (speeds.indexOf(this.playbackSpeed) + 1) % speeds.length;
    this.playbackSpeed = speeds[nextIdx];
    document.getElementById('btn-speed').textContent = `${this.playbackSpeed}x Speed`;
  },

  renderLiveGoals(goals, isVictory) {
    const statusEl = document.getElementById('goals-overall-status');
    const listEl = document.getElementById('live-goals-list');
    if (isVictory) {
      statusEl.textContent = 'SUCCESS!';
      statusEl.className = 'goal-status complete';
    } else {
      statusEl.textContent = 'Incomplete';
      statusEl.className = 'goal-status incomplete';
    }

    listEl.innerHTML = (goals || []).map(g => {
      const icon = g.passed ? '✅' : '⭕';
      const label = this.locale === 'th' ? (g.textTh || g.text) : g.text;
      return `<li class="${g.passed ? 'passed' : 'pending'}">${icon} ${label}</li>`;
    }).join('');
  },

  goToNextLevel() {
    if (!this.currentLevel) return;
    const nextLv = this.levels.find(l => l.number === this.currentLevel.number + 1);
    if (nextLv) {
      this.navigate('level', nextLv.slug);
    } else {
      this.navigate('worlds');
    }
  },

  toggleHintsPanel() {
    const drawer = document.getElementById('hints-drawer');
    if (!drawer.classList.contains('hidden')) {
      this.closeHintsDrawer();
    } else {
      this.askAiMentor();
    }
  },

  async askAiMentor() {
    if (!this.currentLevel) return;
    const code = document.getElementById('code-editor').value;
    const res = await this.api('/api/play/ai-help', 'POST', {
      levelSlug: this.currentLevel.slug,
      code,
      language: this.currentLang
    });
    if (!res.ok) return;

    this.lastMentorSolution = res.solutionCode || '';
    const drawer = document.getElementById('hints-drawer');
    const body = document.getElementById('hints-drawer-body');
    drawer.classList.remove('hidden');
    this.switchMobileLevelTab('arena');

    const hintsHtml = (res.hints || []).map((h, i) => `<li><strong>Hint ${i + 1}:</strong> ${h}</li>`).join('');
    body.innerHTML = `
      <div style="margin-bottom:12px; padding:10px; background:#0f1522; border-left:3px solid #17b897; border-radius:6px;">
        ${(res.diagnosis || '').replace(/\n/g, '<br/>')}
      </div>
      <h4 style="color:#ffd86b; margin-bottom:6px;">💡 Step-by-Step Hints (${res.concept}):</h4>
      <ul style="padding-left:18px; margin-bottom:14px;">${hintsHtml}</ul>
      <h4 style="color:#38bdf8; margin-bottom:6px;">✨ Reference Solution (${this.currentLang}):</h4>
      <pre style="background:#0a0e17; padding:10px; border-radius:8px; font-family:monospace; color:#a3e635;">${res.solutionCode}</pre>
    `;
  },

  applyRecommendedSolution() {
    if (!this.lastMentorSolution) return;
    const editor = document.getElementById('code-editor');
    editor.value = this.lastMentorSolution;
    this.updateEditorGutter();
    this.closeHintsDrawer();
    this.switchMobileLevelTab('code');
    this.toast('✨ นำโค้ดเฉลยใส่ใน Editor แล้ว กด Run เพื่อทดสอบได้เลย!');
  },

  closeHintsDrawer() {
    const d = document.getElementById('hints-drawer');
    if (d) d.classList.add('hidden');
  },

  // ==================== AUTH & MODALS ====================
  openAuthModal() {
    this.closeModals();
    const userInp = document.getElementById('auth-username');
    const passInp = document.getElementById('auth-password');
    if (userInp) userInp.value = '';
    if (passInp) passInp.value = '';
    const errEl = document.getElementById('auth-error-msg');
    if (errEl) errEl.classList.add('hidden');
    document.getElementById('modal-auth').classList.remove('hidden');
  },

  async submitAuthForm(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    const res = await this.api('/api/auth/login', 'POST', { username, password });

    if (!res.ok) {
      const errEl = document.getElementById('auth-error-msg');
      errEl.textContent = res.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      errEl.classList.remove('hidden');
      return;
    }

    this.user = res.user;
    this.progress = res.progress || {};
    this.renderAuthBar();
    this.renderWorlds();
    this.closeModals();
    this.toast(`ยินดีต้อนรับ ${this.user.displayName}! ⚔️`);
  },

  async logout() {
    await this.api('/api/auth/logout', 'POST');
    this.user = null;
    this.progress = {};
    this.renderAuthBar();
    this.renderWorlds();
    this.toast('ออกจากระบบเรียบร้อย');
  },

  openShopModal() {
    this.closeModals();
    document.getElementById('modal-shop').classList.remove('hidden');
    this.renderShopModal();
  },

  renderShopModal() {
    const heroesGrid = document.getElementById('shop-heroes-grid');
    const itemsGrid = document.getElementById('shop-items-grid');
    const equipped = this.user?.equippedItems || ['simple-boots', 'simple-sword'];
    const currentHeroId = this.user?.heroId || 'tharin';

    const itemSprites = {
      'simple-boots': 'flask_big_green.png',
      'simple-sword': 'weapon_knight_sword.png',
      'bronze-shield': 'flask_big_blue.png',
      'programonomicon': 'flask_big_yellow.png',
      'long-sword': 'weapon_katana.png',
      'leather-armor': 'chest_full_open_anim_f0.png',
      'cleave-helm': 'cleave_whirlwind.svg',
      'arcanist-staff': 'weapon_red_magic_staff.png'
    };

    const itemRpgSlots = {
      'simple-boots': 'shoes-slot',
      'simple-sword': 'weapon-slot',
      'bronze-shield': 'shield-slot',
      'programonomicon': 'magic-slot',
      'long-sword': 'sword',
      'leather-armor': 'armor-slot',
      'cleave-helm': 'helmet-slot',
      'arcanist-staff': 'magic-slot'
    };

    heroesGrid.innerHTML = this.heroes.map(h => {
      const isSelected = currentHeroId === h.id;
      const isUnlocked = h.unlockedByDefault || equipped.includes(`hero:${h.id}`) || isSelected;
      return `
        <div class="shop-card rpgui-container ${isSelected ? 'framed-golden selected' : 'framed-grey'} rpgui-flow-box">
          <div class="shop-hero-banner">
            <img src="/assets/sprites/portrait_${h.id}.svg" class="shop-hero-portrait" alt="${h.name}">
            <div class="shop-hero-sprite-badge" title="Animated Idle Sprite">
              <span class="sprite-animated sprite-${h.id}"></span>
            </div>
          </div>
          <div>
            <h4>${h.name}</h4>
            <div style="font-size:11.5px; color:#38bdf8; margin-bottom:6px;">${h.role}</div>
            <p>${h.description}</p>
            <div style="font-size:12px; margin-top:8px; color:#cbd5e1;">
              <span class="rpgui-icon potion-red rpgui-icon-xs"></span> +${h.hpBonus} HP | <span class="rpgui-icon sword rpgui-icon-xs"></span> +${h.attackBonus} ATK
            </div>
          </div>
          <button class="btn-coco btn-sm ${isSelected ? 'btn-teal' : 'btn-gold-illustrated'} full-width"
                  onclick="App.selectOrBuyHero('${h.id}')">
            ${isSelected ? '✓ Selected' : isUnlocked ? 'Select Hero' : `Unlock (${h.cost} 💎)`}
          </button>
        </div>
      `;
    }).join('');

    itemsGrid.innerHTML = this.shopItems.map(item => {
      const owned = equipped.includes(item.id);
      const spriteFile = itemSprites[item.id] || 'weapon_knight_sword.png';
      const slotIcon = itemRpgSlots[item.id] || 'weapon-slot';
      return `
        <div class="shop-card rpgui-container ${owned ? 'framed-golden selected' : 'framed-grey'} rpgui-flow-box">
          <div class="shop-item-preview">
            <span class="rpgui-icon ${slotIcon} rpgui-icon-sm"></span>
            <img src="/assets/sprites/${spriteFile}" class="shop-item-img" alt="${item.name}">
          </div>
          <div>
            <h4>${item.icon} ${item.name}</h4>
            <p>${item.description}</p>
            <div style="font-size:11px; color:#a3e635; margin-top:6px; font-family:monospace;">
              Unlocks: ${item.methods[0]}
            </div>
          </div>
          <button class="btn-coco btn-sm ${owned ? 'btn-teal' : 'btn-gold-illustrated'} full-width"
                  ${owned ? 'disabled' : `onclick="App.buyShopItem('${item.id}')"`}>
            ${owned ? '✓ Equipped' : `Buy (${item.cost} 💎)`}
          </button>
        </div>
      `;
    }).join('');
  },

  async selectOrBuyHero(heroId) {
    if (!this.user) return this.openAuthModal('login');
    const res = await this.api('/api/user/customize', 'POST', { selectHeroId: heroId });
    if (!res.ok) return this.toast(res.error);
    this.user = res.user;
    this.renderAuthBar();
    this.renderShopModal();
    this.toast('อัปเดตฮีโร่เรียบร้อย!');
  },

  async buyShopItem(itemId) {
    if (!this.user) return this.openAuthModal('login');
    const res = await this.api('/api/user/customize', 'POST', { buyItemId: itemId });
    if (!res.ok) return this.toast(res.error);
    this.user = res.user;
    this.renderAuthBar();
    this.renderShopModal();
    this.toast('ซื้อและสวมใส่อุปกรณ์สำเร็จ!');
  },

  async openLeaderboardModal() {
    this.closeModals();
    document.getElementById('modal-leaderboard').classList.remove('hidden');
    const res = await this.api('/api/leaderboard');
    if (!res.ok) return;
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = (res.leaderboard || []).map((row, idx) => `
      <tr>
        <td><strong>#${idx + 1}</strong></td>
        <td>${row.display_name} <span style="color:#64748b">(@${row.username})</span></td>
        <td>${row.hero_id}</td>
        <td>⭐ ${row.completed_levels} / ${this.levels?.length || 25}</td>
        <td><strong>${row.xp} XP</strong></td>
        <td>💎 ${row.gems}</td>
      </tr>
    `).join('');
  },

  closeModals() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) navLinks.classList.remove('mobile-open');
    document.querySelectorAll('.coco-modal-backdrop').forEach(el => el.classList.add('hidden'));
  },

  toggleLocale() {
    this.locale = this.locale === 'th' ? 'en' : 'th';
    document.getElementById('locale-label').textContent = this.locale.toUpperCase();
    this.renderWorlds();
    if (this.currentView === 'world-map') {
      this.openWorldMap(this.currentWorldSlug);
    }
    this.toast(this.locale === 'th' ? 'เปลี่ยนภาษาเป็น ภาษาไทย' : 'Switched language to English');
  },

  toggleAudio() {
    CocoAudio.enabled = !CocoAudio.enabled;
    document.getElementById('audio-label').textContent = CocoAudio.enabled ? 'SFX On' : 'Muted';
  },

  toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
      navLinks.classList.toggle('mobile-open');
    }
  },

  switchMobileLevelTab(tabName) {
    const ws = document.getElementById('level-workspace');
    const tabArena = document.getElementById('mob-tab-arena');
    const tabCode = document.getElementById('mob-tab-code');
    if (!ws) return;
    ws.classList.toggle('mobile-tab-arena', tabName === 'arena');
    ws.classList.toggle('mobile-tab-code', tabName === 'code');
    if (tabArena) tabArena.classList.toggle('active', tabName === 'arena');
    if (tabCode) tabCode.classList.toggle('active', tabName === 'code');
  },

  async runCodeFromMobile() {
    await this.runCode();
  },

  toast(msg) {
    const el = document.getElementById('coco-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.add('hidden'), 3400);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
