// Victory/End scene — shows final score and triggers SCORM finish
class VictoryScene extends Phaser.Scene {
  constructor() { super({ key: 'VictoryScene' }); }

  _h(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  _tl(x, y, css, html = '') {
    const e = TextLayer.add(x, y, css, html);
    this._tlEls.push(e);
    return e;
  }

  create() {
    this.W = 320; this.H = 240;
    this._tlEls = [];
    this.events.once('shutdown', () => { this._tlEls.forEach(e => TextLayer.remove(e)); this._tlEls = []; });

    this.dialogIdx = 0;
    this.isTyping = false;
    this.fullText = '';
    this.charIdx = 0;
    this.typeTimer = null;

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this._buildScene();
    this._buildDialogBox();
    this._setupInput();

    const score = GameState.score;
    SCORMManager.finish(score);
    console.log(`[Game] Completed. Score: ${score}/100`);

    this.time.delayedCall(700, () => {
      this._showDialog(GAME_CONTENT.victory.dialogs[0], GAME_CONTENT.intro.professorName);
    });
  }

  _buildScene() {
    const { W, H } = this;

    const bg = this.add.graphics();
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.round(10 + t * 20), g2 = Math.round(10 + t * 30), b = Math.round(50 + t * 80);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g2, b), 1);
      bg.fillRect(0, y, W, 1);
    }

    bg.fillStyle(0xFFFFFF, 1);
    [[30,15],[80,8],[150,22],[220,10],[280,18],[60,40],[190,35],[300,28]].forEach(([x,y]) => bg.fillRect(x,y,2,2));
    bg.fillStyle(0xFFD700, 0.8);
    [[110,12],[250,30]].forEach(([x,y]) => bg.fillRect(x,y,3,3));

    const trophy = this.add.graphics().setDepth(5);
    const cx = W / 2, cy = 65;
    trophy.fillStyle(0xFFD700, 1);
    for (let a = 0; a < 5; a++) {
      const angle = (a / 5) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * 22, y = cy + Math.sin(angle) * 22;
      const x2 = cx + Math.cos(angle + Math.PI/5) * 10, y2 = cy + Math.sin(angle + Math.PI/5) * 10;
      trophy.fillTriangle(cx, cy, x, y, x2, y2);
    }
    trophy.fillStyle(0xFFE860, 1); trophy.fillCircle(cx, cy, 8);

    const score = GameState.score;
    const principle = GAME_CONTENT.principles[GameState.principle] || GAME_CONTENT.principles[0];

    const boxG = this.add.graphics().setDepth(5);
    boxG.fillStyle(0x000020, 0.8); boxG.fillRect(W/2 - 90, 90, 180, 40);
    boxG.lineStyle(1, 0xFFD700, 1); boxG.strokeRect(W/2 - 90, 90, 180, 40);

    this._tl(0, 101,
      `font:9px/1 "Courier New",Courier,monospace;color:${score>=80?'#44FF44':'#FF8844'};text-align:center;width:320px;pointer-events:none;transform:translateY(-50%);`,
      `PUNTUACIÓN FINAL: ${score}/100`
    );

    this._tl(0, 117,
      `font:7px/1 "Courier New",Courier,monospace;color:${score>=80?'#44FF44':'#FF6644'};text-align:center;width:320px;pointer-events:none;transform:translateY(-50%);`,
      score >= 80 ? '&#10003; CERTIFICACIÓN SUPERADA' : '&#10007; No alcanzado (80 mín.)'
    );

    const badgesG = this.add.graphics().setDepth(5);
    GAME_CONTENT.gyms.forEach((gym, i) => {
      const bx = W/2 - 30 + i * 30, by = 136;
      if (GameState.gymCompleted[i]) {
        badgesG.fillStyle(0xFFD700, 1); badgesG.fillCircle(bx, by, 8);
        badgesG.fillStyle(0x000000, 1); badgesG.fillCircle(bx, by, 4);
        badgesG.fillStyle(0xFFD700, 1); badgesG.fillRect(bx-1, by-6, 2, 12); badgesG.fillRect(bx-6, by-1, 12, 2);
      } else {
        badgesG.lineStyle(1, 0x666666, 1); badgesG.strokeCircle(bx, by, 8);
      }
    });

    this._tl(0, 150,
      'font:7px/1 "Courier New",Courier,monospace;color:#AAAAFF;text-align:center;width:320px;pointer-events:none;transform:translateY(-50%);',
      principle.creature + ' · ' + principle.name
    );

    this.oakSprite = this.add.image(W/2, 185, 'char-oak').setScale(2).setOrigin(0.5, 1).setDepth(5);

    if (!SCORMManager.isAvailable) {
      this._tl(0, 168,
        'font:7px/1 "Courier New",Courier,monospace;color:#FF8844;text-align:center;width:320px;pointer-events:none;transform:translateY(-50%);',
        '(Modo standalone)'
      );
    }
  }

  _buildDialogBox() {
    const { W, H } = this;
    const BY = H - 64, BH = 64;
    const bg = this.add.graphics().setDepth(20);
    bg.fillStyle(0x383828, 1); bg.fillRect(0, BY, W, BH);
    bg.fillStyle(0xF0F0D8, 1); bg.fillRect(4, BY+4, W-8, BH-8);
    bg.fillStyle(0xFFFFFF, 1); bg.fillRect(4, BY+4, W-8, 2); bg.fillRect(4, BY+4, 2, BH-8);
    bg.fillStyle(0x383828, 1); bg.fillRect(6, BY+6, W-8, 2); bg.fillRect(6, BY+6, 2, BH-8);
    [[4,BY+4],[W-10,BY+4],[4,H-10],[W-10,H-10]].forEach(([x,y]) => { bg.fillStyle(0x383828,1); bg.fillRect(x,y,6,6); });

    this.nameTag = this._tl(8, BY - 2,
      'font:bold 7px/1 "Courier New",Courier,monospace;color:#fff;background:#383828;padding:2px 6px;white-space:nowrap;pointer-events:none;display:inline-block;transform:translateY(-100%);'
    );

    this.dialogText = this._tl(8, BY + 8,
      'font:8px/1.5 "Courier New",Courier,monospace;color:#383828;width:304px;word-break:break-word;pointer-events:none;'
    );

    this.cursor = this.add.graphics().setDepth(22).setVisible(false);
    this.cursor.fillStyle(0x383828, 1);
    this.cursor.fillRect(W-10, H-10, 1, 5); this.cursor.fillRect(W-9, H-9, 1, 3); this.cursor.fillRect(W-8, H-8, 1, 1);
    this.tweens.add({ targets: this.cursor, alpha: { from:1, to:0 }, duration: 400, yoyo: true, repeat: -1 });
  }

  _showDialog(text, speaker = '') {
    this.nameTag.innerHTML = this._h(speaker);
    this.fullText = text; this.charIdx = 0; this.isTyping = true;
    this.cursor.setVisible(false);
    this.dialogText.innerHTML = '';
    this._typeChar();
  }

  _typeChar() {
    if (this.charIdx >= this.fullText.length) { this.isTyping = false; this.cursor.setVisible(true); return; }
    this.charIdx++;
    this.dialogText.innerHTML = this._h(this.fullText.slice(0, this.charIdx));
    this.typeTimer = this.time.delayedCall(28, () => this._typeChar());
  }

  _setupInput() {
    const keys = this.input.keyboard.addKeys({
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });
    const advance = () => {
      if (this.isTyping) {
        if (this.typeTimer) this.typeTimer.remove();
        this.charIdx = this.fullText.length;
        this.dialogText.innerHTML = this._h(this.fullText);
        this.isTyping = false; this.cursor.setVisible(true); return;
      }
      this.dialogIdx++;
      if (this.dialogIdx < GAME_CONTENT.victory.dialogs.length) {
        this._showDialog(GAME_CONTENT.victory.dialogs[this.dialogIdx], GAME_CONTENT.intro.professorName);
      } else {
        this._tl(0, this.H/2 - 10,
          'font:bold 10px/1 "Courier New",Courier,monospace;color:#FFD700;text-shadow:2px 2px 0 #000,-2px 2px 0 #000,2px -2px 0 #000,-2px -2px 0 #000;text-align:center;width:320px;pointer-events:none;transform:translateY(-50%);',
          '&#161;FORMACIÓN COMPLETADA!'
        );
        this._tl(0, this.H/2 + 8,
          'font:7px/1 "Courier New",Courier,monospace;color:#AAAAAA;text-align:center;width:320px;pointer-events:none;transform:translateY(-50%);',
          'Puedes cerrar esta ventana.'
        );
      }
    };
    keys.enter.on('down', advance);
    keys.z.on('down', advance);
    keys.space.on('down', advance);
  }
}
