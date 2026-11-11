/**
 * CodeCombat Local — 60fps HTML5 Canvas 2D Battle Renderer
 * Multi-frame animated sprite engine featuring:
 * - 4-frame idle & run animations for Heroes (Tharin, Anya, Hattori, Amara)
 * - 4-frame animated sprites for Enemies (Goblins, Ogres, Shamans, Skeletons, Demon Boss)
 * - Dynamic weapon swing & hurt flash reactions
 * - Horizontal flipping when moving or facing left
 * - Multi-frame animated dungeon hazards (spikes, spinning coins, open/closed doors)
 * - Themed floor and wall tilesets with ambient world overlays
 * - High-res particle & magic effects (slash arc, cleave whirlwind, fireball explosions)
 */
const BattleRenderer = {
  canvas: null,
  ctx: null,
  tileSize: 64,
  cols: 12,
  rows: 8,
  level: null,
  worldTheme: 'dungeon',
  heroColor: '#e67e22',
  heroId: 'tharin',
  currentFrame: null,
  prevFrame: null,
  interp: 1,
  hoverTile: null,
  animTick: 0,
  rafId: null,

  // Image cache and loader
  imageCache: {},

  HERO_SPRITES: {
    tharin: {
      idle: ['knight_m_idle_anim_f0.png', 'knight_m_idle_anim_f1.png', 'knight_m_idle_anim_f2.png', 'knight_m_idle_anim_f3.png'],
      run: ['knight_m_run_anim_f0.png', 'knight_m_run_anim_f1.png', 'knight_m_run_anim_f2.png', 'knight_m_run_anim_f3.png'],
      hit: 'knight_m_hit_anim_f0.png',
      weapon: 'weapon_knight_sword.png',
      scale: 2.3,
      offsetY: -6
    },
    anya: {
      idle: ['knight_f_idle_anim_f0.png', 'knight_f_idle_anim_f1.png', 'knight_f_idle_anim_f2.png', 'knight_f_idle_anim_f3.png'],
      run: ['knight_f_run_anim_f0.png', 'knight_f_run_anim_f1.png', 'knight_f_run_anim_f2.png', 'knight_f_run_anim_f3.png'],
      hit: 'knight_f_hit_anim_f0.png',
      weapon: 'weapon_regular_sword.png',
      scale: 2.3,
      offsetY: -6
    },
    hattori: {
      idle: ['lizard_m_idle_anim_f0.png', 'lizard_m_idle_anim_f1.png', 'lizard_m_idle_anim_f2.png', 'lizard_m_idle_anim_f3.png'],
      run: ['lizard_m_run_anim_f0.png', 'lizard_m_run_anim_f1.png', 'lizard_m_run_anim_f2.png', 'lizard_m_run_anim_f3.png'],
      hit: 'lizard_m_hit_anim_f0.png',
      weapon: 'weapon_katana.png',
      scale: 2.3,
      offsetY: -6
    },
    amara: {
      idle: ['wizzard_f_idle_anim_f0.png', 'wizzard_f_idle_anim_f1.png', 'wizzard_f_idle_anim_f2.png', 'wizzard_f_idle_anim_f3.png'],
      run: ['wizzard_f_run_anim_f0.png', 'wizzard_f_run_anim_f1.png', 'wizzard_f_run_anim_f2.png', 'wizzard_f_run_anim_f3.png'],
      hit: 'wizzard_f_hit_anim_f0.png',
      weapon: 'weapon_red_magic_staff.png',
      scale: 2.3,
      offsetY: -6
    }
  },

  ENEMY_SPRITES: {
    'munchkin': {
      idle: ['goblin_idle_anim_f0.png', 'goblin_idle_anim_f1.png', 'goblin_idle_anim_f2.png', 'goblin_idle_anim_f3.png'],
      run: ['goblin_run_anim_f0.png', 'goblin_run_anim_f1.png', 'goblin_run_anim_f2.png', 'goblin_run_anim_f3.png'],
      scale: 2.2,
      offsetY: -4
    },
    'ogre': {
      idle: ['ogre_idle_anim_f0.png', 'ogre_idle_anim_f1.png', 'ogre_idle_anim_f2.png', 'ogre_idle_anim_f3.png'],
      run: ['ogre_run_anim_f0.png', 'ogre_run_anim_f1.png', 'ogre_run_anim_f2.png', 'ogre_run_anim_f3.png'],
      scale: 2.6,
      offsetY: -10
    },
    'thrower': {
      idle: ['orc_shaman_idle_anim_f0.png', 'orc_shaman_idle_anim_f1.png', 'orc_shaman_idle_anim_f2.png', 'orc_shaman_idle_anim_f3.png'],
      run: ['orc_shaman_run_anim_f0.png', 'orc_shaman_run_anim_f1.png', 'orc_shaman_run_anim_f2.png', 'orc_shaman_run_anim_f3.png'],
      scale: 2.2,
      offsetY: -4
    },
    'skeleton': {
      idle: ['skelet_idle_anim_f0.png', 'skelet_idle_anim_f1.png', 'skelet_idle_anim_f2.png', 'skelet_idle_anim_f3.png'],
      run: ['skelet_run_anim_f0.png', 'skelet_run_anim_f1.png', 'skelet_run_anim_f2.png', 'skelet_run_anim_f3.png'],
      scale: 2.2,
      offsetY: -4
    },
    'skeleton-boss': {
      idle: ['big_demon_idle_anim_f0.png', 'big_demon_idle_anim_f1.png', 'big_demon_idle_anim_f2.png', 'big_demon_idle_anim_f3.png'],
      run: ['big_demon_run_anim_f0.png', 'big_demon_run_anim_f1.png', 'big_demon_run_anim_f2.png', 'big_demon_run_anim_f3.png'],
      scale: 2.8,
      offsetY: -12
    }
  },

  THEMES: {
    dungeon: {
      floorA: '#1d2230',
      floorB: '#222838',
      floorOverlay: 'rgba(29, 34, 48, 0.35)',
      wallTop: '#363f54',
      wallSide: '#141822',
      gridLine: 'rgba(255,255,255,0.06)'
    },
    forest: {
      floorA: '#193324',
      floorB: '#1e3c2b',
      floorOverlay: 'rgba(25, 51, 36, 0.45)',
      wallTop: '#2d5a3c',
      wallSide: '#102418',
      gridLine: 'rgba(255,255,255,0.06)'
    },
    desert: {
      floorA: '#4a321f',
      floorB: '#543924',
      floorOverlay: 'rgba(74, 50, 31, 0.45)',
      wallTop: '#7d5432',
      wallSide: '#2e1d10',
      gridLine: 'rgba(255,235,200,0.07)'
    },
    mountain: {
      floorA: '#24303f',
      floorB: '#2a3748',
      floorOverlay: 'rgba(36, 48, 63, 0.4)',
      wallTop: '#485d78',
      wallSide: '#161e29',
      gridLine: 'rgba(255,255,255,0.06)'
    },
    glacier: {
      floorA: '#12355b',
      floorB: '#163f6b',
      floorOverlay: 'rgba(18, 53, 91, 0.45)',
      wallTop: '#2c6aa6',
      wallSide: '#0b213a',
      gridLine: 'rgba(180,235,255,0.08)'
    }
  },

  getImage(name) {
    if (!name) return null;
    if (!this.imageCache[name]) {
      const img = new Image();
      img.src = `/assets/sprites/${name}`;
      this.imageCache[name] = img;
    }
    return this.imageCache[name];
  },

  isLoaded(img) {
    return img && img.complete && img.naturalWidth > 0;
  },

  preload() {
    // Preload hero sprites
    Object.values(this.HERO_SPRITES).forEach(h => {
      h.idle.forEach(f => this.getImage(f));
      h.run.forEach(f => this.getImage(f));
      if (h.hit) this.getImage(h.hit);
      if (h.weapon) this.getImage(h.weapon);
    });

    // Preload enemy sprites
    Object.values(this.ENEMY_SPRITES).forEach(e => {
      e.idle.forEach(f => this.getImage(f));
      e.run.forEach(f => this.getImage(f));
    });

    // Preload tiles & items
    for (let i = 1; i <= 8; i++) this.getImage(`floor_${i}.png`);
    ['wall_mid.png', 'wall_top_mid.png', 'wall_left.png', 'wall_right.png'].forEach(f => this.getImage(f));
    for (let i = 0; i < 4; i++) {
      this.getImage(`floor_spikes_anim_f${i}.png`);
      this.getImage(`coin_anim_f${i}.png`);
    }
    ['doors_leaf_closed.png', 'doors_leaf_open.png', 'doors_frame_top.png'].forEach(f => this.getImage(f));
    ['flask_big_red.png', 'flask_big_blue.png', 'flask_big_green.png', 'skull.png'].forEach(f => this.getImage(f));
    ['gem_crystal.svg', 'slash_arc.svg', 'cleave_whirlwind.svg', 'fireball_explosion.svg'].forEach(f => this.getImage(f));
  },

  init(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.preload();

    canvasEl.addEventListener('mousemove', e => {
      const rect = canvasEl.getBoundingClientRect();
      const scaleX = canvasEl.width / rect.width;
      const scaleY = canvasEl.height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const tx = Math.floor(px / this.tileSize);
      const ty = Math.floor(py / this.tileSize);
      if (tx >= 0 && tx < this.cols && ty >= 0 && ty < this.rows) {
        this.hoverTile = { x: tx, y: ty };
        const el = document.getElementById('hud-cursor-val');
        if (el) el.textContent = `${tx}, ${ty}`;
      }
    });

    canvasEl.addEventListener('mouseleave', () => {
      this.hoverTile = null;
    });

    const loop = () => {
      this.animTick += 0.07;
      if (this.interp < 1) {
        this.interp = Math.min(1, this.interp + 0.16);
      }
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(loop);
    }
  },

  loadLevel(level, worldTheme = 'dungeon', heroColor = '#e67e22', heroId = 'tharin') {
    this.level = level;
    this.worldTheme = worldTheme || level.world || 'dungeon';
    this.heroColor = heroColor;
    this.heroId = heroId || this.heroId || 'tharin';
    this.cols = level.grid.width || 12;
    this.rows = level.grid.height || 8;
    this.tileSize = 64;
    if (this.canvas) {
      this.canvas.width = this.cols * this.tileSize;
      this.canvas.height = this.rows * this.tileSize;
      const ctx = this.canvas.getContext('2d');
      if (ctx) ctx.imageSmoothingEnabled = false;
    }
  },

  setFrame(frame, prevFrame = null) {
    this.prevFrame = prevFrame || frame;
    this.currentFrame = frame;
    this.interp = prevFrame ? 0 : 1;
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  draw() {
    if (!this.ctx || !this.level || !this.currentFrame) return;
    const ctx = this.ctx;
    const ts = this.tileSize;
    const theme = this.THEMES[this.worldTheme] || this.THEMES.dungeon;
    const f = this.currentFrame;
    const pf = this.prevFrame || f;
    const t = this.interp;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const wallSet = new Set((this.level.grid.walls || []).map(w => `${w.x},${w.y}`));
    const spikeSet = new Set((this.level.grid.spikes || []).map(s => `${s.x},${s.y}`));

    // ==========================================
    // 1. FLOOR TILES & WALLS & SPIKES
    // ==========================================
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const px = x * ts;
        const py = y * ts;
        const key = `${x},${y}`;

        if (wallSet.has(key)) {
          // Dungeon Stone Wall Sprite
          const wallMidImg = this.getImage('wall_mid.png');
          const wallTopImg = this.getImage('wall_top_mid.png');

          if (this.isLoaded(wallMidImg) && this.isLoaded(wallTopImg)) {
            // Draw 3D layered wall block
            ctx.drawImage(wallTopImg, px, py, ts, ts * 0.45);
            ctx.drawImage(wallMidImg, px, py + ts * 0.45, ts, ts * 0.55);
            // Ambient world overlay for mountain/desert/glacier/forest
            if (theme.floorOverlay) {
              ctx.fillStyle = theme.floorOverlay;
              ctx.fillRect(px, py, ts, ts);
            }
          } else {
            // High-detail procedural stone wall fallback
            ctx.fillStyle = theme.wallSide;
            ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
            ctx.fillStyle = theme.wallTop;
            ctx.fillRect(px + 4, py + 4, ts - 8, ts - 14);
          }
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, ts, ts);
        } else {
          // Walkable Floor Sprite (8-variation stone tiles)
          const floorVariant = ((x * 7 + y * 13) % 8) + 1;
          const floorImg = this.getImage(`floor_${floorVariant}.png`);

          if (this.isLoaded(floorImg)) {
            ctx.drawImage(floorImg, px, py, ts, ts);
            // Subtle world atmosphere tint
            if (theme.floorOverlay) {
              ctx.fillStyle = theme.floorOverlay;
              ctx.fillRect(px, py, ts, ts);
            }
          } else {
            ctx.fillStyle = (x + y) % 2 === 0 ? theme.floorA : theme.floorB;
            ctx.fillRect(px, py, ts, ts);
          }

          // Subtle grid lines & coordinate labels
          ctx.strokeStyle = theme.gridLine;
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, ts, ts);

          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.font = '9.5px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${x},${y}`, px + 4, py + 12);

          // Animated Floor Spikes Hazard
          if (spikeSet.has(key)) {
            const spikeFrame = Math.floor(this.animTick * 3.5) % 4;
            const spikeImg = this.getImage(`floor_spikes_anim_f${spikeFrame}.png`);
            if (this.isLoaded(spikeImg)) {
              ctx.drawImage(spikeImg, px + 4, py + 4, ts - 8, ts - 8);
            } else {
              // Vector hazard fallback
              ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
              ctx.fillRect(px + 6, py + 6, ts - 12, ts - 12);
              ctx.fillStyle = '#cbd5e1';
              const pts = [[px + 18, py + 46], [px + 32, py + 46], [px + 46, py + 46]];
              for (const [sx, sy] of pts) {
                ctx.beginPath();
                ctx.moveTo(sx - 6, sy);
                ctx.lineTo(sx, sy - 18);
                ctx.lineTo(sx + 6, sy);
                ctx.closePath();
                ctx.fill();
              }
            }
          }
        }
      }
    }

    // Hover tile highlight
    if (this.hoverTile) {
      ctx.strokeStyle = 'rgba(245, 185, 38, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.hoverTile.x * ts + 1.5, this.hoverTile.y * ts + 1.5, ts - 3, ts - 3);
    }

    // ==========================================
    // 2. DOORS (Locked / Open Dungeon Portals)
    // ==========================================
    for (const d of f.doors || []) {
      const px = d.x * ts;
      const py = d.y * ts;
      if (d.locked) {
        const doorImg = this.getImage('doors_leaf_closed.png');
        const frameImg = this.getImage('doors_frame_top.png');
        if (this.isLoaded(doorImg)) {
          ctx.drawImage(doorImg, px + 2, py + 2, ts - 4, ts - 4);
          if (this.isLoaded(frameImg)) ctx.drawImage(frameImg, px, py - 10, ts, 16);
        } else {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px + 6, py + 6, ts - 12, ts - 12);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 6, py + 6, ts - 12, ts - 12);
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔒', px + ts / 2, py + ts / 2 + 8);
        }
      } else {
        const doorOpenImg = this.getImage('doors_leaf_open.png');
        if (this.isLoaded(doorOpenImg)) {
          ctx.drawImage(doorOpenImg, px + 2, py + 2, ts - 4, ts - 4);
        } else {
          ctx.strokeStyle = 'rgba(46, 204, 113, 0.6)';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 8, py + 8, ts - 16, ts - 16);
        }
      }
    }

    // ==========================================
    // 3. BUILT STRUCTURES (Fences & Traps)
    // ==========================================
    for (const s of f.structures || []) {
      if (!s.active) continue;
      const px = s.x * ts + ts / 2;
      const py = s.y * ts + ts / 2;
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.type === 'fence' ? '🪵' : '💣', px, py + 8);
    }

    // ==========================================
    // 4. ITEMS (Spinning Coins, Crystal Gems, Potions, Chests)
    // ==========================================
    for (const item of f.items || []) {
      if (item.collected) continue;
      const cx = item.x * ts + ts / 2;
      const floatY = Math.sin(this.animTick * 3 + item.x) * 3.5;
      const cy = item.y * ts + ts / 2 + floatY;

      if (item.type === 'gem') {
        // High-res Vector Crystal Gem with ambient glow
        const gemImg = this.getImage('gem_crystal.svg');
        if (this.isLoaded(gemImg)) {
          ctx.save();
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 12;
          ctx.drawImage(gemImg, cx - 14, cy - 14, 28, 28);
          ctx.restore();
        } else {
          ctx.save();
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#00e5ff';
          ctx.beginPath();
          ctx.moveTo(cx, cy - 14);
          ctx.lineTo(cx + 12, cy);
          ctx.lineTo(cx, cy + 14);
          ctx.lineTo(cx - 12, cy);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else if (item.type === 'coin') {
        // 4-frame animated spinning gold coin
        const coinFrame = Math.floor(this.animTick * 7 + item.x) % 4;
        const coinImg = this.getImage(`coin_anim_f${coinFrame}.png`);
        if (this.isLoaded(coinImg)) {
          ctx.save();
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 8;
          ctx.drawImage(coinImg, cx - 11, cy - 11, 22, 22);
          ctx.restore();
        } else {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (item.type === 'potion') {
        // High-potency health potion flask
        const flaskImg = this.getImage('flask_big_red.png');
        if (this.isLoaded(flaskImg)) {
          ctx.save();
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 6;
          ctx.drawImage(flaskImg, cx - 12, cy - 14, 24, 28);
          ctx.restore();
        } else {
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🧪', cx, cy + 8);
        }
      } else if (item.type === 'chest') {
        const chestFrame = Math.min(2, Math.floor(this.animTick * 2) % 3);
        const chestImg = this.getImage(`chest_full_open_anim_f${chestFrame}.png`);
        if (this.isLoaded(chestImg)) {
          ctx.drawImage(chestImg, cx - 16, cy - 16, 32, 32);
        } else {
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('📦', cx, cy + 8);
        }
      } else {
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✨', cx, cy + 8);
      }
    }

    // ==========================================
    // 5. ENEMIES (Goblins, Ogres, Shamans, Skeletons, Demon Boss)
    // ==========================================
    for (const enemy of f.enemies || []) {
      if (!enemy.alive) {
        // Defeated Enemy Skull Marker
        const skullImg = this.getImage('skull.png');
        const sx = enemy.x * ts + ts / 2;
        const sy = enemy.y * ts + ts / 2;
        if (this.isLoaded(skullImg)) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.drawImage(skullImg, sx - 10, sy - 10, 20, 20);
          ctx.restore();
        } else {
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillText('💀', sx, sy + 6);
        }
        continue;
      }

      const prevE = (pf.enemies || []).find(e => e.id === enemy.id) || enemy;
      const ex = this.lerp(prevE.x, enemy.x, t) * ts + ts / 2;
      const ey = this.lerp(prevE.y, enemy.y, t) * ts + ts / 2;

      const isMoving = (prevE.x !== enemy.x || prevE.y !== enemy.y) && t < 0.98;
      const isHurt = enemy.hp < prevE.hp && t < 0.6;
      const facingLeft = enemy.x < prevE.x || (f.hero.x < enemy.x);

      // Select Enemy Sprite Config
      const enemyCfg = this.ENEMY_SPRITES[enemy.type] || this.ENEMY_SPRITES.munchkin;
      const animRate = isMoving ? 8 : 4;
      const frameIdx = Math.floor(this.animTick * animRate) % 4;
      const spriteName = isMoving ? enemyCfg.run[frameIdx] : enemyCfg.idle[frameIdx];
      const spriteImg = this.getImage(spriteName);

      const isBoss = enemy.type === 'skeleton-boss' || enemy.type === 'ogre';
      const radius = isBoss ? 22 : 16;

      // Ground Drop Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + radius + 1, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      if (this.isLoaded(spriteImg)) {
        ctx.save();
        ctx.translate(ex, ey + (enemyCfg.offsetY || 0));

        // Horizontal flip when facing left
        if (facingLeft) {
          ctx.scale(-1, 1);
        }

        // Red hurt flash filter when taking damage
        if (isHurt) {
          ctx.filter = 'brightness(1.8) drop-shadow(0 0 6px #ef4444)';
        }

        const sw = spriteImg.naturalWidth * (enemyCfg.scale || 2.2);
        const sh = spriteImg.naturalHeight * (enemyCfg.scale || 2.2);
        ctx.drawImage(spriteImg, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();
      } else {
        // Fallback Enemy Circle & Icon
        ctx.fillStyle = enemy.type.includes('skeleton') ? '#64748b' : '#dc2626';
        ctx.beginPath();
        ctx.arc(ex, ey, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fca5a5';
        ctx.stroke();

        ctx.font = isBoss ? '22px sans-serif' : '18px sans-serif';
        ctx.textAlign = 'center';
        const icon = enemy.type === 'skeleton-boss' ? '👑' : enemy.type === 'skeleton' ? '💀' : '👹';
        ctx.fillText(icon, ex, ey + 7);
      }

      // Health Bar
      this.drawHealthBar(ctx, ex, ey - radius - 14, isBoss ? 48 : 36, 5, enemy.hp, enemy.maxHp, '#ef4444');

      // Nameplate
      ctx.fillStyle = '#fecaca';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.name, ex, ey + radius + 15);
    }

    // ==========================================
    // 6. HERO (Sir Tharin, Anya, Hattori, Amara)
    // ==========================================
    const hx = this.lerp(pf.hero.x, f.hero.x, t) * ts + ts / 2;
    const hy = this.lerp(pf.hero.y, f.hero.y, t) * ts + ts / 2;

    const heroMoving = (pf.hero.x !== f.hero.x || pf.hero.y !== f.hero.y) && t < 0.98;
    const heroHurt = f.hero.hp < pf.hero.hp && t < 0.6;
    const heroAttacking = (f.effects || []).some(e => e.type === 'slash' || e.type === 'cleave-ring');
    const heroFacingLeft = f.hero.facing === 'left' || (pf.hero.x > f.hero.x);

    // Hero Config
    const heroCfg = this.HERO_SPRITES[this.heroId] || this.HERO_SPRITES.tharin;
    const heroAnimRate = heroMoving ? 8 : 4;
    const heroFrameIdx = Math.floor(this.animTick * heroAnimRate) % 4;

    let heroSpriteName;
    if (heroHurt && heroCfg.hit) {
      heroSpriteName = heroCfg.hit;
    } else if (heroMoving) {
      heroSpriteName = heroCfg.run[heroFrameIdx];
    } else {
      heroSpriteName = heroCfg.idle[heroFrameIdx];
    }
    const heroSpriteImg = this.getImage(heroSpriteName);

    // Shield Aura
    if (f.hero.shielded) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(hx, hy, 27, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Hero Drop Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.ellipse(hx, hy + 18, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.isLoaded(heroSpriteImg)) {
      ctx.save();
      ctx.translate(hx, hy + (heroCfg.offsetY || -6));

      // Horizontal flip when facing left
      if (heroFacingLeft) {
        ctx.scale(-1, 1);
      }

      // Hurt Flash
      if (heroHurt) {
        ctx.filter = 'brightness(2.2) drop-shadow(0 0 6px #ef4444)';
      }

      const hw = heroSpriteImg.naturalWidth * (heroCfg.scale || 2.3);
      const hh = heroSpriteImg.naturalHeight * (heroCfg.scale || 2.3);
      ctx.drawImage(heroSpriteImg, -hw / 2, -hh / 2, hw, hh);

      // Render Hero Equipped Weapon with attack swing animation!
      const weaponImg = this.getImage(heroCfg.weapon);
      if (this.isLoaded(weaponImg) && f.hero.hp > 0) {
        ctx.save();
        // Weapon position at hero's side/hand
        const wx = 10;
        const wy = 4;
        ctx.translate(wx, wy);

        // Weapon swing angle when attacking
        let rot = 0.35; // default angle
        if (heroAttacking) {
          // Dynamic swing arc from -45 to 65 degrees
          rot = -0.6 + Math.sin(t * Math.PI) * 1.5;
        } else if (heroMoving) {
          rot += Math.sin(this.animTick * 8) * 0.2;
        }
        ctx.rotate(rot);

        const ww = weaponImg.naturalWidth * 1.8;
        const wh = weaponImg.naturalHeight * 1.8;
        ctx.drawImage(weaponImg, -ww / 2, -wh * 0.8, ww, wh);
        ctx.restore();
      }

      ctx.restore();
    } else {
      // Procedural armored hero fallback
      ctx.fillStyle = f.hero.hp > 0 ? this.heroColor : '#475569';
      ctx.beginPath();
      ctx.arc(hx, hy, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();

      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.hero.hp > 0 ? '🤺' : '💫', hx, hy + 7);
    }

    // Hero HP Bar
    this.drawHealthBar(ctx, hx, hy - 32, 46, 6, f.hero.hp, f.hero.maxHp, '#22c55e');

    // Hero Speech Bubble
    if (f.hero.speech) {
      this.drawSpeechBubble(ctx, hx, hy - 45, f.hero.speech);
    }

    // ==========================================
    // 7. COMBAT EFFECTS (Slash Arcs, Cleave Whirlwinds, Fireballs)
    // ==========================================
    for (const eff of f.effects || []) {
      const ex = (eff.x ?? f.hero.x) * ts + ts / 2;
      const ey = (eff.y ?? f.hero.y) * ts + ts / 2;

      if (eff.type === 'cleave-ring') {
        // High-res Spinning Golden Whirlwind
        const cleaveImg = this.getImage('cleave_whirlwind.svg');
        if (this.isLoaded(cleaveImg)) {
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(this.animTick * 12);
          const cleaveScale = 0.5 + t * 1.6;
          const sz = 90 * cleaveScale;
          ctx.globalAlpha = Math.max(0, 1 - t * 0.8);
          ctx.drawImage(cleaveImg, -sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        } else {
          ctx.save();
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(ex, ey, ts * 1.4 * t, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (eff.type === 'slash') {
        // High-res Blade Slash Arc pointing toward target
        const slashImg = this.getImage('slash_arc.svg');
        const fromX = (eff.fromX ?? f.hero.x) * ts + ts / 2;
        const fromY = (eff.fromY ?? f.hero.y) * ts + ts / 2;
        const angle = Math.atan2(ey - fromY, ex - fromX);

        if (this.isLoaded(slashImg)) {
          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(angle);
          ctx.globalAlpha = Math.max(0, 1 - t * 0.9);
          const ssz = 52;
          ctx.drawImage(slashImg, -ssz / 2, -ssz / 2, ssz, ssz);
          ctx.restore();
        }
      } else if (eff.type === 'fireball' && typeof eff.fromX === 'number') {
        // High-res Radiant Fireball Explosion
        const fx = this.lerp(eff.fromX, eff.x, t) * ts + ts / 2;
        const fy = this.lerp(eff.fromY, eff.y, t) * ts + ts / 2;
        const fireImg = this.getImage('fireball_explosion.svg');

        if (this.isLoaded(fireImg)) {
          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(this.animTick * 10);
          const fsz = 34 + Math.sin(this.animTick * 8) * 4;
          ctx.drawImage(fireImg, -fsz / 2, -fsz / 2, fsz, fsz);
          ctx.restore();
        } else {
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(fx, fy, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Floating Combat Text
      if (eff.text) {
        ctx.save();
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText(eff.text, ex, ey - 20 - t * 16);
        ctx.restore();
      }
    }
  },

  drawHealthBar(ctx, cx, topY, w, h, hp, maxHp, fillColor) {
    const ratio = Math.max(0, Math.min(1, hp / (maxHp || 1)));
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(cx - w / 2, topY, w, h);
    ctx.fillStyle = fillColor;
    ctx.fillRect(cx - w / 2 + 1, topY + 1, Math.max(0, (w - 2) * ratio), h - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - w / 2, topY, w, h);
  },

  drawSpeechBubble(ctx, cx, topY, text) {
    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    const pad = 10;
    const tw = ctx.measureText(text).width + pad * 2;
    const bx = cx - tw / 2;
    const by = topY - 24;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, tw, 24);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, tw, 24);
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, by + 16);
    ctx.restore();
  }
};
