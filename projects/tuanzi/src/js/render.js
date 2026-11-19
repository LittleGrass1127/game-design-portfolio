/* 团子清洁队 · Canvas 绘制。挂到 window.TuanziRender。 */
(function (root) {
  'use strict';
  const C = root.GAME_CONFIG;
  const G = C.game;
  const VIEW = G.view, WORLD = G.world;
  const COLORS = C.colors.map(c => c.hex);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let canvas = null, ctx = null;

  function init(el) { canvas = el; ctx = canvas.getContext('2d'); resize(); }

  function resize() {
    const dpr = Math.min(2, root.devicePixelRatio || 1);
    canvas.width = VIEW.w * dpr; canvas.height = VIEW.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // input 仅用于角色起伏动画
  function draw(state, input) {
    ctx.save(); ctx.setTransform(canvas.width / VIEW.w, 0, 0, canvas.height / VIEW.h, 0, 0);
    drawBackground();
    ctx.translate(-state.camera.x, -state.camera.y);
    drawWorld(state, input);
    ctx.restore();
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW.h); g.addColorStop(0, '#86dce8'); g.addColorStop(1, '#c9efe2');
    ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  }

  function drawWorld(state, input) {
    ctx.fillStyle = '#bde6d2'; roundedRect(0, 0, WORLD.w, WORLD.h, 70); ctx.fill();
    drawRoads();
    state.patches.forEach(drawPatch);
    state.decorations.forEach(drawDecoration);
    drawCart(state.cart);
    state.motes.forEach(drawMote);
    drawSuction(state);
    for (let i = state.player.cargo.length - 1; i >= 0; i--) drawCargo(state.player.cargo[i]);
    drawPlayer(state.player, input);
    state.particles.forEach(drawParticle);
    state.texts.forEach(drawFloatingText);
  }

  function drawRoads() {
    ctx.fillStyle = '#f1e9d1'; roundedRect(70, 190, WORLD.w - 140, 260, 90); ctx.fill();
    roundedRect(70, 690, WORLD.w - 140, 260, 90); ctx.fill();
    roundedRect(735, 50, 410, WORLD.h - 100, 100); ctx.fill();
    ctx.strokeStyle = '#ffffff77'; ctx.lineWidth = 5; ctx.setLineDash([24, 26]);
    ctx.beginPath(); ctx.moveTo(110, 320); ctx.lineTo(WORLD.w - 110, 320); ctx.moveTo(110, 820); ctx.lineTo(WORLD.w - 110, 820); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = .14; ctx.fillStyle = '#385473';
    for (let x = 130; x < WORLD.w; x += 95) for (let y = 100; y < WORLD.h; y += 90) { ctx.beginPath(); ctx.arc(x + (y % 180 ? 20 : 0), y, 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }

  // 污渍随剩余团子变淡
  function drawPatch(patch) {
    const ratio = patch.remain / patch.initial;
    if (ratio <= 0) return;
    ctx.save(); ctx.globalAlpha = .12 + ratio * .18; ctx.fillStyle = '#7b6c82';
    for (let i = 0; i < 12; i++) { const a = i * 2.399, r = patch.r * (.22 + (i % 5) * .13) * ratio; ctx.beginPath(); ctx.arc(patch.x + Math.cos(a) * r * .55, patch.y + Math.sin(a) * r * .42, 24 + (i % 4) * 10, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function drawDecoration(d) {
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(d.s, d.s);
    if (d.kind === 'tree') {
      ctx.fillStyle = '#60465d'; roundedRect(-8, 12, 16, 38, 7); ctx.fill();
      ctx.fillStyle = '#5bb788'; blob(0, 0, 39); ctx.fill(); ctx.fillStyle = '#8ed39e'; blob(-10, -12, 24); ctx.fill();
    } else {
      ctx.fillStyle = '#596585'; roundedRect(-4, -25, 8, 66, 3); ctx.fill();
      ctx.fillStyle = '#ffd45f'; ctx.beginPath(); ctx.arc(0, -28, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff6b8'; ctx.lineWidth = 5; ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(0, -28, 23, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawCart(c) {
    ctx.save(); ctx.translate(c.x, c.y);
    ctx.globalAlpha = .22; ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.ellipse(0, 64, 112, 31, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#fffdf2'; ctx.strokeStyle = '#26315f'; ctx.lineWidth = 5; roundedRect(-98, -50, 196, 118, 23); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f47f9e'; roundedRect(-105, -76, 210, 42, 18); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#fffdf2' : '#f47f9e'; ctx.beginPath(); ctx.moveTo(-100 + i * 42, -37); ctx.lineTo(-80 + i * 42, -37); ctx.lineTo(-90 + i * 42, -76); ctx.lineTo(-110 + i * 42, -76); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#73d7e8'; roundedRect(-64, -17, 128, 45, 12); ctx.fill(); ctx.fillStyle = '#26315f'; ctx.font = '900 17px Microsoft YaHei'; ctx.textAlign = 'center'; ctx.fillText('团子回收餐车', 0, 12);
    ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.arc(-61, 69, 17, 0, Math.PI * 2); ctx.arc(61, 69, 17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd45f'; ctx.lineWidth = 5; ctx.globalAlpha = .5 + Math.sin(performance.now() / 250) * .12; ctx.beginPath(); ctx.arc(0, 0, 124, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // 吸附范围虚线圈
  function drawSuction(state) {
    if (state.mode !== 'play') return;
    const p = state.player;
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = .12; ctx.lineWidth = 3; ctx.setLineDash([8, 12]); ctx.beginPath(); ctx.arc(p.x, p.y, p.suction, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }

  function drawMote(m) {
    ctx.save(); ctx.translate(m.x, m.y + Math.sin(m.phase) * 3); ctx.rotate(Math.sin(m.phase * .7) * .08);
    ctx.globalAlpha = .18; ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.ellipse(0, m.size + 7, m.size * .9, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    drawDangoShape(m.type, 1, m.size); ctx.restore();
  }

  function drawCargo(c) {
    const size = C.dangoLevels[c.level - 1].drawSize;
    ctx.save(); ctx.translate(c.x, c.y + Math.sin(c.wobble) * 2);
    ctx.globalAlpha = .18; ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.ellipse(0, size + 8, size * .9, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    drawDangoShape(c.type, c.level, size); ctx.restore();
  }

  function drawDangoShape(type, level, size) {
    ctx.fillStyle = COLORS[type]; ctx.strokeStyle = '#26315f'; ctx.lineWidth = Math.max(2.5, size * .13);
    blob(0, 0, size); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.arc(-size * .27, -1, size * .08, 0, Math.PI * 2); ctx.arc(size * .27, -1, size * .08, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, size * .08, size * .18, .1, Math.PI - .1); ctx.stroke();
    if (level > 1) { ctx.fillStyle = '#fffdf2'; ctx.font = `900 ${Math.max(10, size * .42)}px Arial`; ctx.textAlign = 'center'; ctx.fillText(level, 0, -size - 5); }
    ctx.fillStyle = '#ffffff66'; ctx.beginPath(); ctx.arc(-size * .3, -size * .34, size * .19, 0, Math.PI * 2); ctx.fill();
  }

  function drawPlayer(p, input) {
    const moving = input.keys.size || input.pointer;
    ctx.save(); ctx.translate(p.x, p.y + (moving ? Math.sin(p.bob) * 2 : 0)); ctx.scale(p.facing, 1);
    ctx.globalAlpha = .2; ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.ellipse(0, 29, 29, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#26315f'; roundedRect(-20, 4, 40, 31, 14); ctx.fill();
    ctx.fillStyle = '#fffdf2'; ctx.beginPath(); ctx.arc(0, -13, 24, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#26315f'; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#ffd45f'; ctx.beginPath(); ctx.moveTo(-25, -16); ctx.quadraticCurveTo(0, -48, 27, -17); ctx.quadraticCurveTo(8, -23, -25, -16); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#26315f'; ctx.beginPath(); ctx.arc(-7, -11, 2.6, 0, Math.PI * 2); ctx.arc(8, -11, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#26315f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(1, -5, 7, .25, Math.PI - .25); ctx.stroke();
    ctx.fillStyle = '#f47f9e'; ctx.beginPath(); ctx.arc(-15, -3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#73d7e8'; roundedRect(16, 5, 21, 25, 7); ctx.fill(); ctx.strokeStyle = '#26315f'; ctx.lineWidth = 4; ctx.stroke();
    ctx.restore();
  }

  function drawParticle(p) { ctx.save(); ctx.globalAlpha = clamp(p.life / p.max, 0, 1); ctx.fillStyle = p.color; ctx.translate(p.x, p.y); ctx.rotate(p.life * 8); roundedRect(-p.size / 2, -p.size / 2, p.size, p.size, 2); ctx.fill(); ctx.restore(); }
  function drawFloatingText(t) { ctx.save(); ctx.globalAlpha = clamp(t.life / .35, 0, 1); ctx.font = `900 ${t.size}px Microsoft YaHei`; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#fffdf2'; ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y); ctx.restore(); }

  function blob(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, rr = r * (1 + Math.sin(i * 5.17) * .055); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath();
  }
  function roundedRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

  root.TuanziRender = { init, resize, draw, colors: COLORS };
})(window);
