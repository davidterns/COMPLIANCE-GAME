// Sprite drawing functions — called from BootScene to generate Phaser textures
const Sprites = {

  _S: 1, // global pixel scale — each logical pixel becomes _S × _S

  // ── HELPERS (scale-aware) ──────────────────────────────────────────────────
  _px(g, x, y, color) {
    const S = this._S;
    g.fillStyle(parseInt(color.replace('#','0x'), 16), 1);
    g.fillRect(x * S, y * S, S, S);
  },

  _rect(g, x, y, w, h, color) {
    const S = this._S;
    g.fillStyle(parseInt(color.replace('#','0x'), 16), 1);
    g.fillRect(x * S, y * S, w * S, h * S);
  },

  _circle(g, cx, cy, r, color) {
    const S = this._S;
    const col = parseInt(color.replace('#','0x'), 16);
    g.fillStyle(col, 1);
    for (let dy = -r; dy <= r; dy++) {
      const hw = Math.floor(Math.sqrt(r * r - dy * dy));
      g.fillRect((cx - hw) * S, (cy + dy) * S, (hw * 2 + 1) * S, S);
    }
  },

  _strokeCircle(g, cx, cy, r, color) {
    const S = this._S;
    const col = parseInt(color.replace('#','0x'), 16);
    g.fillStyle(col, 1);
    let x = r, y = 0, err = 0;
    while (x >= y) {
      [[x,y],[y,x],[-y,x],[-x,y],[-x,-y],[-y,-x],[y,-x],[x,-y]].forEach(([dx,dy]) => {
        g.fillRect(Math.round((cx+dx)*S), Math.round((cy+dy)*S), S, S);
      });
      y++;
      if (err <= 0) err += 2 * y + 1;
      if (err > 0) { x--; err -= 2 * x + 1; }
    }
  },

  // ── CHARACTER SPRITE FACTORY — 4 directions (16×24) ─────────────────────
  drawChar(g, ox, oy, opts, dir = 'down') {
    const { h1, h2, sL, sM, sD, pa, pD, bk = '#111111' } = opts;
    const sk = '#F5C5A3', skD = '#D09070';
    const R = (x, y, w, h, c) => this._rect(g, ox+x, oy+y, w, h, c);
    const P = (x, y, c) => this._px(g, ox+x, oy+y, c);

    // Shared body builder: shirt rows 8-14, pants rows 15-20, shoes rows 21-22
    const body = (neck, vNeck) => {
      if (neck) R(neck[0], 7, neck[1], 2, sk);
      R(4, 8, 8, 1, sL); R(2, 9, 12, 1, sL);           // collar + shoulders
      R(4, 9, 8, 4, sM); R(0, 9, 4, 4, sM); R(12, 9, 4, 4, sM); // shirt + arms
      R(0, 9, 1, 4, sD); R(15, 9, 1, 4, sD);            // arm edge shadows
      if (vNeck) R(vNeck[0], 9, vNeck[1], 5, sk);       // V-neck skin
      R(4, 13, 8, 2, sD);                                // shirt bottom shadow
      R(3, 15, 4, 6, pa); R(9, 15, 4, 6, pa);           // legs
      R(3, 15, 1, 6, pD); R(6, 15, 1, 6, pD);           // left leg edges
      R(9, 15, 1, 6, pD); R(12, 15, 1, 6, pD);          // right leg edges
      R(2, 21, 5, 2, bk); R(9, 21, 5, 2, bk);           // shoes
      R(2, 22, 6, 1, bk); R(8, 22, 6, 1, bk);           // sole wider
      P(3, 21, '#444'); P(10, 21, '#444');               // shoe shine
    };

    if (dir === 'down') {
      // Hair
      R(4,0,8,1,h1); R(3,1,10,2,h1);
      R(2,2,2,5,h1); R(12,2,2,5,h1);    // sideburns
      R(4,2,8,2,h2);                     // inner shadow
      // Face
      R(4,2,8,5,sk); R(3,3,1,4,sk); R(12,3,1,4,sk);
      R(4,4,2,2,bk); P(5,4,'#5090D0'); P(4,4,'#FFF'); // left eye
      R(10,4,2,2,bk); P(10,4,'#5090D0'); P(11,4,'#FFF'); // right eye
      P(7,5,skD); P(8,5,skD);           // nose
      R(6,6,4,1,'#C08070');             // mouth
      body([6, 4], [7, 2]);

    } else if (dir === 'up') {
      // Hair (back of head — full, no face)
      R(4,0,8,1,h1); R(3,1,10,2,h1);
      R(2,2,12,5,h1);
      R(2,2,2,5,h1); R(12,2,2,5,h1);
      R(4,3,8,4,h2);                     // inner shadow
      R(4,7,8,1,h1);                     // neckline hair
      body([6, 4], null);               // shirt (no V-neck from back)

    } else {
      // LEFT / RIGHT — side profile; write for left-facing, mirror for right
      const mR = (x,y,w,h,c) => dir==='right' ? R(16-x-w,y,w,h,c) : R(x,y,w,h,c);
      const mP = (x,y,c)     => dir==='right' ? P(15-x,y,c) : P(x,y,c);
      // Hair
      mR(1,0,8,1,h1); mR(1,1,9,2,h1);
      mR(0,3,3,4,h1);                    // back of hair
      mR(2,2,7,2,h2);                    // shadow
      // Face (profile)
      mR(3,2,7,5,sk); mR(2,3,1,4,sk);
      mR(3,4,2,2,bk); mP(4,4,'#5090D0'); mP(3,4,'#FFF'); // single eye
      mP(8,5,skD);                        // nose tip
      mR(4,6,3,1,'#C08070');             // mouth
      // Neck
      mR(4,7,4,2,sk);
      // Shirt (side-on — narrower reach to far side)
      mR(3,8,10,1,sL); mR(2,9,10,2,sL);
      mR(0,9,12,4,sM);
      mR(0,9,1,4,sD);                    // far arm edge
      mR(10,9,6,4,sD);                   // back-of-torso shadow
      mR(2,13,9,2,sD);
      // Legs (front leg + half-visible back leg)
      mR(4,15,4,6,pa);                   // front leg
      mR(2,15,3,5,pD);                   // back leg (darker, receded)
      mR(4,15,1,6,pD); mR(7,15,1,6,pD);
      // Shoes
      mR(2,21,6,2,bk);                   // back shoe
      mR(4,21,5,1,bk);                   // front shoe overlap
      mR(1,22,7,1,bk);                   // sole
      mP(4,21,'#444');
    }
  },

  // ── PRINCIPLE CREATURE — CRISTAL (56×56) ─────────────────────────────────
  drawCristal(g, ox, oy) {
    const R = (x,y,w,h,c) => this._rect(g, ox+x, oy+y, w, h, c);
    const P = (x,y,c) => this._px(g, ox+x, oy+y, c);
    const FC = (cx,cy,r,c) => this._circle(g, ox+cx, oy+cy, r, c);

    // hat
    R(17,2,22,8,'#333344'); R(18,3,20,6,'#555566');
    R(14,9,28,3,'#333344'); R(17,8,22,2,'#C8A420');
    R(17,1,22,1,'#111'); R(16,2,1,7,'#111'); R(39,2,1,7,'#111'); R(13,9,30,1,'#111');
    // glass
    FC(28,30,18,'#111'); FC(28,30,17,'#1B4F8E'); FC(28,30,15,'#87CEEB');
    FC(22,23,5,'#D6EEFF');
    // eyes
    R(20,28,5,5,'#111'); R(31,28,5,5,'#111');
    R(21,29,3,3,'#4a8fc8'); R(32,29,3,3,'#4a8fc8');
    R(21,28,2,2,'#fff'); R(32,28,2,2,'#fff');
    P(22,30,'#111'); P(33,30,'#111');
    // blush + smile
    R(16,33,4,2,'#FFB8C0'); R(36,33,4,2,'#FFB8C0');
    R(24,36,8,1,'#111'); P(23,35,'#111'); P(32,35,'#111');
    // handle
    R(42,44,8,3,'#111'); R(43,45,6,1,'#8B5A2B');
    R(42,43,4,8,'#111'); R(43,44,2,7,'#8B5A2B');
    // feet
    R(22,47,4,4,'#111'); R(30,47,4,4,'#111');
    R(23,48,2,3,'#8B5A2B'); R(31,48,2,3,'#8B5A2B');
    R(22,51,6,2,'#111'); R(30,51,6,2,'#111');
    R(22,51,5,1,'#202040'); R(30,51,5,1,'#202040');
  },

  // ── PRINCIPLE CREATURE — VALOR (56×56) ───────────────────────────────────
  drawValor(g, ox, oy) {
    const R = (x,y,w,h,c) => this._rect(g, ox+x, oy+y, w, h, c);
    const P = (x,y,c) => this._px(g, ox+x, oy+y, c);
    const FC = (cx,cy,r,c) => this._circle(g, ox+cx, oy+cy, r, c);

    // shield body
    for (let row = 4; row <= 52; row++) {
      let minX = 56, maxX = 0;
      if (row >= 4  && row <= 6)  { minX = 16; maxX = 40; }
      if (row >= 6  && row <= 34) { minX = 12; maxX = 44; }
      if (row >= 34 && row <= 40) { minX = Math.round(12+(row-34)*0.5); maxX = Math.round(44-(row-34)*0.5); }
      if (row >= 40 && row <= 52) { minX = Math.round(14+(row-40)*2.3); maxX = Math.round(42-(row-40)*2.3); }
      if (minX < maxX) {
        R(minX, row, 3, 1, '#CCCCCC');
        R(maxX-3, row, 3, 1, '#CCCCCC');
        if (maxX-minX > 6) R(minX+3, row, maxX-minX-6, 1, row < 28 ? '#3060C0' : '#1E3A8A');
        P(minX-1, row, '#111'); P(maxX, row, '#111');
      }
    }
    // gold bands
    R(15,12,26,3,'#E8B800'); R(15,20,26,3,'#E8B800'); R(15,28,26,3,'#A07800');
    // face
    FC(28,13,7,'#F5C5A3');
    R(22,6,12,6,'#5C3317'); R(21,7,14,4,'#5C3317');
    R(23,13,3,3,'#111'); R(31,13,3,3,'#111');
    R(24,13,2,2,'#4080E0'); R(32,13,2,2,'#4080E0');
    P(24,13,'#fff'); P(32,13,'#fff');
    R(26,18,4,1,'#111');
    // star
    [[0,0,0,1,1,1,0,0,0],[0,0,1,1,1,1,1,0,0],[1,1,1,1,1,1,1,1,1],
     [0,1,1,1,1,1,1,1,0],[0,0,1,1,1,1,1,0,0],[0,1,0,1,1,1,0,1,0],[1,0,0,0,1,0,0,0,1]]
     .forEach((row,ri) => row.forEach((v,ci) => { if (v) R(24+ci, 33+ri, 1, 1, '#FFD700'); }));
    // gauntlets
    R(6,20,8,8,'#111'); R(7,21,6,6,'#CCCCCC'); R(7,21,3,6,'#E8B800');
    R(42,20,8,8,'#111'); R(43,21,6,6,'#CCCCCC'); R(46,21,3,6,'#E8B800');
    // feet
    R(22,50,6,5,'#111'); R(28,50,6,5,'#111');
    R(23,51,4,4,'#CCCCCC'); R(29,51,4,4,'#CCCCCC');
    R(23,54,5,1,'#E8B800'); R(29,54,5,1,'#E8B800');
  },

  // ── PRINCIPLE CREATURE — SABIO (56×56) ───────────────────────────────────
  drawSabio(g, ox, oy) {
    const R = (x,y,w,h,c) => this._rect(g, ox+x, oy+y, w, h, c);
    const P = (x,y,c) => this._px(g, ox+x, oy+y, c);
    const FC = (cx,cy,r,c) => this._circle(g, ox+cx, oy+cy, r, c);
    const SC = (cx,cy,r,c) => this._strokeCircle(g, ox+cx, oy+cy, r, c);
    const SA_body='#8B5E2A', SA_bodyL='#C8903A', SA_cream='#F5E8C8';
    const SA_glass='#225522', SA_glassL='#449944', SA_beak='#E87820';

    FC(28,36,16,'#111'); FC(28,36,15,SA_body);
    FC(28,38,10,SA_cream);
    for (let i=0; i<8; i++) {
      const a=(i/8)*Math.PI+0.1;
      R(Math.round(28+Math.cos(a)*10)-2, Math.round(38+Math.sin(a)*8)-1, 4, 2, SA_bodyL);
    }
    R(21,19,4,6,'#111'); R(31,19,4,6,'#111');
    R(22,20,2,4,SA_body); R(32,20,2,4,SA_body);
    FC(28,30,12,'#111'); FC(28,30,11,SA_body); FC(28,30,8,SA_cream);
    FC(22,29,6,'#111'); FC(34,29,6,'#111');
    FC(22,29,5,'#FFF8C0'); FC(34,29,5,'#FFF8C0');
    FC(22,29,3,'#111'); FC(34,29,3,'#111');
    FC(23,28,2,'#FF8000'); FC(35,28,2,'#FF8000');
    R(21,27,2,2,'#fff'); R(33,27,2,2,'#fff');
    SC(22,29,7,SA_glass); SC(34,29,7,SA_glass);
    SC(22,29,8,SA_glassL); SC(34,29,8,SA_glassL);
    R(27,28,4,2,SA_glass); R(14,28,6,2,SA_glass); R(42,28,6,2,SA_glass);
    R(26,34,4,1,'#111'); R(27,35,4,3,'#111');
    R(27,35,3,2,SA_beak); P(28,36,SA_beak);
    R(10,32,8,14,'#111'); R(11,33,6,12,SA_body); R(11,37,6,4,SA_bodyL);
    R(38,32,8,14,'#111'); R(39,33,6,12,SA_body); R(39,37,6,4,SA_bodyL);
    R(22,50,4,6,'#111'); R(26,50,4,6,'#111'); R(30,50,4,6,'#111');
    R(23,51,2,4,SA_body); R(27,51,2,4,SA_bodyL); R(31,51,2,4,SA_body);
    R(21,50,5,4,'#111'); R(30,50,5,4,'#111');
    R(19,52,4,2,SA_beak); R(21,52,4,2,SA_beak);
    R(28,52,4,2,SA_beak); R(32,52,4,2,SA_beak);
  },

  // ── PRINCIPLE BACK SPRITES (48×48) ───────────────────────────────────────
  drawCristalBack(g, ox, oy) {
    const R = (x,y,w,h,c) => this._rect(g, ox+x, oy+y, w, h, c);
    const FC = (cx,cy,r,c) => this._circle(g, ox+cx, oy+cy, r, c);
    // hat back
    R(14,1,20,8,'#333344'); R(11,8,26,3,'#333344'); R(14,7,20,2,'#C8A420');
    R(13,0,22,1,'#111'); R(12,1,1,7,'#111'); R(36,1,1,7,'#111'); R(10,8,28,1,'#111');
    // glass from behind
    FC(24,28,17,'#111'); FC(24,28,16,'#2A2A3A'); FC(24,28,14,'#383848');
    R(10,15,3,6,'#1B4F8E'); R(35,15,3,6,'#1B4F8E');
    // handle
    R(26,40,12,4,'#111'); R(27,41,10,2,'#8B5A2B');
    // feet
    R(18,44,4,4,'#111'); R(26,44,4,4,'#111');
    R(19,45,2,3,'#8B5A2B'); R(27,45,2,3,'#8B5A2B');
    R(18,47,6,1,'#111'); R(26,47,6,1,'#111');
  },

  drawValorBack(g, ox, oy) {
    const R = (x,y,w,h,c) => this._rect(g, ox+x, oy+y, w, h, c);
    const FC = (cx,cy,r,c) => this._circle(g, ox+cx, oy+cy, r, c);
    for (let row = 2; row <= 44; row++) {
      let minX = 48, maxX = 0;
      if (row >= 2  && row <= 4)  { minX = 14; maxX = 34; }
      if (row >= 4  && row <= 28) { minX = 10; maxX = 38; }
      if (row >= 28 && row <= 34) { minX = Math.round(10+(row-28)*0.5); maxX = Math.round(38-(row-28)*0.5); }
      if (row >= 34 && row <= 44) { minX = Math.round(10+(row-34)*2.2); maxX = Math.round(38-(row-34)*2.2); }
      if (minX < maxX) {
        R(minX, row, 3, 1, '#AAAAAA');
        R(maxX-3, row, 3, 1, '#AAAAAA');
        if (maxX-minX > 6) R(minX+3, row, maxX-minX-6, 1, row%4<2 ? '#606070' : '#505060');
        this._px(g, ox+minX-1, oy+row, '#111');
        this._px(g, ox+maxX,   oy+row, '#111');
      }
    }
    R(20,5,3,30,'#8B5E2A'); R(25,5,3,30,'#8B5E2A');
    R(14,15,14,3,'#8B5E2A'); R(14,22,14,3,'#8B5E2A');
    R(19,14,10,10,'#111'); R(20,15,8,8,'#E8B800'); R(21,16,6,6,'#8B6000'); R(23,18,2,2,'#E8B800');
    R(16,43,5,5,'#111'); R(27,43,5,5,'#111');
    R(17,44,3,4,'#CCCCCC'); R(28,44,3,4,'#CCCCCC');
  },

  drawSabioBack(g, ox, oy) {
    const R = (x,y,w,h,c) => this._rect(g, ox+x, oy+y, w, h, c);
    const FC = (cx,cy,r,c) => this._circle(g, ox+cx, oy+cy, r, c);
    const SA_body='#8B5E2A', SA_bodyL='#C8903A', SA_beak='#E87820', SA_glass='#225522';
    FC(24,32,14,'#111'); FC(24,32,13,SA_body);
    for (let row=20; row<=44; row+=3)
      for (let col=12; col<=36; col+=4) {
        const d=Math.sqrt((col-24)**2+(row-32)**2);
        if (d<12) R(col,row,3,2,SA_bodyL);
      }
    FC(24,20,11,'#111'); FC(24,20,10,SA_body);
    R(16,12,4,5,'#111'); R(26,12,4,5,'#111');
    R(17,13,2,3,SA_body); R(27,13,2,3,SA_body);
    R(12,19,6,2,SA_glass); R(30,19,6,2,SA_glass);
    R(8,28,8,12,'#111'); R(9,29,6,10,SA_body); R(9,35,6,4,SA_bodyL);
    R(32,28,8,12,'#111'); R(33,29,6,10,SA_body); R(33,35,6,4,SA_bodyL);
    for (let i=0; i<5; i++) {
      const tx=16+i*4, len=4+Math.abs(i-2)*2;
      R(tx,44,3,len,'#111');
      R(tx+1,45,1,len-2, i%2===0 ? SA_body : SA_bodyL);
    }
    R(17,44,5,4,'#111'); R(26,44,5,4,'#111');
    R(15,46,4,2,SA_beak); R(19,46,4,2,SA_beak);
    R(24,46,4,2,SA_beak); R(29,46,4,2,SA_beak);
  },

  // ── GYM LEADER FRONT SPRITES (32×60) ─────────────────────────────────────
  // Leader 0 — Elena (IA/AI gym): tech researcher, silver hair, blue visor
  drawLeader0(g, ox, oy) {
    const R=(x,y,w,h,c)=>this._rect(g,ox+x,oy+y,w,h,c), FC=(cx,cy,r,c)=>this._circle(g,ox+cx,oy+cy,r,c);
    // hair
    R(8,0,16,5,'#B8B8D0'); R(6,2,20,10,'#B8B8D0'); R(6,10,3,6,'#A8A8C0'); R(23,10,3,6,'#A8A8C0');
    // face
    FC(16,13,8,'#F5C5A3');
    // tech visor (blue augmented reality glasses)
    R(7,10,18,5,'#1848C0'); R(7,10,18,1,'#4080E0'); R(8,14,16,1,'#1030A0');
    R(8,11,4,2,'#80C0FF'); R(14,11,4,2,'#80C0FF'); // lens shine
    R(7,10,1,5,'#000'); R(24,10,1,5,'#000'); // frame sides
    // mouth
    R(13,18,6,1,'#C08070');
    // neck + collar
    R(13,21,6,3,'#F5C5A3'); R(12,23,8,3,'#E8E8F0');
    // lab coat body
    R(2,24,28,16,'#F0F0F8'); R(2,24,28,1,'#DDDDE8'); R(2,38,28,2,'#D0D0E0');
    // lapels
    R(12,24,4,8,'#F5C5A3'); R(16,24,4,8,'#F5C5A3');
    R(12,24,4,1,'#000'); R(16,24,4,1,'#000');
    // chest pocket (left) with tech badge
    R(4,28,7,6,'#D8E8F8'); R(4,28,7,1,'#90B8E0');
    R(5,30,2,2,'#60A0E0'); R(8,30,2,2,'#40C8A0');
    // arms
    R(0,24,2,16,'#F0F0F8'); R(30,24,2,16,'#F0F0F8');
    // slacks
    R(4,40,10,16,'#6868A0'); R(18,40,10,16,'#6868A0');
    R(4,50,10,6,'#5050A0'); R(18,50,10,6,'#5050A0');
    // shoes
    R(3,56,12,4,'#E8F0FF'); R(17,56,12,4,'#E8F0FF');
    R(3,58,12,2,'#9090B0'); R(17,58,12,2,'#9090B0');
    // outlines
    R(6,0,20,1,'#000'); R(5,1,1,20,'#000'); R(26,1,1,20,'#000');
    R(2,24,1,36,'#000'); R(29,24,1,36,'#000');
    R(3,56,1,4,'#000'); R(14,56,1,4,'#000'); R(17,56,1,4,'#000'); R(28,56,1,4,'#000');
  },

  // Leader 1 — Marco (AC/Compliance): executive, black slicked hair, dark suit, gold tie
  drawLeader1(g, ox, oy) {
    const R=(x,y,w,h,c)=>this._rect(g,ox+x,oy+y,w,h,c), FC=(cx,cy,r,c)=>this._circle(g,ox+cx,oy+cy,r,c);
    // hair (slicked back)
    R(8,0,16,5,'#101018'); R(6,2,20,10,'#101018');
    R(6,2,3,10,'#181828'); R(23,2,3,10,'#181828');
    R(10,1,12,2,'#282838'); // swept highlight
    // face
    FC(16,13,8,'#F5C5A3');
    // eyes (strong brows)
    R(8,8,8,2,'#101018'); R(16,8,8,2,'#101018'); // eyebrows
    R(9,11,4,3,'#101018'); R(19,11,4,3,'#101018');
    R(10,11,2,2,'#4080E0'); R(20,11,2,2,'#4080E0');
    // firm mouth
    R(12,17,8,1,'#B07060'); R(13,18,6,1,'#C08070');
    // neck + white collar
    R(13,21,6,3,'#F5C5A3');
    R(11,23,10,3,'#F8F8F8'); R(11,23,10,1,'#E0E0E0'); // white shirt
    // dark suit
    R(2,25,28,15,'#101828'); R(2,25,28,1,'#1A2840'); R(2,38,28,2,'#080F18');
    // gold tie
    R(14,25,4,14,'#D0A000'); R(14,25,4,1,'#F0C000'); R(14,36,6,3,'#B08800');
    // lapels (white shirt visible)
    R(12,25,3,8,'#F0F0F0'); R(17,25,3,8,'#F0F0F0');
    // arms
    R(0,25,2,14,'#101828'); R(30,25,2,14,'#101828');
    R(0,37,3,2,'#F8F8F8'); R(29,37,3,2,'#F8F8F8'); // white cuffs
    // dark trousers
    R(4,40,10,16,'#0C1220'); R(18,40,10,16,'#0C1220');
    R(4,50,10,6,'#080C18'); R(18,50,10,6,'#080C18');
    // black shoes
    R(3,56,12,4,'#080810'); R(17,56,12,4,'#080810');
    R(3,56,4,2,'#303040'); R(17,56,4,2,'#303040'); // shine
    // outlines
    R(6,0,20,1,'#000'); R(5,1,1,20,'#000'); R(26,1,1,20,'#000');
    R(2,25,1,35,'#000'); R(29,25,1,35,'#000');
    R(3,56,1,4,'#000'); R(14,56,1,4,'#000'); R(17,56,1,4,'#000'); R(28,56,1,4,'#000');
  },

  // Leader 2 — Zara (DC/Security): security expert, dark hair, tactical hoodie, orange badge
  drawLeader2(g, ox, oy) {
    const R=(x,y,w,h,c)=>this._rect(g,ox+x,oy+y,w,h,c), FC=(cx,cy,r,c)=>this._circle(g,ox+cx,oy+cy,r,c);
    // ponytail (extends upward from head)
    R(22,0,5,14,'#181010'); R(23,1,3,12,'#221818'); R(24,1,1,10,'#2C2020');
    R(20,0,2,4,'#181010'); // tie band
    // hair
    R(8,2,14,6,'#181010'); R(6,4,20,10,'#181010');
    R(6,4,3,10,'#201818'); R(24,4,3,10,'#201818');
    // face
    FC(16,14,8,'#D4A870');
    // eyes (alert/determined)
    R(9,11,5,3,'#101010'); R(18,11,5,3,'#101010');
    R(10,11,2,2,'#40A060'); R(19,11,2,2,'#40A060'); // green eyes
    R(10,11,1,1,'#A0E0A0'); R(19,11,1,1,'#A0E0A0');
    // determined mouth
    R(13,19,6,1,'#A07850'); R(13,20,4,1,'#B07860');
    // neck
    R(13,22,6,3,'#D4A870');
    // dark tactical hoodie
    R(2,25,28,15,'#253020'); R(2,25,28,1,'#304030'); R(2,38,28,2,'#182018');
    // hood drawstring
    R(13,25,6,2,'#1A2418'); R(15,25,2,4,'#283828');
    // ORANGE SECURITY BADGE (left chest)
    R(4,28,8,7,'#E85010'); R(4,28,8,1,'#FF6828'); // badge
    R(5,29,6,5,'#D04008');
    R(6,30,4,3,'#F07820'); // badge panel
    R(7,31,2,2,'#FFD060'); // star emblem
    // arms
    R(0,25,2,14,'#253020'); R(30,25,2,14,'#253020');
    R(0,37,3,2,'#405050'); R(29,37,3,2,'#405050'); // wristband
    // dark tactical pants
    R(4,40,10,16,'#1A2018'); R(18,40,10,16,'#1A2018');
    R(7,44,3,8,'#253020'); R(22,44,3,8,'#253020'); // cargo pockets
    R(4,50,10,6,'#101410'); R(18,50,10,6,'#101410');
    // tactical boots
    R(3,56,12,4,'#101010'); R(17,56,12,4,'#101010');
    R(3,56,12,1,'#283828'); R(17,56,12,1,'#283828');
    R(3,59,6,1,'#202820'); R(17,59,6,1,'#202820');
    // outlines
    R(6,2,20,1,'#000'); R(5,3,1,20,'#000'); R(26,3,1,20,'#000');
    R(2,25,1,35,'#000'); R(29,25,1,35,'#000');
    R(3,56,1,4,'#000'); R(14,56,1,4,'#000'); R(17,56,1,4,'#000'); R(28,56,1,4,'#000');
  },

  // ── TILE GRAPHICS ─────────────────────────────────────────────────────────
  drawGrassTile(g, variant) {
    const BASE = variant === 0 ? 0x78C040 : 0x70B838;
    g.fillStyle(BASE, 1); g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x489020, 1);
    (variant === 0
      ? [[3,2],[8,7],[13,3],[1,11],[11,12],[6,14],[14,7],[5,5],[9,10]]
      : [[1,4],[7,1],[12,5],[2,9],[10,3],[4,13],[13,11],[9,8],[0,15]]
    ).forEach(([x,y]) => g.fillRect(x, y, 1, 1));
    g.fillStyle(0xA0E050, 1);
    (variant === 0 ? [[2,7],[10,1],[15,13]] : [[5,10],[13,2],[0,6]])
      .forEach(([x,y]) => g.fillRect(x, y, 1, 1));
    g.fillStyle(0x307010, 1);
    (variant === 0 ? [[4,2],[14,8]] : [[2,5],[11,12]])
      .forEach(([x,y]) => g.fillRect(x, y, 1, 1));
  },

  drawPathTile(g) {
    g.fillStyle(0xC8B870, 1); g.fillRect(0, 0, 16, 16);
    // Mortar grid
    g.fillStyle(0x907840, 1);
    g.fillRect(0, 5, 16, 1); g.fillRect(0, 11, 16, 1);
    g.fillRect(7, 0, 1, 5); g.fillRect(3, 6, 1, 5); g.fillRect(11, 6, 1, 5); g.fillRect(7, 12, 1, 4);
    // Stone highlights (top-left corner of each stone cell)
    g.fillStyle(0xE8D080, 1);
    g.fillRect(1, 1, 5, 1); g.fillRect(1, 1, 1, 3);
    g.fillRect(9, 1, 7, 1); g.fillRect(9, 1, 1, 3);
    g.fillRect(1, 7, 2, 1); g.fillRect(4, 7, 7, 1);
    g.fillRect(1, 13, 5, 1); g.fillRect(9, 13, 7, 1);
    // Stone shadows (bottom-right)
    g.fillStyle(0xA09050, 1);
    g.fillRect(1, 4, 5, 1); g.fillRect(9, 4, 6, 1);
    g.fillRect(1, 10, 2, 1); g.fillRect(4, 10, 7, 1); g.fillRect(12, 10, 3, 1);
    g.fillRect(1, 15, 5, 1); g.fillRect(9, 15, 6, 1);
  },

  drawTreeTile(g) {
    // Seamless canopy — looks great as 2×2 cluster
    g.fillStyle(0x183020, 1); g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x285830, 1); g.fillRect(1, 1, 14, 14);
    g.fillStyle(0x407840, 1); g.fillRect(2, 2, 12, 12);
    g.fillStyle(0x589050, 1); g.fillRect(3, 3, 10, 10);
    // Highlight upper-left area
    g.fillStyle(0x70A860, 1);
    g.fillRect(4, 3, 6, 3); g.fillRect(3, 4, 3, 5);
    g.fillStyle(0x90C070, 1);
    g.fillRect(5, 4, 3, 2); g.fillRect(4, 5, 2, 2);
    // Corner darkening for seamless cluster appearance
    g.fillStyle(0x183020, 1);
    g.fillRect(0,0,2,2); g.fillRect(14,0,2,2);
    g.fillRect(0,14,2,2); g.fillRect(14,14,2,2);
  },

  drawTileTree(g, tx, ty) { this.drawTreeTile(g); },
};
