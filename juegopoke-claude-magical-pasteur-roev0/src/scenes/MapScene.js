// Village map — arrow keys to move, Z/Enter to interact
class MapScene extends Phaser.Scene {
  constructor() { super({ key: 'MapScene' }); }

  _h(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  _tl(x, y, css, html = '') {
    const e = TextLayer.add(x, y, css, html);
    this._tlEls.push(e);
    return e;
  }

  init(data) {
    this.returningFromBattle = data && data.returning;
    this.returnGymId = data ? data.gymId : -1;
    this.returnWon   = data ? data.won   : false;
  }

  create() {
    this.TILE = 16;
    this.W = 320; this.H = 240;
    this._tlEls = [];

    this._buildMap();
    this._createPlayer();
    this._createNPCs();
    this._buildDialogSystem();
    this._createHUD();
    this._setupInput();

    // Camera follows player, bounded to world
    this.cameras.main.setBounds(0, 0, this.MAP_W * this.TILE, this.MAP_H * this.TILE);
    this.cameras.main.startFollow(this.player, true, 1, 1);

    if (this.returningFromBattle && this.returnWon) {
      const gym = GAME_CONTENT.gyms[this.returnGymId];
      this.time.delayedCall(200, () =>
        this._openDialog(`${gym.win}${gym.badgeName}!`, 'Sistema')
      );
    }
    if (this.returningFromBattle && !this.returnWon) {
      const gym = GAME_CONTENT.gyms[this.returnGymId];
      this.time.delayedCall(200, () =>
        this._openDialog(gym.lose, GAME_CONTENT.gyms[this.returnGymId].leader)
      );
    }

    if (GameState.allGymsComplete) {
      this.time.delayedCall(400, () => this.scene.start('VictoryScene'));
    }
  }

  // ── MAP DEFINITION (40×30 tiles at 16px = 640×480 world) ──────────────────
  // Tile types:  0=grass  1=path  2=tree  3=bwall  4=broof  5=door  9=solid
  _buildMap() {
    this.MAP_W = 40; this.MAP_H = 30;

    // Buildings:
    //   Lab (bIdx 3):    cols 0-3,  rows 0-2   — door col 1, row 2
    //   Gym1/IA (bIdx 0): cols 27-31, rows 0-2  — door col 28, row 2
    //   Gym2/AC (bIdx 1): cols 0-3,  rows 25-27 — door col 1, row 27
    //   Gym3/DC (bIdx 2): cols 27-31, rows 25-27 — door col 28, row 27
    //   Top path: rows 3-4   Bottom path: rows 28-29 (approach bottom gyms from below)

    this.mapData = [
      // row 0 — Lab roof, trees, Gym1 roof
      [4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,2,2,2,2,2,2,2,2],
      // row 1
      [3,3,3,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,2,0,0,0,0,0,0,0],
      // row 2 — Lab door col 1, Gym1 door col 28
      [3,5,3,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,3,3,3,2,0,0,0,0,0,0,0],
      // row 3 — main top path
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // row 4
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // row 5
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 6 — tree clusters
      [2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0],
      // row 7
      [2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0],
      // row 8
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 9
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 10
      [0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,2,2,0,0],
      // row 11
      [0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,2,2,0,0],
      // row 12
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 13
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 14 — tree clusters
      [2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,2,2,0],
      // row 15
      [2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,2,2,0],
      // row 16
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 17
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 18
      [0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,2,2,0,0],
      // row 19
      [0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,0,2,2,0,0,2,2,0,0],
      // row 20
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 21
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 22 — tree clusters above bottom buildings
      [2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,2,2,0],
      // row 23
      [2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,0,2,2,0,0,0,0,2,2,0,0,2,2,0],
      // row 24
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      // row 25 — Gym2 roof, trees, Gym3 roof
      [4,4,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4,4,2,2,2,2,2,2,2,2],
      // row 26
      [3,3,3,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,2,0,0,0,0,0,0,0],
      // row 27 — Gym2 door col 1, Gym3 door col 28
      [3,5,3,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,3,3,3,2,0,0,0,0,0,0,0],
      // row 28 — main bottom path (approach bottom gyms from here)
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      // row 29
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    this.doorMap = {
      '1,2':   -1,  // Lab
      '28,2':   0,  // Gym IA
      '1,27':   1,  // Gym AC
      '28,27':  2,  // Gym DC
    };

    this.buildingIdx = (col, row) => {
      if (col >= 27 && col <= 31) return (row <= 4) ? 0 : 2;  // Gym IA / Gym DC
      if (col <= 3 && row <= 4) return 3;                      // Lab
      return 1;                                                 // Gym AC
    };

    const rt = this.add.renderTexture(0, 0, this.MAP_W * this.TILE, this.MAP_H * this.TILE);
    rt.setOrigin(0, 0);

    for (let row = 0; row < this.MAP_H; row++) {
      for (let col = 0; col < this.MAP_W; col++) {
        const t = this.mapData[row][col];
        const x = col * this.TILE, y = row * this.TILE;
        const bIdx = this.buildingIdx(col, row);

        // Terrain tiles: generated textures (CanvasSource, works with rt.drawFrame)
        if (t === 0) {
          rt.drawFrame('tile-grass', undefined, x, y);
        } else if (t === 1) {
          rt.drawFrame('tile-path', undefined, x, y);
        } else if (t === 2) {
          rt.drawFrame('tile-grass', undefined, x, y);  // grass base
          rt.drawFrame('tile-tree',  undefined, x, y);  // tree overlay
        } else if (t === 3) {
          rt.drawFrame(`tile-bwall-${bIdx}`, undefined, x, y);
        } else if (t === 4) {
          rt.drawFrame(`tile-broof-${bIdx}`, undefined, x, y);
        } else if (t === 5) {
          rt.drawFrame(`tile-bdoor-${bIdx}`, undefined, x, y);
        }
      }
    }

    this._badgeGraphics = this.add.graphics();
    this._refreshBadges();
  }

  _refreshBadges() {
    const g = this._badgeGraphics;
    g.clear();
    // Badge star near each gym entrance
    const positions = [[28,0],[1,25],[28,25]];
    GAME_CONTENT.gyms.forEach((gym, i) => {
      if (!GameState.gymCompleted[i] || !positions[i]) return;
      const [col, row] = positions[i];
      const x = col * this.TILE + this.TILE, y = row * this.TILE + this.TILE;
      g.fillStyle(0xFFD700, 1); g.fillCircle(x, y, 10);
      g.fillStyle(0xFFFFFF, 1); g.fillRect(x-2, y-6, 4, 12); g.fillRect(x-6, y-2, 12, 4);
    });
  }

  // ── PLAYER ────────────────────────────────────────────────────────────────
  _createPlayer() {
    this.playerTile = { x: 8, y: 4 };
    const px = this.playerTile.x * this.TILE + this.TILE / 2;
    // 16×24 sprite: origin at (0.5, 1) so feet anchor at bottom of tile
    const py = (this.playerTile.y + 1) * this.TILE;

    // Player: named directional textures (player-down, player-left, player-right, player-up)
    this.player = this.add.image(px, py, 'player-down').setOrigin(0.5, 1).setDepth(10);

    this.isMoving = false;
    this.stepFrame = 0;
    this.facing = 'down';
  }

  // ── NPCs ──────────────────────────────────────────────────────────────────
  _createNPCs() {
    const npcDefs = [
      { col: 10, row: 9,  spriteKey: 'char-npc0', dialogIdx: 0 },
      { col: 20, row: 16, spriteKey: 'char-npc1', dialogIdx: 1 },
      { col: 10, row: 22, spriteKey: 'char-npc2', dialogIdx: 2 },
    ];

    this.npcs = npcDefs.map(def => {
      const x = def.col * this.TILE + this.TILE / 2;
      // feet at bottom of tile, head sticks 8px into tile above
      const y = (def.row + 1) * this.TILE;
      // named texture per NPC (single standing-down frame, generated in BootScene)
      const img = this.add.image(x, y, def.spriteKey).setOrigin(0.5, 1).setDepth(10);
      return { col: def.col, row: def.row, img, dialogIdx: def.dialogIdx };
    });
  }

  // ── HUD (fixed to camera viewport) ────────────────────────────────────────
  _createHUD() {
    this.hudGraphics = this.add.graphics().setDepth(20).setScrollFactor(0);
    this._refreshHUD();
  }

  _refreshHUD() {
    const g = this.hudGraphics;
    g.clear();
    g.fillStyle(0x000000, 0.6);
    g.fillRect(2, 2, 84, 14);

    GAME_CONTENT.gyms.forEach((gym, i) => {
      const x = 8 + i * 26, y = 9;
      if (GameState.gymCompleted[i]) {
        g.fillStyle(0xFFD700, 1); g.fillCircle(x, y, 4);
      } else {
        g.lineStyle(1, 0x888888, 1); g.strokeCircle(x, y, 4);
      }
    });

    if (GameState.principle >= 0) {
      const name = GAME_CONTENT.principles[GameState.principle].creature;
      if (!this.hudPrincipleTxt) {
        this.hudPrincipleTxt = this._tl(2, 18,
          'font:7px/1 "Courier New",Courier,monospace;color:#fff;background:#000;padding:1px 2px;pointer-events:none;'
        );
      }
      this.hudPrincipleTxt.textContent = name;
    }
  }

  // ── DIALOG SYSTEM (fixed to camera viewport) ───────────────────────────────
  _buildDialogSystem() {
    const { W, H } = this;
    const BOX_H = 76, BOX_Y = H - BOX_H;

    this.dialogBg = this.add.graphics().setDepth(30).setScrollFactor(0);
    this.dialogBg.setVisible(false);

    const box = this.dialogBg;
    box.fillStyle(0x383828, 1); box.fillRect(0, BOX_Y, W, BOX_H);
    box.fillStyle(0xF0F0D8, 1); box.fillRect(4, BOX_Y + 4, W - 8, BOX_H - 8);
    box.fillStyle(0xFFFFFF, 1); box.fillRect(4, BOX_Y + 4, W - 8, 2);
    box.fillStyle(0x383828, 1); box.fillRect(6, BOX_Y + 6, W - 8, 2);
    [[4,BOX_Y+4],[W-10,BOX_Y+4],[4,H-10],[W-10,H-10]].forEach(([x,y]) => {
      box.fillStyle(0x383828,1); box.fillRect(x,y,6,6);
    });

    this.dialogName = this._tl(8, BOX_Y - 2,
      'font:bold 8px/1 "Courier New",Courier,monospace;color:#fff;background:#383828;padding:2px 6px;white-space:nowrap;pointer-events:none;display:none;transform:translateY(-100%);'
    );

    this.dialogBody = this._tl(8, BOX_Y + 8,
      'font:9px/1.5 "Courier New",Courier,monospace;color:#383828;width:304px;word-break:break-word;pointer-events:none;display:none;'
    );

    this.dialogCursor = this.add.graphics().setDepth(32).setVisible(false).setScrollFactor(0);
    this.dialogCursor.fillStyle(0x383828,1);
    this.dialogCursor.fillRect(W-10, H-10, 1, 5);
    this.dialogCursor.fillRect(W-9,  H-9,  1, 3);
    this.dialogCursor.fillRect(W-8,  H-8,  1, 1);
    this.tweens.add({ targets: this.dialogCursor, alpha:{from:1,to:0}, duration:400, yoyo:true, repeat:-1 });

    this.dialogOpen = false;
    this.dialogQueue = [];
    this.isTyping = false;
    this.fullText = '';
    this.charIdx = 0;
    this.typeTimer = null;
  }

  _openDialog(text, speaker = '') {
    this.dialogOpen = true;
    this.isMoving = false;
    this.dialogBg.setVisible(true);
    this.dialogName.style.display = 'inline-block';
    this.dialogName.innerHTML = this._h(speaker);
    this.dialogBody.style.display = '';
    this.dialogCursor.setVisible(false);
    this.fullText = text;
    this.charIdx = 0;
    this.isTyping = true;
    this.dialogBody.innerHTML = '';
    this._typeChar();
  }

  _typeChar() {
    if (this.charIdx >= this.fullText.length) {
      this.isTyping = false;
      this.dialogCursor.setVisible(true);
      return;
    }
    this.charIdx++;
    this.dialogBody.innerHTML = this._h(this.fullText.slice(0, this.charIdx));
    this.typeTimer = this.time.delayedCall(25, () => this._typeChar());
  }

  _closeDialog() {
    this.dialogOpen = false;
    this.dialogBg.setVisible(false);
    this.dialogName.style.display = 'none';
    this.dialogBody.style.display = 'none';
    this.dialogCursor.setVisible(false);
    this.isTyping = false;
    if (this.typeTimer) this.typeTimer.remove();
  }

  _onInteractKey() {
    if (this.dialogOpen) {
      if (this.isTyping) {
        if (this.typeTimer) this.typeTimer.remove();
        this.charIdx = this.fullText.length;
        this.dialogBody.innerHTML = this._h(this.fullText);
        this.isTyping = false;
        this.dialogCursor.setVisible(true);
      } else {
        this._closeDialog();
      }
      return;
    }
    this._checkInteraction();
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────
  _setupInput() {
    this._dir = { up: false, down: false, left: false, right: false };
    const dirMap = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right'
    };
    this._onKeyDown = (e) => {
      if (dirMap[e.key] !== undefined) { this._dir[dirMap[e.key]] = true; e.preventDefault(); }
      if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') this._onInteractKey();
      if (e.key === 'x' || e.key === 'X') { if (this.dialogOpen) this._closeDialog(); }
    };
    this._onKeyUp = (e) => {
      if (dirMap[e.key] !== undefined) this._dir[dirMap[e.key]] = false;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);

    this.events.once('shutdown', () => {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup',   this._onKeyUp);
      this._tlEls.forEach(e => TextLayer.remove(e));
      this._tlEls = [];
    });
  }

  // ── MOVEMENT ──────────────────────────────────────────────────────────────
  update() {
    if (this.dialogOpen || this.isMoving) return;

    let dx = 0, dy = 0;
    if      (this._dir.left)  { dx = -1; this.facing = 'left'; }
    else if (this._dir.right) { dx =  1; this.facing = 'right'; }
    else if (this._dir.up)    { dy = -1; this.facing = 'up'; }
    else if (this._dir.down)  { dy =  1; this.facing = 'down'; }

    if (dx === 0 && dy === 0) return;

    // Switch directional texture on direction change
    this.player.setTexture('player-' + this.facing);

    const nx = this.playerTile.x + dx;
    const ny = this.playerTile.y + dy;

    if (this._isSolid(nx, ny)) return;

    const doorKey = `${nx},${ny}`;
    if (this.doorMap[doorKey] !== undefined) {
      const gymId = this.doorMap[doorKey];
      if (gymId >= 0) { this._enterGym(gymId); return; }
    }

    this.playerTile.x = nx;
    this.playerTile.y = ny;

    this.isMoving = true;
    this.tweens.add({
      targets: this.player,
      x: nx * this.TILE + this.TILE / 2,
      y: (ny + 1) * this.TILE,     // feet at tile bottom (origin 0.5, 1)
      duration: 100,
      ease: 'Linear',
      onComplete: () => { this.isMoving = false; }
    });
  }

  _isSolid(col, row) {
    if (col < 0 || row < 0 || col >= this.MAP_W || row >= this.MAP_H) return true;
    const t = this.mapData[row][col];
    return (t === 2 || t === 3 || t === 4 || t === 9);
  }

  // ── INTERACTION ───────────────────────────────────────────────────────────
  _checkInteraction() {
    const dirs = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };
    const [dx, dy] = dirs[this.facing] || [0, 1];
    const tx = this.playerTile.x + dx;
    const ty = this.playerTile.y + dy;

    const npc = this.npcs.find(n => n.col === tx && n.row === ty);
    if (npc) {
      this._openDialog(GAME_CONTENT.npcs[npc.dialogIdx], 'Ciudadano');
      return;
    }

    const doorKey = `${tx},${ty}`;
    if (this.doorMap[doorKey] !== undefined) {
      const gymId = this.doorMap[doorKey];
      if (gymId >= 0) this._enterGym(gymId);
    }
  }

  // ── GYM ENTRY ─────────────────────────────────────────────────────────────
  _enterGym(gymId) {
    const gym = GAME_CONTENT.gyms[gymId];
    if (GameState.gymCompleted[gymId]) {
      this._openDialog(`Has ganado la ${gym.badgeName}.\n¡Este gimnasio ya está completado!`, gym.leader);
      return;
    }

    this.cameras.main.flash(300, 255, 255, 255);
    this.time.delayedCall(350, () => {
      GameState.resetForBattle();
      this.scene.start('BattleScene', { gymId });
    });
  }
}
