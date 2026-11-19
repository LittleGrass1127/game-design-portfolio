/* 团子清洁队 · 入口：状态机（title / play / upgrade / end）、游戏循环、界面与反馈。 */
(function () {
  'use strict';
  const G = window.GAME_CONFIG.game;
  const R = window.TuanziRules, W = window.TuanziWorld, A = window.TuanziAudio, V = window.TuanziRender, I = window.TuanziInput;
  const COLORS = V.colors;
  const $ = id => document.getElementById(id);
  const ui = {
    cleanText: $('cleanText'), cleanBar: $('cleanBar'), coins: $('coins'), clock: $('clock'), sound: $('sound'),
    combo: $('combo'), comboNum: $('comboNum'), prompt: $('prompt'),
    start: $('startScreen'), upgrade: $('upgradeScreen'), choices: $('upgradeChoices'), end: $('endScreen'),
    finalCoins: $('finalCoins'), timeBonus: $('timeBonus'), finalClean: $('finalClean'),
    best: $('bestScore'), endTitle: $('endTitle'), stamp: $('stamp')
  };
  const canvas = $('game');
  let state = null;
  let last = performance.now();
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---- 表现反馈 ----
  function burst(x, y, color, amount = 10, force = 120) {
    for (let i = 0; i < amount; i++) {
      const a = rand(0, Math.PI * 2), v = rand(force * .4, force);
      state.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(.35, .75), max: .75, color, size: rand(3, 8) });
    }
  }
  function floatText(x, y, text, color = '#26315f', size = 18) { state.texts.push({ x, y, text, color, size, life: 1, max: 1 }); }

  function onCollect(res) {
    burst(res.mote.x, res.mote.y, COLORS[res.type], 6, 80);
    A.tone(550 + res.type * 90, .045, 'sine', .022);
    res.merges.forEach(m => {
      burst(m.x, m.y, COLORS[m.type], 18, 185);
      floatText(m.x, m.y - 35, m.coin ? `合成 +${m.coin}` : '噗！合成', COLORS[m.type], 19);
      A.tone(420 + m.fromLevel * 160, .08, 'triangle', .04);
      A.tone(650 + m.fromLevel * 180, .12, 'sine', .025, .06);
    });
  }

  function onSettle(res) {
    res.items.forEach(c => burst(c.x, c.y, COLORS[c.type], 8 + c.level * 2, 150));
    ui.comboNum.textContent = state.combo;
    ui.combo.classList.toggle('show', state.combo >= G.combo.showAt);
    floatText(state.cart.x, state.cart.y - 90, `收入 +${res.value}`, '#f25f87', 24);
    A.tone(523, .07, 'triangle', .04); A.tone(659, .07, 'triangle', .035, .07); A.tone(784, .12, 'triangle', .03, .14);
  }

  // ---- 状态流转 ----
  function startGame() {
    state = W.createState();
    state.mode = 'play';
    ui.start.classList.remove('show');
    ui.end.classList.remove('show');
    A.ensure();
    A.tone(440, .06, 'sine', .035);
    last = performance.now();
  }

  function update(dt) {
    if (!state || state.mode !== 'play') return;
    W.tickTimers(state, dt);
    const dir = I.direction(state.player);
    W.movePlayer(state, dir.dx, dir.dy, dt);
    W.updateMotes(state, dt, Math.random, onCollect);
    W.updateCargo(state, dt);
    W.updateParticles(state, dt);
    if (R.inDeliveryRange(state.player, state.cart) && state.player.cargo.length) onSettle(R.settle(state));
    W.updateCamera(state, dt);
    W.updateCombo(state, dt);
    if (R.shouldOfferUpgrade(state)) showUpgrade();
    if (R.shouldEnd(state)) endGame();
  }

  function showUpgrade() {
    const pool = R.beginUpgrade(state);
    ui.choices.innerHTML = '';
    pool.forEach((u, i) => {
      const button = document.createElement('button'); button.className = 'upgrade-choice';
      button.innerHTML = `<i>${u.icon}</i><b>${i + 1}. ${u.name}</b><span>${u.desc}</span>`;
      button.addEventListener('click', () => chooseUpgrade(u)); ui.choices.appendChild(button);
    });
    ui.upgrade.classList.add('show');
  }

  function chooseUpgrade(u) {
    R.applyUpgrade(state, u.id); ui.upgrade.classList.remove('show'); state.mode = 'play';
    burst(state.player.x, state.player.y, '#ffd45f', 28, 230);
    A.tone(660, .08, 'triangle', .045); A.tone(880, .14, 'sine', .035, .08);
  }

  function dash() {
    if (!R.tryDash(state)) return;
    const p = state.player;
    burst(p.x, p.y + 16, '#ffffff', 12, 150); A.tone(230, .09, 'sawtooth', .025);
  }

  function endGame() {
    const res = R.finish(state);
    if (!res) return;
    if (res.settled) onSettle(res.settled);
    const best = Math.max(res.coins, Number(localStorage.getItem(G.bestScoreKey) || 0));
    localStorage.setItem(G.bestScoreKey, best);
    ui.finalCoins.textContent = state.coins; ui.timeBonus.textContent = `+${res.timeBonus}`; ui.finalClean.textContent = res.clean + '%'; ui.best.textContent = best;
    ui.endTitle.textContent = res.tier.title;
    ui.stamp.textContent = res.tier.stamp;
    ui.end.classList.add('show'); A.tone(523, .12, 'triangle', .04); A.tone(659, .12, 'triangle', .035, .12); A.tone(784, .2, 'triangle', .03, .24);
  }

  function updateHud() {
    if (!state) return;
    const clean = R.cleanPercent(state);
    ui.cleanText.textContent = clean + '%'; ui.cleanBar.style.width = clean + '%'; ui.coins.textContent = state.coins;
    ui.clock.textContent = R.formatClock(state.time);
    ui.clock.parentElement.classList.toggle('danger', Math.ceil(state.time) <= G.hud.dangerSeconds);
    ui.combo.classList.toggle('show', state.combo >= G.combo.showAt && state.comboTimer > 0);
    ui.prompt.classList.toggle('show', state.player.cargo.length >= state.player.capacity);
  }

  function frame(now) {
    const dt = Math.min(G.maxFrameDt, (now - last) / 1000); last = now;
    update(dt);
    if (!state) state = W.createState();
    V.draw(state, I.state); updateHud(); requestAnimationFrame(frame);
  }

  // ---- 绑定 ----
  I.bind(canvas, {
    getCamera: () => state.camera,
    onDash: dash,
    onNumber: n => { if (state?.mode === 'upgrade') ui.choices.children[n - 1]?.click(); }
  });
  $('startButton').addEventListener('click', startGame);
  $('restartButton').addEventListener('click', startGame);
  ui.sound.addEventListener('click', () => { const on = A.toggle(); ui.sound.classList.toggle('off', !on); if (on) { A.ensure(); A.tone(660); } });
  window.addEventListener('resize', V.resize);

  V.init(canvas); state = W.createState(); requestAnimationFrame(frame);
  window.__tuanzi = { get state() { return state; } }; // 调试 / 自动化测试入口
})();
