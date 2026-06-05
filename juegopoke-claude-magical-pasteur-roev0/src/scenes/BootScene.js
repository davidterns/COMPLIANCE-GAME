// Generates game textures procedurally via Phaser Graphics.generateTexture()
// (guaranteed CanvasSource, works with both rt.drawFrame() and add.image())
// Terrain + character pixel data comes from src/AssetData.js (auto-generated).
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Only load images that are used directly (not via rt.drawFrame)
    // Principle/monster sprites: plain images used in BattleScene as add.image()
    ['cristal-front','cristal-back','valor-front','valor-back','sabio-front','sabio-back'].forEach(k =>
      this.load.image(k, `assets/${k}.png`)
    );
    // NOTE: tileset and char spritesheets are NOT loaded here because
    // load.spritesheet() (ImageSource) is incompatible with rt.drawFrame() in
    // this Canvas renderer. All terrain and character textures are generated
    // procedurally via _generateTerrainTextures() and _generateCharTextures().
  }

  create() {
    this._generateLeaderTextures();
    this._generateTileTextures();      // building tiles (wall, roof, door, floor)
    this._generateTerrainTextures();   // terrain tiles from TILE_DATA pixel arrays
    this._generateCharTextures();      // character sprites from CHAR_DATA pixel arrays
    this._generateUITextures();
    this.scene.start('StartScene');
  }

  _makeTexture(key, w, h, drawFn) {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // Render a pixel-run array to a named texture
  // runs format: [x, y, width, 0xRRGGBB] or [x, y, width, 0xRRGGBB, alpha]
  _makeTextureFromRuns(key, w, h, runs) {
    this._makeTexture(key, w, h, g => {
      let lastColor = -1, lastAlpha = -1;
      for (const run of runs) {
        const rx = run[0], ry = run[1], rw = run[2], color = run[3];
        const alpha = run.length > 4 ? run[4] : 1;
        if (color !== lastColor || alpha !== lastAlpha) {
          g.fillStyle(color, alpha);
          lastColor = color; lastAlpha = alpha;
        }
        g.fillRect(rx, ry, rw, 1);
      }
    });
  }

  // ── LEADER TEXTURES (32×60) ───────────────────────────────────────────────
  _generateLeaderTextures() {
    this._makeTexture('leader0', 32, 60, g => Sprites.drawLeader0(g, 0, 0));
    this._makeTexture('leader1', 32, 60, g => Sprites.drawLeader1(g, 0, 0));
    this._makeTexture('leader2', 32, 60, g => Sprites.drawLeader2(g, 0, 0));
  }

  // ── TERRAIN TEXTURES (16×16) from TILE_DATA ───────────────────────────────
  _generateTerrainTextures() {
    ['tile-grass', 'tile-path', 'tile-tree'].forEach(key => {
      this._makeTextureFromRuns(key, 16, 16, TILE_DATA[key]);
    });
  }

  // ── CHARACTER TEXTURES (16×20) from CHAR_DATA ─────────────────────────────
  _generateCharTextures() {
    // Player directional frames
    ['player-down', 'player-left', 'player-right', 'player-up'].forEach(key => {
      this._makeTextureFromRuns(key, 16, 20, CHAR_DATA[key]);
    });
    // NPCs and Professor Oak (single standing-down frame each)
    ['char-oak', 'char-npc0', 'char-npc1', 'char-npc2'].forEach(key => {
      this._makeTextureFromRuns(key, 16, 20, CHAR_DATA[key]);
    });
  }

  // ── BUILDING TILE TEXTURES ────────────────────────────────────────────────
  _generateTileTextures() {
    this._makeTexture('tile-wall', 16, 16, g => {
      g.fillStyle(0x111111, 1); g.fillRect(0, 0, 16, 16);
    });

    // Building theme variants
    const B = [
      // 0: Gym IA — cobalt blue roof, white wall
      { rD:0x1A3060, rM:0x3050A0, rL:0x6080D0, wB:0xEEF0F8, wD:0x9098C0, wW:0x5880CC },
      // 1: Gym AC — brick red roof, warm white wall
      { rD:0x881000, rM:0xC01818, rL:0xE83030, wB:0xF8F0E0, wD:0xB09060, wW:0xC04040 },
      // 2: Gym DC — forest green roof, pale wall
      { rD:0x103020, rM:0x1E5030, rL:0x308050, wB:0xECF8EC, wD:0x80A880, wW:0x2A7040 },
      // 3: Lab — indigo roof, cool white wall
      { rD:0x282840, rM:0x404068, rL:0x6060A0, wB:0xF0F0F4, wD:0x9898B0, wW:0x5050A0 },
    ];

    B.forEach((c, i) => {
      // Roof: horizontal shingle stripes
      this._makeTexture(`tile-broof-${i}`, 16, 16, g => {
        g.fillStyle(c.rM, 1); g.fillRect(0, 0, 16, 16);
        [0,3,6,9,12].forEach(y => { g.fillStyle(c.rD, 1); g.fillRect(0, y, 16, 1); });
        [1,4,7,10,13].forEach(y => { g.fillStyle(c.rL, 1); g.fillRect(0, y, 16, 1); });
        g.fillStyle(c.rD, 1);
        g.fillRect(4, 1, 1, 2); g.fillRect(12, 1, 1, 2);
        g.fillRect(8, 4, 1, 2); g.fillRect(0, 4, 1, 2);
        g.fillRect(4, 7, 1, 2); g.fillRect(12, 7, 1, 2);
        g.fillRect(8, 10, 1, 2); g.fillRect(0, 10, 1, 2);
        g.fillRect(4, 13, 1, 2); g.fillRect(12, 13, 1, 2);
        g.fillStyle(0x111111, 1); g.fillRect(0, 0, 16, 1);
      });

      // Wall: flat base with GBA-style window
      this._makeTexture(`tile-bwall-${i}`, 16, 16, g => {
        g.fillStyle(c.wB, 1); g.fillRect(0, 0, 16, 16);
        g.fillStyle(0x111111, 1); g.fillRect(0, 0, 16, 1);
        g.fillStyle(c.wD, 1); g.fillRect(0, 8, 16, 1);
        g.fillStyle(c.wW, 1);     g.fillRect(4, 2, 4, 4);
        g.fillStyle(0x111111, 1); g.fillRect(4, 2, 4, 1); g.fillRect(4, 2, 1, 4);
        g.fillStyle(c.wD, 1);     g.fillRect(7, 2, 1, 4); g.fillRect(4, 5, 4, 1);
        g.fillStyle(0xFFFFFF, 1); g.fillRect(5, 3, 1, 1);
      });

      // Door: wall with centered wooden door
      this._makeTexture(`tile-bdoor-${i}`, 16, 16, g => {
        g.fillStyle(c.wB, 1); g.fillRect(0, 0, 16, 16);
        g.fillStyle(0x111111, 1); g.fillRect(0, 0, 16, 1);
        g.fillStyle(0x201008, 1); g.fillRect(3, 1, 10, 15);
        g.fillStyle(0x8B5820, 1); g.fillRect(4, 2, 8, 14);
        g.fillStyle(0xAA7838, 1); g.fillRect(4, 2, 8, 1); g.fillRect(4, 2, 1, 12);
        g.fillStyle(0x6B4010, 1); g.fillRect(5, 4, 6, 3); g.fillRect(5, 9, 6, 4);
        g.fillStyle(0xD4A840, 1); g.fillRect(10, 9, 2, 2);
        g.fillStyle(0xF0C858, 1); g.fillRect(10, 9, 1, 1);
        g.fillStyle(c.wD, 1); g.fillRect(2, 14, 12, 2);
      });
    });

    this._makeTexture('tile-floor', 16, 16, g => {
      g.fillStyle(0xCCC8B0, 1); g.fillRect(0, 0, 16, 16);
      g.fillStyle(0xB8B498, 1); g.fillRect(0, 8, 16, 1); g.fillRect(8, 0, 1, 8); g.fillRect(0, 0, 1, 8);
      g.fillStyle(0xE0DCC8, 1); g.fillRect(1, 1, 7, 7); g.fillRect(9, 9, 7, 7);
      g.fillStyle(0xD0CCB4, 1); g.fillRect(9, 1, 7, 7); g.fillRect(1, 9, 7, 7);
    });
  }

  // ── UI TEXTURES ───────────────────────────────────────────────────────────
  _generateUITextures() {
    const heart = [
      [0,1,1,0,0,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0]
    ];
    this._makeTexture('heart-full', 16, 16, g => {
      g.fillStyle(0xE03030, 1);
      heart.forEach((row,r) => row.forEach((v,c) => { if(v) g.fillRect(c*2,r*2,2,2); }));
    });
    this._makeTexture('heart-empty', 16, 16, g => {
      const empty = [
        [0,1,1,0,0,1,1,0],[1,0,0,1,1,0,0,1],[1,0,0,0,0,0,0,1],
        [0,1,0,0,0,0,1,0],[0,0,1,0,0,1,0,0],[0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]
      ];
      g.fillStyle(0x808080, 1);
      empty.forEach((row,r) => row.forEach((v,c) => { if(v) g.fillRect(c*2,r*2,2,2); }));
    });

    this._makeTexture('cursor', 16, 16, g => {
      g.fillStyle(0xFFFFFF, 1);
      [[1,0,0,0],[1,1,0,0],[1,1,1,0],[1,1,1,1],[1,1,1,0],[1,1,0,0],[1,0,0,0],[0,0,0,0]]
      .forEach((row,r) => row.forEach((v,c) => { if(v) g.fillRect(c*2,r*2,2,2); }));
    });
  }
}
