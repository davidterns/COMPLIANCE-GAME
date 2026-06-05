// Phaser game entry point
SCORMManager.init();

// Restore saved progress if any
if (GameState.load()) {
  console.log('[Game] Progress restored from SCORM.');
}

const config = {
  type: Phaser.CANVAS,
  width: 320,
  height: 240,
  backgroundColor: '#000000',
  pixelArt: true,
  roundPixels: true,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    BootScene,
    StartScene,
    IntroScene,
    MapScene,
    BattleScene,
    VictoryScene
  ]
};

const game = new Phaser.Game(config);

// Fixed DOM overlay that precisely tracks the canvas position/scale.
// All text in scenes goes through TextLayer instead of Phaser's DOM system
// (which is clipped to a 320px container anchored at left:0 regardless of
// canvas centering, causing text to be invisible or misaligned).
const TextLayer = (() => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;top:0;left:0;width:320px;height:240px;transform-origin:top left;pointer-events:none;overflow:visible;z-index:999;';
  document.body.appendChild(el);

  const sty = document.createElement('style');
  sty.textContent = '@keyframes tlBlink{0%,100%{opacity:1}50%{opacity:0}}';
  document.head.appendChild(sty);

  function sync() {
    if (!game || !game.canvas) return;
    const r = game.canvas.getBoundingClientRect();
    el.style.left = r.left + 'px';
    el.style.top  = r.top  + 'px';
    el.style.transform = `scale(${r.width / 320},${r.height / 240})`;
  }

  window.addEventListener('resize', sync);
  game.events.once('ready', sync);
  setTimeout(sync, 300);

  return {
    add(x, y, css, html = '') {
      const d = document.createElement('div');
      d.style.cssText = `position:absolute;left:${x}px;top:${y}px;${css}`;
      d.innerHTML = html;
      el.appendChild(d);
      return d;
    },
    remove(d) { if (d && d.parentNode === el) el.removeChild(d); }
  };
})();
