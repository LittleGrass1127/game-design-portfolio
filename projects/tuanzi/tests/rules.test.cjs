/* 团子清洁队 · 规则与配置测试：node tests/rules.test.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const exporter = require('../tools/export-config.cjs');

const ROOT = path.resolve(__dirname, '..');
const w = loadScripts(['src/js/config.generated.js', 'src/js/rules.js', 'src/js/world.js']);
const C = w.GAME_CONFIG, G = C.game, R = w.TuanziRules, W = w.TuanziWorld;
const a = makeAssert();
// vm 沙箱里的对象与 Node 主环境原型不同，深比较前先转成普通 JSON
const plain = v => JSON.parse(JSON.stringify(v));
const deepEq = a.deepStrictEqual;
a.deepStrictEqual = (x, y, msg) => deepEq(plain(x), plain(y), msg);

// 造一只背包团子
const dango = (type, level) => ({ x: 0, y: 0, vx: 0, vy: 0, type, level, wobble: 0 });
const fresh = (seed = 1) => { const s = W.createState(R.makeRng(seed)); s.mode = 'play'; return s; };

// ---------- 配置导出一致性 ----------
{
  const out = exporter.render(exporter.loadConfig());
  a.strictEqual(fs.readFileSync(path.join(ROOT, 'src/js/config.generated.js'), 'utf8'), out, 'config.generated.js 需与 config/ 一致');
  a.deepStrictEqual(Object.keys(C).sort(), ['colors', 'dangoLevels', 'game', 'patches', 'upgradeEffects', 'upgrades']);
}

// ---------- 配置完整性 ----------
{
  for (const k of ['view', 'world', 'durationSec', 'upgradeThresholds', 'upgradeChoiceCount', 'maxDangoLevel', 'player', 'dash', 'mote', 'suction', 'cart', 'combo', 'endTiers', 'bestScoreKey']) a.ok(k in G, 'game.json 缺字段 ' + k);
  a.strictEqual(G.durationSec, 120);
  a.deepStrictEqual([G.world.w, G.world.h, G.view.w, G.view.h], [1880, 1160, 1280, 720]);
  // 地图：6 个污渍区 × 20 = 120 个团子，且都在世界内
  a.strictEqual(C.patches.length, 6);
  a.strictEqual(C.patches.reduce((s, p) => s + p.motes, 0), 120);
  C.patches.forEach(p => a.ok(p.x - p.r >= 0 && p.x + p.r <= G.world.w && p.y - p.r >= 0 && p.y + p.r <= G.world.h, '污渍区越界 ' + p.id));
  // 颜色
  a.strictEqual(C.colors.length, 3);
  a.strictEqual(new Set(C.colors.map(c => c.hex)).size, 3);
  C.colors.forEach((c, i) => { a.strictEqual(c.type, i); a.ok(/^#[0-9a-f]{6}$/i.test(c.hex)); });
  // 等级表：1..maxLevel 连续，价值 = (3^L−1)/2，尺寸/间距与原公式一致
  a.strictEqual(C.dangoLevels.length, G.maxDangoLevel);
  C.dangoLevels.forEach((row, i) => {
    const L = i + 1;
    a.strictEqual(row.level, L);
    a.strictEqual(row.value, (Math.pow(3, L) - 1) / 2);
    a.strictEqual(row.drawSize, 15 + Math.min(L, 4) * 6 + Math.max(0, L - 4) * 3);
    a.strictEqual(row.followGap, 38 + Math.min(L, 4) * 5 + Math.max(0, L - 4) * 2);
  });
  // 升级：14 项、ID 唯一、字段齐全、权重为正、每项至少一个效果
  a.strictEqual(C.upgrades.length, 14);
  a.strictEqual(new Set(C.upgrades.map(u => u.id)).size, 14);
  C.upgrades.forEach(u => {
    for (const k of ['id', 'icon', 'name', 'desc', 'category', 'weight', 'unique']) a.ok(u[k] !== null && u[k] !== undefined, `${u.id} 缺 ${k}`);
    a.ok(u.weight > 0);
    a.ok(C.upgradeEffects.some(e => e.upgradeId === u.id), u.id + ' 没有效果');
  });
  // 效果：引用存在、操作合法、目标字段在初始状态中存在且为数值
  const s = fresh();
  C.upgradeEffects.forEach(e => {
    a.ok(C.upgrades.some(u => u.id === e.upgradeId), '效果引用不存在的升级 ' + e.upgradeId);
    a.ok(['mul', 'add', 'set'].includes(e.op));
    const v = e.target.split('.').reduce((o, k) => o[k], s);
    a.strictEqual(typeof v, 'number', '目标字段不存在 ' + e.target);
  });
  // 升级阈值严格递增、小于总数；最多升级次数 × 候选数 ≤ 升级总数（保证每次都能凑满四选一）
  G.upgradeThresholds.forEach((t, i) => a.ok(t > (G.upgradeThresholds[i - 1] || 0) && t < 120));
  a.ok(G.upgradeThresholds.length - 1 + G.upgradeChoiceCount <= C.upgrades.length);
  // 结算档位从高到低，最后一档兜底 0
  a.strictEqual(G.endTiers[G.endTiers.length - 1].minClean, 0);
}

// ---------- 核心公式 ----------
{
  a.deepStrictEqual([1, 2, 3, 4, 5, 6, 7].map(R.cargoValue), [1, 4, 13, 40, 121, 364, 1093]);
  for (let L = 1; L <= 6; L++) a.ok(R.cargoValue(L + 1) > 3 * R.cargoValue(L), '三合后价值应略高于三只直接交付'); // 3v+1
  a.strictEqual(R.cargoValue(2) - 3 * R.cargoValue(1), 1);
  // 连送倍率：0→1.00、1→1.12、2→1.24、≥5 封顶 1.60
  [[0, 1], [1, 1.12], [2, 1.24], [5, 1.6], [9, 1.6]].forEach(([k, m]) => a.ok(Math.abs(R.comboMultiplier(k) - m) < 1e-9));
  a.strictEqual(R.formatClock(120), '2:00');
  a.strictEqual(R.formatClock(64.2), '1:05');
}

// ---------- 验收用例（策划案第十三节，可自动化部分） ----------
// 01 开始游戏：计时从 2:00 开始
{
  const s = W.createState(R.makeRng(3));
  a.strictEqual(s.mode, 'title');
  a.strictEqual(R.formatClock(s.time), '2:00');
  a.strictEqual(s.total, 120);
  a.strictEqual(s.motes.length, 120);
}
// 02 移动不超出地图；斜向归一化
{
  const s = fresh(); const p = s.player, B = G.player.bounds;
  W.movePlayer(s, -1, -1, 100);
  a.deepStrictEqual([p.x, p.y], [B.minX, B.minY]);
  W.movePlayer(s, 1, 1, 100);
  a.deepStrictEqual([p.x, p.y], [G.world.w - B.insetRight, G.world.h - B.insetBottom]);
  const s2 = fresh(); const x0 = s2.player.x, y0 = s2.player.y;
  W.movePlayer(s2, 1, 1, 0.1);
  a.ok(Math.abs(Math.hypot(s2.player.x - x0, s2.player.y - y0) - G.player.speed * 0.1) < 1e-9, '斜向速度应与直线一致');
}
// 03 容量 7：满载后不再收取
{
  const s = fresh(); const p = s.player;
  a.strictEqual(p.capacity, 7);
  p.cargo = [dango(0, 1), dango(0, 1), dango(1, 1), dango(1, 1), dango(2, 1), dango(2, 1), dango(0, 2)];
  a.strictEqual(R.hasRoom(p), false);
  s.motes = [{ x: p.x, y: p.y, vx: 0, vy: 0, type: 0, level: 1, size: 15, phase: 0, patch: 0 }];
  W.updateMotes(s, 1 / 60, R.makeRng(1));
  a.strictEqual(s.motes.length, 1, '满载时团子不进背包');
  a.strictEqual(s.cleaned, 0);
  p.cargo.pop();
  W.updateMotes(s, 1 / 60, R.makeRng(1));
  a.strictEqual(s.motes.length, 0, '有空位后接触即收取');
  a.strictEqual(s.cleaned, 1);
}
// 04 默认三合：三只同色同级 → 一只高一级
{
  const s = fresh(); s.player.cargo = [dango(1, 1), dango(1, 1), dango(1, 1), dango(0, 1)];
  const ev = R.autoMerge(s);
  a.strictEqual(ev.length, 1);
  a.strictEqual(s.player.cargo.length, 2);
  a.ok(s.player.cargo.some(c => c.type === 1 && c.level === 2));
}
// 05 连续合成：一次收取触发多层合成
{
  const s = fresh(); const p = s.player;
  p.cargo = [dango(0, 2), dango(0, 2), dango(0, 1), dango(0, 1)];
  s.motes = [{ x: 0, y: 0, vx: 0, vy: 0, type: 0, level: 1, size: 15, phase: 0, patch: 0 }];
  const res = R.collect(s, 0, R.makeRng(2));
  a.strictEqual(res.merges.length, 2);
  a.deepStrictEqual(p.cargo.map(c => [c.type, c.level]), [[0, 3]]);
}
// 06 最高等级 7：不生成 8 级
{
  const s = fresh(); s.player.cargo = [dango(2, 7), dango(2, 7), dango(2, 7)];
  a.strictEqual(R.autoMerge(s).length, 0);
  a.strictEqual(s.player.cargo.length, 3);
}
// 07 二合打包机：两只即合成
{
  const s = fresh(); R.applyUpgrade(s, 'packer');
  a.strictEqual(s.player.mergeNeed, 2);
  s.player.cargo = [dango(1, 1), dango(1, 1)];
  R.autoMerge(s);
  a.deepStrictEqual(s.player.cargo.map(c => c.level), [2]);
}
// 08 自动交付：背包清空、金币按公式增加
{
  const s = fresh(); const p = s.player;
  p.cargo = [dango(0, 1), dango(1, 2), dango(2, 3)];
  a.strictEqual(R.inDeliveryRange(p, s.cart), false, '出生点在交付圈外');
  p.x = s.cart.x; p.y = s.cart.y + 100;
  a.strictEqual(R.inDeliveryRange(p, s.cart), true);
  const r = R.settle(s);
  a.strictEqual(r.value, 1 + 4 + 13);
  a.strictEqual(s.coins, 18);
  a.strictEqual(p.cargo.length, 0);
  a.strictEqual(s.combo, 1);
  a.strictEqual(s.comboTimer, 8);
  a.strictEqual(R.settle(s), null, '空背包不交付');
}
// 09 连送：窗口内逐层增加，最高 1.60
{
  const s = fresh(); const got = [];
  for (let i = 0; i < 8; i++) { s.player.cargo = [dango(0, 3), dango(0, 3), dango(1, 3), dango(1, 3)]; got.push(R.settle(s).value); }
  a.deepStrictEqual(got, [52, 58, 64, 71, 77, 83, 83, 83]);
  got.forEach((v, i) => a.strictEqual(v, Math.round(52 * R.comboMultiplier(i))));
  a.strictEqual(got[7], Math.round(52 * 1.6));
  W.updateCombo(s, 8.01);
  a.strictEqual(s.combo, 0, '窗口过期后连送清零');
}
// 10 升级节点：五个阈值，每次四选一且已选项不重复
{
  const s = fresh(); const rng = R.makeRng(7);
  for (let k = 0; k < 5; k++) {
    s.cleaned = G.upgradeThresholds[k];
    a.ok(R.shouldOfferUpgrade(s));
    const pool = R.beginUpgrade(s, rng);
    a.strictEqual(s.mode, 'upgrade');
    a.strictEqual(pool.length, 4);
    a.strictEqual(new Set(pool.map(u => u.id)).size, 4);
    a.ok(pool.every(u => !s.takenUpgrades.includes(u.id)), '已选升级不应再出现');
    R.applyUpgrade(s, pool[0].id); s.mode = 'play';
  }
  s.cleaned = 119;
  a.strictEqual(R.shouldOfferUpgrade(s), false, '一局最多五次');
  a.strictEqual(new Set(s.takenUpgrades).size, 5);
}
// 11 超时结束：先结算背包，不获得时间奖励
{
  const s = fresh(); s.time = 0; s.cleaned = 60; s.player.cargo = [dango(0, 2)];
  a.ok(R.shouldEnd(s));
  const r = R.finish(s);
  a.strictEqual(r.settled.value, 4);
  a.strictEqual(r.timeBonus, 0);
  a.strictEqual(r.clean, 50);
  a.strictEqual(r.tier.stamp, '加油');
  a.strictEqual(R.finish(s), null, '结算只执行一次');
}
// 12 提前清空：立即结束并按剩余秒数加金币
{
  const s = fresh(); s.cleaned = 120; s.time = 30.2; s.coins = 100;
  a.ok(R.shouldEnd(s));
  const r = R.finish(s);
  a.strictEqual(r.timeBonus, 31);
  a.strictEqual(r.coins, 131);
  a.strictEqual(r.tier.stamp, '闪亮');
  const s2 = fresh(); s2.cleaned = 90; s2.time = 0;
  a.strictEqual(R.finish(s2).tier.stamp, '清爽');
}
// 13 重新开始：局内参数重置（最高分保存在 localStorage，由浏览器冒烟覆盖）
{
  const s = fresh(); ['magnet', 'basket', 'clock'].forEach(id => R.applyUpgrade(s, id)); s.coins = 999;
  const s2 = fresh();
  a.strictEqual(s2.coins, 0);
  a.strictEqual(s2.player.capacity, G.player.capacity);
  a.strictEqual(s2.player.suction, G.player.suction);
  a.deepStrictEqual(s2.takenUpgrades, []);
  a.strictEqual(s2.time, 120);
}

// ---------- 升级效果逐项 ----------
{
  const expect = {
    magnet: s => Math.abs(s.player.suction - 155 * 1.32) < 1e-9,
    skates: s => Math.abs(s.player.speed - 245 * 1.22) < 1e-9,
    basket: s => s.player.capacity === 11,
    sign: s => Math.abs(s.player.value - 1.3) < 1e-9,
    rainbow: s => s.player.rainbowEvery === 5,
    dash: s => s.player.dashCooldown === 2 && s.player.dashCd === 0,
    vacuum: s => Math.abs(s.player.pullPower - 1.55) < 1e-9,
    cart: s => s.cart.deliveryRadius === 177,
    receipt: s => s.player.comboWindow === 13,
    clock: s => s.time === 138,
    skewer: s => Math.abs(s.player.highLevelBonus - 1.4) < 1e-9,
    packer: s => s.player.mergeNeed === 2,
    sticker: s => s.player.mergeCoin === 3,
    sneakers: s => s.player.emptyBoost === 1.35
  };
  a.deepStrictEqual(Object.keys(expect).sort(), C.upgrades.map(u => u.id).sort());
  for (const id in expect) { const s = fresh(); s.player.dashCd = 3; R.applyUpgrade(s, id); a.ok(expect[id](s), '升级效果错误 ' + id); }
}
// 冲刺：基础冷却 4.2，汽水冲刺后 2 秒；冲刺时速度 ×2.15
{
  const s = fresh();
  a.ok(R.tryDash(s)); a.strictEqual(s.player.dashCd, 4.2); a.strictEqual(R.tryDash(s), false);
  a.ok(Math.abs(R.moveSpeed(s.player) - 245 * 2.15) < 1e-9);
  const s2 = fresh(); R.applyUpgrade(s2, 'dash'); R.tryDash(s2); a.strictEqual(s2.player.dashCd, 2);
  const s3 = fresh(); R.applyUpgrade(s3, 'sneakers');
  a.ok(Math.abs(R.moveSpeed(s3.player) - 245 * 1.35) < 1e-9, '空篮加速');
  s3.player.cargo.push(dango(0, 1));
  a.strictEqual(R.moveSpeed(s3.player), 245);
}
// 彩虹糖纸：第 5 只改为队尾颜色；空背包保留原色
{
  const s = fresh(); R.applyUpgrade(s, 'rainbow'); const p = s.player;
  p.pickups = 4; p.cargo = [dango(2, 1)];
  s.motes = [{ x: 0, y: 0, vx: 0, vy: 0, type: 0, level: 1, size: 15, phase: 0, patch: 0 }];
  a.strictEqual(R.collect(s, 0).type, 2);
  p.pickups = 9; p.cargo = [];
  s.motes = [{ x: 0, y: 0, vx: 0, vy: 0, type: 1, level: 1, size: 15, phase: 0, patch: 1 }];
  a.strictEqual(R.collect(s, 0).type, 1);
}
// 合成贴纸：按实际合成次数逐次发放；金色竹签只作用于 2 级以上
{
  const s = fresh(); R.applyUpgrade(s, 'sticker');
  s.player.cargo = [dango(0, 2), dango(0, 2), dango(0, 1), dango(0, 1), dango(0, 1)];
  R.autoMerge(s);
  a.strictEqual(s.coins, 6);
  const s2 = fresh(); R.applyUpgrade(s2, 'skewer');
  a.strictEqual(R.deliveryValue([dango(0, 1), dango(0, 2)], s2.player, 0), Math.round(1 + 4 * 1.4));
  const s3 = fresh(); R.applyUpgrade(s3, 'sign');
  a.strictEqual(R.deliveryValue([dango(0, 3)], s3.player, 2), Math.round(13 * 1.3 * 1.24));
}
// 抽取：权重为 0 的升级不出现；剩余不足 4 项时返回全部
{
  a.strictEqual(R.drawUpgrades(C.upgrades.slice(0, 12).map(u => u.id), R.makeRng(5)).length, 2);
  a.strictEqual(R.drawUpgrades(C.upgrades.map(u => u.id), R.makeRng(5)).length, 0);
}

// ---------- 固定种子确定性 + 整局模拟 ----------
function simulate(seed) {
  const rng = R.makeRng(seed), s = W.createState(rng); s.mode = 'play';
  const dt = 1 / 60; let frames = 0, ups = 0;
  while (s.mode !== 'end' && frames < 60 * 200) {
    frames++;
    if (s.mode === 'upgrade') { R.applyUpgrade(s, pickNext[0].id); s.mode = 'play'; ups++; }
    W.tickTimers(s, dt);
    const p = s.player; let tgt = s.cart;
    if (R.hasRoom(p) && s.motes.length) tgt = s.motes.reduce((b, m) => (Math.hypot(m.x - p.x, m.y - p.y) < Math.hypot(b.x - p.x, b.y - p.y) ? m : b));
    W.movePlayer(s, tgt.x - p.x, tgt.y - p.y, dt);
    W.updateMotes(s, dt, rng);
    W.updateCargo(s, dt);
    if (R.inDeliveryRange(p, s.cart) && p.cargo.length) R.settle(s);
    W.updateCombo(s, dt);
    if (R.shouldOfferUpgrade(s)) pickNext = R.beginUpgrade(s, rng);
    if (R.shouldEnd(s)) R.finish(s);
  }
  return { coins: s.coins, cleaned: s.cleaned, time: s.time, ups, taken: s.takenUpgrades.join(','), mode: s.mode };
}
let pickNext = null;
{
  a.deepStrictEqual(W.createState(R.makeRng(42)), W.createState(R.makeRng(42)));
  a.notStrictEqual(JSON.stringify(W.createState(R.makeRng(42)).motes), JSON.stringify(W.createState(R.makeRng(43)).motes));
  const r1 = simulate(42), r2 = simulate(42);
  a.deepStrictEqual(r1, r2);
  a.strictEqual(r1.mode, 'end');
  a.ok(r1.coins > 0);
  a.ok(r1.cleaned >= G.upgradeThresholds[0], '自动跑图至少触发第一次升级');
  a.strictEqual(r1.ups, G.upgradeThresholds.filter(t => t <= r1.cleaned).length);
  console.log('模拟(seed 42):', JSON.stringify(r1));
}

console.log(`${a.count()} assertions passed`);
