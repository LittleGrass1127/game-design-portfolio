/* 团子清洁队 · 世界与实体：初始状态生成、角色移动、团子吸附、队列跟随、粒子。无 DOM，挂到 window.TuanziWorld。 */
(function (root) {
  'use strict';
  const C = root.GAME_CONFIG;
  const G = C.game;
  const R = root.TuanziRules;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // 一局的完整初始状态（重开即重建）
  function createState(rng = Math.random) {
    const rand = (a, b) => R.rand(rng, a, b);
    const W = G.world, V = G.view, P = G.player;
    const patches = C.patches.map((p, i) => ({ x: p.x, y: p.y, r: p.r, i, initial: p.motes, remain: p.motes }));
    const motes = [];
    patches.forEach((patch, patchIndex) => {
      for (let i = 0; i < patch.initial; i++) {
        const a = rand(0, Math.PI * 2), rr = Math.sqrt(rng()) * patch.r;
        motes.push({
          x: patch.x + Math.cos(a) * rr, y: patch.y + Math.sin(a) * rr,
          vx: 0, vy: 0, type: Math.floor(rng() * C.colors.length), level: 1,
          size: rand(G.mote.sizeMin, G.mote.sizeMax), phase: rand(0, G.mote.phaseMax), patch: patchIndex
        });
      }
    });
    return {
      mode: 'title', time: G.durationSec, coins: 0, cleaned: 0, total: motes.length,
      combo: 0, comboTimer: 0, nextUpgrade: G.upgradeThresholds[0], upgradeCount: 0, takenUpgrades: [],
      camera: { x: W.w / 2 - V.w / 2, y: W.h / 2 - V.h / 2 },
      cart: { x: W.w / 2, y: W.h / 2, deliveryRadius: G.cart.deliveryRadius },
      player: {
        x: W.w / 2, y: W.h / 2 + P.spawnOffsetY, r: P.r, speed: P.speed, suction: P.suction, pullPower: P.pullPower,
        capacity: P.capacity, value: P.value, highLevelBonus: P.highLevelBonus, comboWindow: P.comboWindow,
        mergeNeed: P.mergeNeed, mergeCoin: P.mergeCoin, emptyBoost: P.emptyBoost, dash: 0, dashCd: 0,
        dashCooldown: P.dashCooldown, rainbowEvery: P.rainbowEvery, pickups: 0, cargo: [], facing: 1, bob: 0
      },
      patches, motes, particles: [], texts: [], confetti: [],
      decorations: makeDecorations(rng)
    };
  }

  // 路边树和路灯（纯装饰）
  function makeDecorations(rng = Math.random) {
    const rand = (a, b) => R.rand(rng, a, b), W = G.world, items = [];
    for (let i = 0; i < G.decorations.count; i++) {
      const edge = rng() < .5;
      items.push({ x: edge ? rand(80, W.w - 80) : (rng() < .5 ? rand(80, 180) : rand(W.w - 180, W.w - 80)), y: edge ? (rng() < .5 ? rand(80, 150) : rand(W.h - 150, W.h - 80)) : rand(80, W.h - 80), kind: rng() < G.decorations.treeRatio ? 'tree' : 'lamp', s: rand(.8, 1.2) });
    }
    return items;
  }

  // 计时器推进（倒计时、冲刺、起伏）
  function tickTimers(state, dt) {
    const p = state.player;
    state.time = Math.max(0, state.time - dt);
    p.dashCd = Math.max(0, p.dashCd - dt);
    p.dash = Math.max(0, p.dash - dt);
    p.bob += dt * G.player.bobSpeed;
  }

  // 按方向移动角色（dx,dy 未归一化），限制在世界边界内
  function movePlayer(state, dx, dy, dt) {
    const p = state.player, W = G.world, B = G.player.bounds;
    const len = Math.hypot(dx, dy);
    if (len <= 0) return;
    dx /= len; dy /= len; p.facing = dx < -.05 ? -1 : dx > .05 ? 1 : p.facing;
    const speed = R.moveSpeed(p);
    p.x = clamp(p.x + dx * speed * dt, B.minX, W.w - B.insetRight);
    p.y = clamp(p.y + dy * speed * dt, B.minY, W.h - B.insetBottom);
  }

  // 吸附：范围内团子获得朝向角色的拉力，接触且有容量时收取。onCollect(result) 用于表现层
  function updateMotes(state, dt, rng = Math.random, onCollect) {
    const p = state.player, S = G.suction;
    for (let i = state.motes.length - 1; i >= 0; i--) {
      const m = state.motes[i]; m.phase += dt * G.mote.phaseSpeed;
      const d = Math.hypot(m.x - p.x, m.y - p.y);
      if (d < p.suction) {
        const pull = (S.pullBase + (p.suction - d) * S.pullPerDistance) * p.pullPower;
        m.vx += (p.x - m.x) / Math.max(1, d) * pull * dt;
        m.vy += (p.y - m.y) / Math.max(1, d) * pull * dt;
      }
      m.vx *= Math.pow(S.damping, dt); m.vy *= Math.pow(S.damping, dt);
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (d < p.r + m.size + S.contactPadding && R.hasRoom(p)) {
        const res = R.collect(state, i, rng);
        if (onCollect) onCollect(res);
      }
    }
  }

  // 背包队列：每只团子跟随前一只，间距随等级变大
  function updateCargo(state, dt) {
    const cargo = state.player.cargo, p = state.player, F = G.cargoFollow;
    for (let i = 0; i < cargo.length; i++) {
      const c = cargo[i], lead = i === 0 ? p : cargo[i - 1];
      const dx = lead.x - c.x, dy = lead.y - c.y, d = Math.max(.1, Math.hypot(dx, dy));
      const gap = R.levelRow(c.level).followGap;
      if (d > gap) {
        const pull = (d - gap) * F.pullFactor;
        c.vx += dx / d * pull * dt; c.vy += dy / d * pull * dt;
      }
      c.vx *= Math.pow(F.damping, dt); c.vy *= Math.pow(F.damping, dt);
      c.x += c.vx * dt; c.y += c.vy * dt; c.wobble += dt * 5;
    }
  }

  function updateParticles(state, dt) {
    state.particles.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 55 * dt; p.vx *= Math.pow(.2, dt); });
    state.particles = state.particles.filter(p => p.life > 0);
    state.texts.forEach(t => { t.life -= dt; t.y -= 34 * dt; });
    state.texts = state.texts.filter(t => t.life > 0);
  }

  function updateCamera(state, dt) {
    const p = state.player, W = G.world, V = G.view, k = 1 - Math.pow(G.camera.smoothBase, dt);
    state.camera.x = lerp(state.camera.x, clamp(p.x - V.w / 2, 0, W.w - V.w), k);
    state.camera.y = lerp(state.camera.y, clamp(p.y - V.h / 2, 0, W.h - V.h), k);
  }

  function updateCombo(state, dt) {
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer <= 0) state.combo = 0;
  }

  root.TuanziWorld = { createState, makeDecorations, tickTimers, movePlayer, updateMotes, updateCargo, updateParticles, updateCamera, updateCombo, clamp, lerp };
})(window);
