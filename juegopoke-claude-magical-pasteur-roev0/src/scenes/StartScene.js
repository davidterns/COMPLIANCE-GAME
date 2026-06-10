// Title screen — press Enter or Z to start
class StartScene extends Phaser.Scene {
  constructor() { super({ key: 'StartScene' }); }

  create() {
    const W = 320, H = 240;
    this._tlEls = [];
    this.events.once('shutdown', () => { this._tlEls.forEach(e => TextLayer.remove(e)); this._tlEls = []; });

    const bg = this.add.graphics();
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.round(20 + t * 30), g2 = Math.round(20 + t * 20), b = Math.round(80 + t * 60);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g2, b), 1);
      bg.fillRect(0, y, W, 1);
    }

    const stars = [[40,20],[80,15],[120,30],[200,10],[250,25],[290,18],[60,50],[180,45],[310,35]];
    const starG = this.add.graphics();
    starG.fillStyle(0xFFFFFF, 1);
    stars.forEach(([x,y]) => starG.fillRect(x, y, 2, 2));

    const logoX = W / 2, logoY = 80;
    const box = this.add.graphics();
    box.fillStyle(0x000020, 0.85); box.fillRect(logoX-130, logoY-40, 260, 80);
    box.lineStyle(2, 0xFFD700, 1); box.strokeRect(logoX-130, logoY-40, 260, 80);
    box.lineStyle(1, 0xFFFFFF, 0.5); box.strokeRect(logoX-128, logoY-38, 256, 76);

    this._tlEls.push(TextLayer.add(0, logoY - 26,
      'font:bold 20px/1 "Courier New",Courier,monospace;color:#FFD700;text-shadow:2px 2px 0 #000,-2px 2px 0 #000,2px -2px 0 #000,-2px -2px 0 #000;text-align:center;width:320px;pointer-events:none;',
      GAME_CONTENT.meta.title
    ));

    this._tlEls.push(TextLayer.add(0, logoY + 8,
      'font:10px/1 "Courier New",Courier,monospace;color:#fff;text-align:center;width:320px;pointer-events:none;',
      GAME_CONTENT.meta.subtitle
    ));

    this._tlEls.push(TextLayer.add(0, 155,
      'font:10px/1 "Courier New",Courier,monospace;color:#AAFFAA;text-align:center;width:320px;pointer-events:none;animation:tlBlink 1.2s ease-in-out infinite;',
      'Pulsa  ENTER  para iniciar'
    ));

    this._tlEls.push(TextLayer.add(0, H - 32,
      'font:8px/1.4 "Courier New",Courier,monospace;color:#888;text-align:center;width:320px;pointer-events:none;',
      '&#x2191;&#x2193;&#x2190;&#x2192; Mover &nbsp; Z/Enter: Hablar &nbsp; A/B/C: Responder'
    ));

    this._tlEls.push(TextLayer.add(0, H - 18,
      `font:8px/1 "Courier New",Courier,monospace;color:${SCORMManager.isAvailable?'#44FF44':'#FF8844'};text-align:center;width:320px;pointer-events:none;`,
      SCORMManager.isAvailable ? '&#9679; SCORM conectado' : 'Modo standalone &#8212; SCORM no conectado'
    ));

    const keys = this.input.keyboard.addKeys({
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    const go = () => {
      if (GameState.allGymsComplete) { this.scene.start('VictoryScene'); return; }
      if (GameState.principle >= 0)  { this.scene.start('MapScene');     return; }
      this.scene.start('IntroScene');
    };

    keys.enter.once('down', go);
    keys.z.once('down', go);
    keys.space.once('down', go);
  }
}
