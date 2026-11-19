/* 团子清洁队 · 纯规则层：价值、收取、合成、交付、升级、结算。无 DOM，挂到 window.TuanziRules。 */
(function (root) {
  'use strict';
  const C = root.GAME_CONFIG;
  const G = C.game;

  // 可复现随机数（测试用固定种子；浏览器默认 Math.random）
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = (rng, a, b) => a + rng() * (b - a);

  const LEVELS = {};
  C.dangoLevels.forEach(row => { LEVELS[row.level] = row; });

  // 团子等级价值：查等级表（表内数值 = (3^L − 1) / 2，由测试保证）
  function cargoValue(level) { return LEVELS[level].value; }
  function formulaValue(level) { return (Math.pow(3, level) - 1) / 2; }
  function levelRow(level) { return LEVELS[level]; }

  function hasRoom(player) { return player.cargo.length < player.capacity; }

  // 彩虹糖纸：每第 N 只收取的团子改成队尾颜色；背包为空保留原色
  function pickupType(player, moteType) {
    if (player.rainbowEvery && player.pickups % player.rainbowEvery === 0) {
      return player.cargo.length ? player.cargo[player.cargo.length - 1].type : moteType;
    }
    return moteType;
  }

  // 自动合成：从低级到高级、按颜色顺序检测，合成后从头重来，直到无可合成组合。返回合成事件列表。
  function autoMerge(state, rng = Math.random) {
    const p = state.player, cargo = p.cargo, needed = p.mergeNeed, events = [];
    let merged = true;
    while (merged) {
      merged = false;
      for (let level = 1; level < G.maxDangoLevel && !merged; level++) {
        for (let type = 0; type < C.colors.length && !merged; type++) {
          const ids = [];
          cargo.forEach((c, i) => { if (c.type === type && c.level === level) ids.push(i); });
          if (ids.length >= needed) {
            const chosen = ids.slice(-needed), anchor = cargo[chosen[chosen.length - 1]];
            for (let j = chosen.length - 1; j >= 0; j--) cargo.splice(chosen[j], 1);
            cargo.push({ x: anchor.x, y: anchor.y, vx: 0, vy: 0, type, level: level + 1, wobble: rand(rng, 0, 9) });
            if (p.mergeCoin) state.coins += p.mergeCoin;
            events.push({ x: anchor.x, y: anchor.y, type, fromLevel: level, level: level + 1, coin: p.mergeCoin });
            merged = true;
          }
        }
      }
    }
    return events;
  }

  // 从地面收取第 index 只团子：清理数 +1、进背包、触发合成
  function collect(state, index, rng = Math.random) {
    const p = state.player, mote = state.motes[index];
    state.motes.splice(index, 1);
    state.patches[mote.patch].remain = Math.max(0, state.patches[mote.patch].remain - 1);
    state.cleaned++; p.pickups++;
    const type = pickupType(p, mote.type);
    p.cargo.push({ x: p.x, y: p.y, vx: 0, vy: 0, type, level: 1, wobble: rand(rng, 0, 9) });
    const merges = autoMerge(state, rng);
    return { mote, type, merges };
  }

  function comboMultiplier(combo) { return 1 + Math.min(G.combo.maxLayer, combo) * G.combo.step; }

  // 本次收入 = Round[Σ价值(含高等级倍率) × 交付倍率 × (1 + Min(5, 连送) × 12%)]
  function deliveryValue(cargo, player, combo) {
    let value = 0;
    cargo.forEach(c => { value += cargoValue(c.level) * (c.level >= G.highLevelBonusMinLevel ? player.highLevelBonus : 1); });
    return Math.round(value * player.value * comboMultiplier(combo));
  }

  function inDeliveryRange(player, cart) { return Math.hypot(player.x - cart.x, player.y - cart.y) < cart.deliveryRadius; }

  // 交付：加金币、连送 +1、重置连送计时、清空背包。返回 null 表示背包为空
  function settle(state) {
    const p = state.player;
    if (!p.cargo.length) return null;
    const items = p.cargo.slice();
    const value = deliveryValue(items, p, state.combo);
    state.coins += value; state.combo++; state.comboTimer = p.comboWindow;
    p.cargo.length = 0;
    return { value, items };
  }

  // ---- 升级 ----
  const UPGRADES = C.upgrades;
  const EFFECTS = {};
  C.upgradeEffects.forEach(e => { (EFFECTS[e.upgradeId] = EFFECTS[e.upgradeId] || []).push(e); });

  function upgradeById(id) { return UPGRADES.find(u => u.id === id); }

  function availableUpgrades(taken) {
    return UPGRADES.filter(u => !(u.unique && taken.includes(u.id)) && u.weight > 0);
  }

  // 按权重不放回抽取 count 项（权重全为 1 时即等概率随机四选一）
  function drawUpgrades(taken, rng = Math.random, count = G.upgradeChoiceCount) {
    const pool = availableUpgrades(taken).slice(), out = [];
    while (out.length < count && pool.length) {
      const total = pool.reduce((s, u) => s + u.weight, 0);
      let r = rng() * total, i = 0;
      while (i < pool.length - 1 && r >= pool[i].weight) { r -= pool[i].weight; i++; }
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  // 效果目标路径相对 state：player.xxx / cart.xxx / time
  function applyEffect(state, e) {
    const path = e.target.split('.'), key = path.pop();
    const obj = path.reduce((o, k) => o[k], state);
    if (e.op === 'mul') obj[key] *= e.value;
    else if (e.op === 'add') obj[key] += e.value;
    else if (e.op === 'set') obj[key] = e.value;
    else throw new Error('未知升级操作 ' + e.op);
  }

  function applyUpgrade(state, id) {
    (EFFECTS[id] || []).forEach(e => applyEffect(state, e));
    state.takenUpgrades.push(id);
  }

  function shouldOfferUpgrade(state) {
    return state.cleaned >= state.nextUpgrade && state.upgradeCount < G.upgradeThresholds.length;
  }

  // 进入升级态：推进阈值并抽取候选
  function beginUpgrade(state, rng = Math.random) {
    state.mode = 'upgrade'; state.upgradeCount++;
    state.nextUpgrade = G.upgradeThresholds[state.upgradeCount] || G.upgradeNoneLeft;
    return drawUpgrades(state.takenUpgrades, rng);
  }

  // ---- 冲刺 / 移动 ----
  function tryDash(state) {
    if (!state || state.mode !== 'play') return false;
    const p = state.player;
    if (p.dashCd > 0) return false;
    p.dash = G.dash.duration; p.dashCd = p.dashCooldown;
    return true;
  }

  function moveSpeed(player) {
    return player.speed * (player.cargo.length === 0 ? player.emptyBoost : 1) * (player.dash > 0 ? G.dash.speedMultiplier : 1);
  }

  // ---- 结算 ----
  function cleanPercent(state) { return Math.round(state.cleaned / state.total * 100); }
  function shouldEnd(state) { return state.time <= 0 || state.cleaned >= state.total; }
  function endTier(clean) { return G.endTiers.find(t => clean >= t.minClean); }

  // 结束本局：先交付背包，提前清空才有时间奖励。只执行一次
  function finish(state) {
    if (state.mode === 'end') return null;
    state.mode = 'end';
    const settled = state.player.cargo.length ? settle(state) : null;
    const clean = cleanPercent(state);
    const clearedEarly = state.cleaned >= state.total && state.time > 0;
    const timeBonus = clearedEarly ? Math.ceil(state.time) * G.timeBonusPerSecond : 0;
    state.coins += timeBonus;
    return { settled, clean, clearedEarly, timeBonus, coins: state.coins, tier: endTier(clean) };
  }

  function formatClock(time) {
    const seconds = Math.ceil(time);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }

  root.TuanziRules = {
    makeRng, rand, cargoValue, formulaValue, levelRow, hasRoom, pickupType, autoMerge, collect,
    comboMultiplier, deliveryValue, inDeliveryRange, settle,
    upgradeById, availableUpgrades, drawUpgrades, applyEffect, applyUpgrade, shouldOfferUpgrade, beginUpgrade,
    tryDash, moveSpeed, cleanPercent, shouldEnd, endTier, finish, formatClock
  };
})(window);
