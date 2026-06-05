// Professor Oak intro + principle selection
class IntroScene extends Phaser.Scene {
  constructor() { super({ key: 'IntroScene' }); }

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
    this.phase = 'dialog';
    this.choiceIdx = 0;
    this.afterIdx = 0;
    this.textTimer = null;
    this.fullText = '';
    this.displayedChars = 0;
    this.isTyping = false;
    this.orbDomLabels = [];

    this._buildScene();
    this._setupInput();
    this._showDialog(GAME_CONTENT.intro.dialogs[0]);
  }

  _buildScene() {
    const { W, H } = this;

    const bg = this.add.graphics();
    bg.fillStyle(0x8890A8, 1); bg.fillRect(0, 0, W, Math.round(H * 0.55));
    bg.fillStyle(0x3A4260, 1); bg.fillRect(0, 0, W, 3);
    bg.fillStyle(0x505868, 1); bg.fillRect(0, Math.round(H * 0.55) - 4, W, 4);
    for (let y = Math.round(H * 0.55); y < H - 48; y++) {
      const t = (y - H * 0.55) / (H * 0.45);
      const lum = Math.round(192 - t * 30);
      bg.fillStyle(Phaser.Display.Color.GetColor(lum, lum, Math.round(lum * 0.97)), 1);
      bg.fillRect(0, y, W, 1);
    }
    bg.lineStyle(1, 0x909090, 1);
    for (let y = Math.round(H * 0.55); y < H - 48; y += 16) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 16) bg.lineBetween(x, Math.round(H * 0.55), x, H - 48);

    bg.fillStyle(0xC8903A, 1); bg.fillRect(80, 100, 160, 8);
    bg.fillStyle(0xE0A840, 1); bg.fillRect(80, 100, 160, 1);
    bg.fillStyle(0x8B5E2A, 1); bg.fillRect(80, 108, 160, 12);
    bg.fillStyle(0x6B4018, 1); bg.fillRect(238, 100, 1, 20);

    // char-oak: generated texture (standing facing down), 16×20px @ 2× scale
    this.oakSprite = this.add.image(160, 88, 'char-oak').setScale(2).setOrigin(0.5, 1);

    this.orbContainer = this.add.container(0, 0);
    this._buildOrbs(false);
    this._buildDialogBox();
  }

  _buildOrbs(interactive) {
    if (this.orbDomLabels) this.orbDomLabels.forEach(l => {
      TextLayer.remove(l);
      const idx = this._tlEls.indexOf(l);
      if (idx >= 0) this._tlEls.splice(idx, 1);
    });
    this.orbDomLabels = [];

    this.orbContainer.removeAll(true);
    const principles = GAME_CONTENT.principles;

    principles.forEach((p, i) => {
      const x = 100 + i * 62, y = 96;
      const orb = this.add.graphics();
      const colors = [0x87CEEB, 0xFFD700, 0xC8903A];
      const rims   = [0x1B4F8E, 0x1E3A8A, 0x2A6622];

      orb.fillStyle(0x222222, 1); orb.fillCircle(x, y, 8);
      orb.fillStyle(rims[i], 1);  orb.fillCircle(x, y, 7);
      orb.fillStyle(colors[i], 1); orb.fillCircle(x, y, 6);
      orb.fillStyle(0xFFFFFF, 1); orb.fillRect(x - 2, y - 4, 3, 2);

      this.orbContainer.add(orb);

      if (interactive) {
        if (i === this.choiceIdx) {
          const sel = this.add.graphics();
          sel.lineStyle(2, 0xFFD700, 1); sel.strokeCircle(x, y, 10);
          sel.lineStyle(1, 0xFFFFFF, 0.5); sel.strokeCircle(x, y, 12);
          this.orbContainer.add(sel);
        }
        const lbl = this._tl(x - 20, y + 16,
          `font:7px/1 "Courier New",Courier,monospace;color:${i===this.choiceIdx?'#FFD700':'#AAAAAA'};text-align:center;width:40px;pointer-events:none;`,
          p.creature
        );
        this.orbDomLabels.push(lbl);
      }
    });
  }

  _buildDialogBox() {
    const { W, H } = this;
    const BOX_H = 76, BOX_Y = H - BOX_H;

    const box = this.add.graphics();
    box.fillStyle(0x383828, 1); box.fillRect(0, BOX_Y, W, BOX_H);
    box.fillStyle(0xF0F0D8, 1); box.fillRect(4, BOX_Y + 4, W - 8, BOX_H - 8);
    box.fillStyle(0xFFFFFF, 1); box.fillRect(4, BOX_Y + 4, W - 8, 2); box.fillRect(4, BOX_Y + 4, 2, BOX_H - 8);
    box.fillStyle(0x383828, 1); box.fillRect(6, BOX_Y + 6, W - 8, 2); box.fillRect(6, BOX_Y + 6, 2, BOX_H - 8);
    [[4,BOX_Y+4],[W-10,BOX_Y+4],[4,H-10],[W-10,H-10]].forEach(([x,y]) => {
      box.fillStyle(0x383828,1); box.fillRect(x,y,6,6);
    });

    this.nameTag = this._tl(8, BOX_Y - 2,
      'font:bold 7px/1 "Courier New",Courier,monospace;color:#fff;background:#383828;padding:2px 6px;white-space:nowrap;pointer-events:none;display:inline-block;transform:translateY(-100%);'
    );

    this.dialogText = this._tl(8, BOX_Y + 8,
      'font:8px/1.5 "Courier New",Courier,monospace;color:#383828;width:304px;word-break:break-word;pointer-events:none;'
    );

    this.cursor = this.add.graphics();
    this.cursor.setVisible(false);
    this.tweens.add({ targets: this.cursor, alpha: { from: 1, to: 0 }, duration: 400, yoyo: true, repeat: -1 });
    this._drawCursor(W - 12, H - 10);
  }

  _drawCursor(x, y) {
    this.cursor.clear();
    this.cursor.fillStyle(0x383828, 1);
    this.cursor.fillRect(x, y, 1, 5);
    this.cursor.fillRect(x + 1, y + 1, 1, 3);
    this.cursor.fillRect(x + 2, y + 2, 1, 1);
  }

  _showDialog(text, speaker = GAME_CONTENT.intro.professorName) {
    this.nameTag.innerHTML = this._h(speaker);
    this.fullText = text;
    this.displayedChars = 0;
    this.isTyping = true;
    this.cursor.setVisible(false);
    this.dialogText.innerHTML = '';
    this._typeNextChar();
  }

  _typeNextChar() {
    if (this.displayedChars >= this.fullText.length) {
      this.isTyping = false; this.cursor.setVisible(true); return;
    }
    this.displayedChars++;
    this.dialogText.innerHTML = this._h(this.fullText.slice(0, this.displayedChars));
    this.textTimer = this.time.delayedCall(28, () => this._typeNextChar());
  }

  _advanceDialog() {
    if (this.isTyping) {
      if (this.textTimer) this.textTimer.remove();
      this.displayedChars = this.fullText.length;
      this.dialogText.innerHTML = this._h(this.fullText);
      this.isTyping = false; this.cursor.setVisible(true); return;
    }
    if (this.phase === 'dialog') {
      this.dialogIdx++;
      if (this.dialogIdx < GAME_CONTENT.intro.dialogs.length) {
        this._showDialog(GAME_CONTENT.intro.dialogs[this.dialogIdx]);
      } else {
        this.phase = 'choice'; this.choiceIdx = 0; this._showChoiceDialog();
      }
    } else if (this.phase === 'afterChoice') {
      this.afterIdx++;
      if (this.afterIdx < GAME_CONTENT.intro.afterChoice.length) {
        this._showDialog(GAME_CONTENT.intro.afterChoice[this.afterIdx]);
      } else {
        GameState.save(); this.scene.start('MapScene');
      }
    }
  }

  _showChoiceDialog() {
    this._buildOrbs(true);
    const p = GAME_CONTENT.principles[this.choiceIdx];
    this._showDialog(
      `${p.name}\n${p.skill}: ${p.desc}\n↑↓ Cambiar  Z/Enter: Elegir`,
      GAME_CONTENT.intro.choicePrompt
    );
  }

  _confirmChoice() {
    GameState.principle = this.choiceIdx;
    this.phase = 'afterChoice'; this.afterIdx = 0;
    this._buildOrbs(false);
    this._showDialog(GAME_CONTENT.intro.afterChoice[0]);
  }

  _setupInput() {
    const keys = this.input.keyboard.addKeys({
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT
    });
    keys.enter.on('down', () => this._onConfirm());
    keys.z.on('down',     () => this._onConfirm());
    keys.up.on('down',    () => this._onNav(-1));
    keys.left.on('down',  () => this._onNav(-1));
    keys.down.on('down',  () => this._onNav(1));
    keys.right.on('down', () => this._onNav(1));
  }

  _onConfirm() {
    if (this.phase === 'choice' && !this.isTyping) this._confirmChoice();
    else this._advanceDialog();
  }

  _onNav(dir) {
    if (this.phase !== 'choice') return;
    const count = GAME_CONTENT.principles.length;
    this.choiceIdx = (this.choiceIdx + dir + count) % count;
    this._showChoiceDialog();
  }
}
