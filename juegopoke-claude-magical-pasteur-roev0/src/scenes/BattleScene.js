// Turn-based battle scene
class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  _h(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }

  _tl(x, y, css, html = '') {
    const e = TextLayer.add(x, y, css, html);
    this._tlEls.push(e);
    return e;
  }

  init(data) {
    this.gymId = data.gymId || 0;
    this.gym = GAME_CONTENT.gyms[this.gymId];
    this.questionIdx = 0;
    this.enemyHP = 5;
    this.playerHP = GameState.playerHP;
    this.specialUsed = false;
    this.phase = 'intro';
    this.selectedOption = 0;
    this.eliminatedOption = -1;
    this._shieldActive = false;
  }

  create() {
    this.W = 320; this.H = 240;
    this._tlEls = [];
    this.events.once('shutdown', () => { this._tlEls.forEach(e => TextLayer.remove(e)); this._tlEls = []; });
    this._buildBattleLayout();
    this._buildDialogBox();
    this._setupInput();

    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.time.delayedCall(500, () => {
      this._showDialog(this.gym.intro, this.gym.leader);
      this.phase = 'intro';
    });
  }

  // ── LAYOUT ──────────────────────────────────────────────────────────────────
  _buildBattleLayout() {
    const { W, H } = this;
    const DIALOG_H = 112;
    const BATTLE_H = H - DIALOG_H; // 128px

    // Sky/ground gradient
    const bg = this.add.graphics();
    for (let y = 0; y < BATTLE_H; y++) {
      const t = y / BATTLE_H;
      const r = Math.round(208 - t * 40), gv = Math.round(232 - t * 30), b = Math.round(248 - t * 20);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, gv, b), 1);
      bg.fillRect(0, y, W, 1);
    }
    for (let y = BATTLE_H; y < BATTLE_H + 20; y++) {
      const t = (y - BATTLE_H) / 20;
      const gv = Math.round(186 - t * 40);
      bg.fillStyle(Phaser.Display.Color.GetColor(Math.round(gv*0.55), gv, Math.round(gv*0.4)), 1);
      bg.fillRect(0, y, W, 1);
    }

    // Enemy platform (top-right oval)
    const eg = this.add.graphics();
    for (let y = 0; y < 10; y++) {
      const hw = Math.round(Math.sqrt(1 - ((y-5)/5)**2) * 38);
      const c = y < 5 ? 0xA8B888 : 0x889868;
      eg.fillStyle(c, 1); eg.fillRect(220 - hw, 52 + y, hw * 2, 1);
      if (y === 0) { eg.fillStyle(0x111111, 1); eg.fillRect(220-hw, 52, hw*2, 1); }
    }

    // Player platform (bottom-left oval)
    const pg = this.add.graphics();
    for (let y = 0; y < 9; y++) {
      const hw = Math.round(Math.sqrt(1 - ((y-4.5)/4.5)**2) * 32);
      const c = y < 4 ? 0x88A870 : 0x689050;
      pg.fillStyle(c, 1); pg.fillRect(64 - hw, 96 + y, hw * 2, 1);
      if (y === 0) { pg.fillStyle(0x111111, 1); pg.fillRect(64-hw, 96, hw*2, 1); }
    }

    // Leader sprite (enemy, top-right) — feet at y=62, head at y=2
    this.leaderSprite = this.add.image(210, 62, `leader${this.gymId}`).setOrigin(0.5, 1).setDepth(5);

    // Principle back sprite (player, bottom-left)
    const backKey = ['cristal-back','valor-back','sabio-back'][GameState.principle] || 'sabio-back';
    this.principleSprite = this.add.image(48, 96, backKey).setOrigin(0.5, 1).setDepth(5);

    this._buildEnemyHPBar();
    this._buildPlayerHPBar();

    this.DIALOG_Y = BATTLE_H;
    this.DIALOG_H = DIALOG_H;
  }

  _buildEnemyHPBar() {
    this.enemyBarGraphics = this.add.graphics().setDepth(10);
    this._drawEnemyHPBar();
  }

  _drawEnemyHPBar() {
    const g = this.enemyBarGraphics;
    g.clear();
    g.fillStyle(0xF0F0D8, 1); g.fillRect(4, 4, 140, 26);
    g.lineStyle(1, 0x383828, 1); g.strokeRect(4, 4, 140, 26);
    for (let i = 0; i < 5; i++) {
      const full = i < this.enemyHP;
      g.fillStyle(0x383828, 1); g.fillRect(43+i*19, 14, 18, 10);
      const c = full ? (i < 3 ? 0x30A030 : 0xE8A000) : 0x505050;
      g.fillStyle(c, 1); g.fillRect(44+i*19, 15, 16, 8);
      if (full) { g.fillStyle(0x60E060, 1); g.fillRect(44+i*19, 15, 16, 2); }
    }
  }

  _buildPlayerHPBar() {
    this.playerBarGraphics = this.add.graphics().setDepth(10);
    this._drawPlayerHPBar();
  }

  _drawPlayerHPBar() {
    const g = this.playerBarGraphics;
    const { W } = this;
    g.clear();
    g.fillStyle(0xF0F0D8, 1); g.fillRect(W-118, 98, 116, 26);
    g.lineStyle(1, 0x383828, 1); g.strokeRect(W-118, 98, 116, 26);
    for (let i = 0; i < 3; i++) {
      const full = i < this.playerHP;
      const hx = W - 110 + i * 24, hy = 106;
      if (full) g.fillStyle(0xE03030, 1); else g.fillStyle(0x808080, 1);
      [[0,1,1,0,0,1,1,0],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],
       [0,1,1,1,1,1,1,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0]]
      .forEach((row,r) => row.forEach((v,c) => { if(v) g.fillRect(hx+c*2, hy+r*2, 2, 2); }));
    }
  }

  _createNameLabels() {
    const principle = GAME_CONTENT.principles[GameState.principle];
    this._tl(6, 4,
      'font:8px/1 "Courier New",Courier,monospace;color:#383828;pointer-events:none;',
      this.gym.leader
    );
    this._tl(this.W - 6, 98,
      'font:8px/1 "Courier New",Courier,monospace;color:#383828;pointer-events:none;transform:translateX(-100%);',
      principle.creature
    );
  }

  // ── DIALOG BOX ──────────────────────────────────────────────────────────────
  _buildDialogBox() {
    const { W, H } = this;
    const BY = this.DIALOG_Y || 144;
    const BH = this.DIALOG_H || 96;

    const bg = this.add.graphics().setDepth(20);
    bg.fillStyle(0x383828, 1); bg.fillRect(0, BY, W, BH);
    bg.fillStyle(0xF0F0D8, 1); bg.fillRect(4, BY+4, W-8, BH-8);
    bg.fillStyle(0xFFFFFF, 1); bg.fillRect(4, BY+4, W-8, 2); bg.fillRect(4, BY+4, 2, BH-8);
    bg.fillStyle(0x383828, 1); bg.fillRect(6, BY+6, W-8, 2); bg.fillRect(6, BY+6, 2, BH-8);

    this.dialogText = this._tl(8, BY + 8,
      'font:9px/1.5 "Courier New",Courier,monospace;color:#383828;width:304px;word-break:break-word;pointer-events:none;'
    );

    this.optionTexts = [];
    for (let i = 0; i < 3; i++) {
      const ot = this._tl(20, BY + 40 + i * 24,
        'font:9px/1.4 "Courier New",Courier,monospace;color:#383828;width:294px;word-break:break-word;pointer-events:none;display:none;'
      );
      this.optionTexts.push(ot);
    }

    this.optionCursor = this.add.graphics().setDepth(22).setVisible(false);

    this.specialBtn = this._tl(W - 6, BY + 4,
      'font:7px/1 "Courier New",Courier,monospace;color:#4444FF;background:#DDDDF8;padding:1px 3px;cursor:pointer;pointer-events:auto;display:none;transform:translateX(-100%);'
    );
    this.specialBtn.textContent = 'S:Esp.';
    this.specialBtn.addEventListener('click', () => this._useSpecial());

    this.dialogCursor = this.add.graphics().setDepth(22).setVisible(false);
    this.dialogCursor.fillStyle(0x383828, 1);
    this.dialogCursor.fillRect(W-10, H-10, 1, 5);
    this.dialogCursor.fillRect(W-9, H-9, 1, 3);
    this.dialogCursor.fillRect(W-8, H-8, 1, 1);
    this.tweens.add({ targets: this.dialogCursor, alpha: { from:1, to:0 }, duration: 400, yoyo: true, repeat: -1 });

    this.isTyping = false;
    this.fullText = '';
    this.charIdx = 0;
    this.typeTimer = null;

    this._createNameLabels();
  }

  _showDialog(text, speaker) {
    this.optionTexts.forEach(o => { o.style.display = 'none'; });
    this.optionCursor.setVisible(false);
    this.specialBtn.style.display = 'none';
    this.dialogCursor.setVisible(false);
    this.fullText = text; this.charIdx = 0; this.isTyping = true;
    this.dialogText.innerHTML = '';
    this._typeChar();
  }

  _typeChar() {
    if (this.charIdx >= this.fullText.length) {
      this.isTyping = false; this.dialogCursor.setVisible(true); return;
    }
    this.charIdx++;
    this.dialogText.innerHTML = this._h(this.fullText.slice(0, this.charIdx));
    this.typeTimer = this.time.delayedCall(22, () => this._typeChar());
  }

  _skipTyping() {
    if (!this.isTyping) return false;
    if (this.typeTimer) this.typeTimer.remove();
    this.charIdx = this.fullText.length;
    this.dialogText.innerHTML = this._h(this.fullText);
    this.isTyping = false; this.dialogCursor.setVisible(true);
    return true;
  }

  // ── QUESTION ────────────────────────────────────────────────────────────────
  _showQuestion() {
    const q = this.gym.questions[this.questionIdx];
    this.phase = 'answering';
    this.selectedOption = 0;

    this.dialogText.node.innerHTML = this._h(q.text);
    this.dialogCursor.setVisible(false);

    const labels = ['A', 'B', 'C'];
    q.options.forEach((opt, i) => {
      const ot = this.optionTexts[i];
      ot.innerHTML = this._h(`${labels[i]}) ${opt}`);
      ot.style.color = '#383828';
      ot.style.opacity = i === this.eliminatedOption ? '0.3' : '1';
      ot.style.display = '';
    });

    this.specialBtn.style.display = this.specialUsed ? 'none' : '';
    this._drawOptionCursor();
  }

  _drawOptionCursor() {
    const BY = this.DIALOG_Y || 144;
    const g = this.optionCursor;
    g.clear(); g.setVisible(true);
    const y = BY + 42 + this.selectedOption * 24;
    g.fillStyle(0x383828, 1);
    g.fillRect(8, y, 1, 6); g.fillRect(9, y+1, 1, 4); g.fillRect(10, y+2, 1, 2);
  }

  // ── ANSWER ──────────────────────────────────────────────────────────────────
  _afterAnswer() {
    this.time.delayedCall(800, () => {
      if (this.enemyHP <= 0) { this._winBattle(); return; }
      if (this.playerHP <= 0) { this._loseBattle(); return; }
      this.questionIdx++;
      if (this.questionIdx >= this.gym.questions.length) { this._winBattle(); return; }
      this.eliminatedOption = -1;
      this.phase = 'question';
      this._showQuestion();
    });
  }

  _winBattle() {
    this.phase = 'result';
    GameState.gymCompleted[this.gymId] = true;
    GameState.save();
    this._showDialog(`¡Victoria! ${this.gym.win}${this.gym.badgeName}!`);
    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(400, 255, 255, 255);
      this.time.delayedCall(450, () => {
        this.scene.start('MapScene', { returning: true, gymId: this.gymId, won: true });
      });
    });
  }

  _loseBattle() {
    this.phase = 'result';
    GameState.playerHP = 3;
    GameState.save();
    this._showDialog('¡Derrota! Habla con los ciudadanos\ny vuelve a intentarlo.');
    this.time.delayedCall(2500, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(450, () => {
        this.scene.start('MapScene', { returning: true, gymId: this.gymId, won: false });
      });
    });
  }

  // ── ANIMATIONS ──────────────────────────────────────────────────────────────
  _animateAttack(attacker, target, onComplete) {
    this.tweens.add({
      targets: attacker, x: attacker.x + 4,
      duration: 60, yoyo: true, repeat: 2,
      onComplete: () => {
        this.tweens.add({
          targets: target, alpha: { from: 1, to: 0.2 },
          duration: 80, yoyo: true, repeat: 3, onComplete
        });
      }
    });
  }

  // ── SPECIAL ABILITY ─────────────────────────────────────────────────────────
  _useSpecial() {
    if (this.phase !== 'answering' || this.specialUsed) return;
    this.specialUsed = true;
    this.specialBtn.style.display = 'none';

    const q = this.gym.questions[this.questionIdx];

    if (GameState.principle === 0) {
      let toElim = -1;
      for (let i = 0; i < 3; i++) {
        if (i !== q.correct && i !== this.eliminatedOption) { toElim = i; break; }
      }
      if (toElim >= 0) {
        this.eliminatedOption = toElim;
        this.optionTexts[toElim].style.opacity = '0.3';
        this._showDialog(`¡Auditoría Visual! La opción ${['A','B','C'][toElim]} queda eliminada.`);
        this.time.delayedCall(1200, () => this._showQuestion());
      }
    } else if (GameState.principle === 1) {
      this._shieldActive = true;
      this._showDialog('¡Escudo de Valores activado!\nEl próximo fallo no costará HP.');
      this.time.delayedCall(1200, () => this._showQuestion());
    } else if (GameState.principle === 2) {
      this._showDialog(`Pista: ${q.hint}`);
      this.time.delayedCall(2000, () => this._showQuestion());
    }
  }

  // ── INPUT ────────────────────────────────────────────────────────────────────
  _setupInput() {
    const keys = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      b:     Phaser.Input.Keyboard.KeyCodes.B,
      c:     Phaser.Input.Keyboard.KeyCodes.C,
      s:     Phaser.Input.Keyboard.KeyCodes.S,
      one:   Phaser.Input.Keyboard.KeyCodes.ONE,
      two:   Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE
    });

    keys.up.on('down', () => {
      if (this.phase === 'answering') { this.selectedOption = Math.max(0, this.selectedOption - 1); this._drawOptionCursor(); }
    });
    keys.down.on('down', () => {
      if (this.phase === 'answering') { this.selectedOption = Math.min(2, this.selectedOption + 1); this._drawOptionCursor(); }
    });

    const confirm = () => {
      if (this.isTyping) { this._skipTyping(); return; }
      if (this.phase === 'intro') { this.phase = 'question'; this._showQuestion(); }
      else if (this.phase === 'answering') this._selectAnswer(this.selectedOption);
    };
    keys.enter.on('down', confirm);
    keys.z.on('down', confirm);

    keys.a.on('down',     () => { if (this.phase === 'answering') this._selectAnswer(0); });
    keys.b.on('down',     () => { if (this.phase === 'answering') this._selectAnswer(1); });
    keys.c.on('down',     () => { if (this.phase === 'answering') this._selectAnswer(2); });
    keys.one.on('down',   () => { if (this.phase === 'answering') this._selectAnswer(0); });
    keys.two.on('down',   () => { if (this.phase === 'answering') this._selectAnswer(1); });
    keys.three.on('down', () => { if (this.phase === 'answering') this._selectAnswer(2); });
    keys.s.on('down',     () => { if (this.phase === 'answering') this._useSpecial(); });
  }

  // ── SELECT ANSWER ────────────────────────────────────────────────────────────
  _selectAnswer(idx) {
    if (this.phase !== 'answering') return;
    if (idx === this.eliminatedOption) return;

    const q = this.gym.questions[this.questionIdx];
    const correct = (idx === q.correct);
    this.phase = 'animating';

    this.optionTexts.forEach((ot, i) => {
      ot.style.color = i === q.correct ? '#006600' : '#880000';
      ot.style.opacity = '1';
    });

    if (correct) {
      GameState.correctAnswers++;
      this.enemyHP--;
      this._showDialog(`¡Correcto!\n${q.options[q.correct]}`);
      this._animateAttack(this.principleSprite, this.leaderSprite, () => {
        this._drawEnemyHPBar(); this._afterAnswer();
      });
    } else {
      if (this._shieldActive) {
        this._shieldActive = false;
        this._showDialog(`¡Escudo de Valores! Sin daño.\nRespuesta correcta: ${q.options[q.correct]}`);
        this.time.delayedCall(800, () => this._afterAnswer());
      } else {
        this.playerHP--;
        GameState.playerHP = this.playerHP;
        this._showDialog(`Incorrecto.\nRespuesta: ${q.options[q.correct]}`);
        this._animateAttack(this.leaderSprite, this.principleSprite, () => {
          this._drawPlayerHPBar(); this._afterAnswer();
        });
      }
    }
  }
}
