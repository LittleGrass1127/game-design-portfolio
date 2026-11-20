/* 动作层测试：合同远征（波次、自动攻击、掉落、耐久下限）与夜航赛车（吸收成长、夜雾走廊、档位），
   固定种子与固定操作，与原单文件动作模拟逐帧对照。运行：node tests/action.test.cjs */
'use strict';
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { loadOriginal } = require('./helpers/original.cjs');

const assert = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/action-sim.js']);
const CFG = w.GAME_CONFIG, Sim = w.SunD20ActionSim;
const O = loadOriginal(), OSim = O.SunD20ActionSim;
const plain = v => JSON.parse(JSON.stringify(v));
const deq = (a, b, msg) => assert.deepStrictEqual(plain(a), plain(b), msg);
const build = (cards = {}, rooms = {}) => ({ cards: { rhetoric: 0, insight: 0, nerve: 0, craft: 0, ...cards }, rooms: { command: 0, workshop: 0, infirmary: 0, ...rooms } });

// ---------- 1. 构筑公式（build-stats.json） ----------
{
  const s0 = Sim.buildStatsFor(build());
  assert.strictEqual(s0.moveSpeed, 174); assert.strictEqual(s0.damage, 18); assert.strictEqual(s0.attackRange, 235);
  assert.strictEqual(s0.attackTargets, 1); assert.strictEqual(s0.maxHealth, 100); assert.strictEqual(s0.stormResistance, 1);
  const s1 = Sim.buildStatsFor(build({ rhetoric: 5, insight: 2, nerve: 3, craft: 2 }, { command: 1, workshop: 1, infirmary: 1 }));
  assert.strictEqual(s1.attackTargets, 4, '辞令扩散最多 4 目标');
  assert.strictEqual(s1.spreadRadius, 64 + 5 * 4);
  assert.strictEqual(s1.pickupRange, 34 + 2 * 8);
  assert.ok(Math.abs(s1.moveSpeed - 174 * 1.105) < 1e-9, '胆识每层移速 +3.5%');
  assert.ok(Math.abs(s1.attackInterval - 0.52 / 1.16) < 1e-12, '技术每层射速 +8%');
  assert.strictEqual(s1.damage, 22.5, '工坊伤害 +25%');
  assert.strictEqual(s1.maxHealth, 125); assert.strictEqual(s1.repair, 0.6);
  assert.ok(Math.abs(s1.stormResistance - 1 / 1.35) < 1e-12, '医务室风暴耗能 ÷(1+0.35)');
  // 与单文件版同一组构筑结果逐项相等
  for (const b of [build(), build({ rhetoric: 3, craft: 4 }, { workshop: 2 }), build({ insight: 6, nerve: 6 }, { command: 1, infirmary: 2 })]) {
    deq(new Sim({ build: b }).buildStats(), new OSim({ build: b }).buildStats(), '构筑属性与单文件版一致');
  }
  assert.strictEqual(new Sim({}).syncBuild(build({ rhetoric: 13 })).ok, false, '卡组超过 12 层被拒绝');
  assert.throws(() => new Sim({ build: build({}, { command: 4 }) }), '营地超过 3 级被拒绝');
}

// ---------- 2. 夜雾走廊 ----------
{
  const c0 = Sim.corridorFor({ time: 2, seed: 0, act: 1 });
  assert.strictEqual(c0.active, false); assert.strictEqual(c0.remaining, 2);
  for (const t of [4, 9.5, 11, 18.2, 40]) for (const seed of [0, 1, 99]) for (const act of [1, 2, 3]) {
    const st = { time: t, seed, act, player: { x: 400 }, build: build({}, { command: 2 }) };
    deq(Sim.corridorFor(st), OSim.corridorFor(st), '走廊与单文件版一致 t=' + t);
  }
  assert.strictEqual(Sim.corridorFor({ time: 5, seed: 0, act: 1, build: build({}, { command: 2 }) }).halfWidth, 96 + 24, '指挥室每层半宽 +12');
}

// ---------- 3. 档位判定 ----------
for (const [absorbed, combo, tier] of [[20, 8, 'gold'], [19, 8, 'silver'], [20, 7, 'silver'], [9, 0, 'silver'], [3, 5, 'silver'], [8, 4, 'bronze'], [0, 0, 'bronze']]) {
  assert.strictEqual(Sim.tierFor(absorbed, combo), tier, absorbed + '/' + combo + ' -> ' + tier);
}

// ---------- 4. 合同远征：站桩自动攻击，四幕 × 2 构筑，与单文件版逐帧对照 ----------
const exploreStats = [];
for (const act of [1, 2, 3, 4]) for (const b of [build(), build({ rhetoric: 3, craft: 3, insight: 2 }, { command: 1, workshop: 1, infirmary: 1 })]) {
  const seed = 1000 + act;
  const mine = new Sim({ mode: 'explore', act, seed, build: b }), theirs = new OSim({ mode: 'explore', act, seed, build: b });
  let minHealth = Infinity, frames = 0;
  // 先站桩 40 秒让三波无人机全部来袭，再朝当前合同点寻路
  for (let i = 0; i < 800; i++) {
    const input = i < 600 ? {} : { target: mine.state.objectives[0] };
    mine.step(0.05, input); theirs.step(0.05, i < 600 ? {} : { target: theirs.state.objectives[0] });
    minHealth = Math.min(minHealth, mine.state.health); frames++;
    if (i % 100 === 99) deq(mine.snapshot(), theirs.snapshot(), '远征快照与单文件版一致 act=' + act + ' f=' + i);
  }
  const s = mine.state, A = CFG.combatActs.find(r => r.act === act);
  assert.strictEqual(s.enemiesSpawned, CFG.combat.waves * A.enemiesPerWave, '三波共 ' + 3 * A.enemiesPerWave + ' 架');
  assert.ok(minHealth >= 1, '耐久最低保留 1');
  assert.ok(Sim.validate(mine.snapshot()).valid, '远征快照可通过存档校验');
  exploreStats.push({ act, cleared: s.combatCleared, kills: s.kills, scrap: s.scrap, minHealth: Math.round(minHealth) });
}
assert.ok(exploreStats.every(r => r.cleared), '站桩 40 秒内四幕均清场（含无构筑）');

// ---------- 5. 合同节点：顺序解锁与奖励 ----------
{
  const sim = new Sim({ mode: 'explore', act: 1, seed: 3 });
  assert.strictEqual(sim.canInteract(), false, '离目标太远不能互动');
  for (let i = 0; i < 3; i++) {
    const g = sim.state.objectives[i];
    assert.strictEqual(g.locked, false, '当前节点已解锁');
    if (i < 2) assert.strictEqual(sim.state.objectives[i + 1].locked, true, '后一节点仍锁定');
    sim.state.player.x = g.x; sim.state.player.y = g.y + 1;
    assert.ok(sim.interact().ok); assert.ok(sim.completeObjective().ok);
  }
  assert.strictEqual(sim.state.actComplete, true);
  deq(sim.state.rewardTotals, { capital: 1, reputation: 1, leverage: 1, pressure: 0 }, '三节点奖励 资本/筹码/声望 各 +1');
  assert.ok(sim.setAct(2).ok, '完成后可进入下一幕');
}

// ---------- 6. 夜航赛车：3 段 × 3 模组，固定追车策略，与单文件版逐帧对照 ----------
function driver(sim) {
  const s = sim.state, p = s.player;
  const ahead = s.traffic.filter(c => !c.absorbed && c.y < p.y + 20 && c.y > p.y - 260).sort((a, b) => Math.abs(a.x - p.x) + (p.y - a.y) * 0.3 - Math.abs(b.x - p.x) - (p.y - b.y) * 0.3)[0];
  const x = ahead ? Math.max(-1, Math.min(1, (ahead.x - p.x) / 40)) : 0;
  return { x, y: p.y > 300 ? -0.4 : 0, boost: s.energy > 35 };
}
const raceStats = [];
for (const leg of [1, 2, 3]) for (const module of ['turbo', 'magnet', 'reactor']) {
  const seed = 2000 + leg * 10, b = build({ insight: 2, nerve: 2, craft: 2, rhetoric: 1 }, { command: 1 });
  const mine = new Sim({ mode: 'race', act: leg, seed, module, build: b }), theirs = new OSim({ mode: 'race', act: leg, seed, module, build: b });
  let i = 0;
  while (mine.state.phase === 'playing' && i < 4000) {
    mine.step(0.05, driver(mine)); theirs.step(0.05, driver(theirs)); i++;
    if (i % 150 === 0) deq(mine.snapshot(), theirs.snapshot(), '赛车快照与单文件版一致 leg=' + leg + ' ' + module);
  }
  deq(mine.snapshot(), theirs.snapshot(), '赛车终局与单文件版一致 leg=' + leg + ' ' + module);
  const r = mine.state.result;
  assert.ok(r && r.finished, '在时限内跑完赛段 leg=' + leg + ' ' + module);
  assert.strictEqual(mine.state.length, CFG.race.track.lengthBase + leg * CFG.race.track.lengthPerAct, '赛段长度');
  assert.strictEqual(mine.state.growth, Math.min(8, r.absorbed), '前 8 次吸收计入成长');
  assert.strictEqual(r.tier, Sim.tierFor(r.absorbed, r.maxCombo));
  assert.ok(Sim.validate(mine.snapshot()).valid, '赛车快照可通过存档校验');
  raceStats.push({ leg, module, time: +r.time.toFixed(2), absorbed: r.absorbed, maxCombo: r.maxCombo, tier: r.tier, safety: +(r.safety * 100).toFixed(1) });
}
// 固定种子确定性
{
  const run = () => { const s = new Sim({ mode: 'race', act: 2, seed: 77, module: 'magnet' }); for (let i = 0; i < 400; i++) s.step(0.05, driver(s)); return s.serialize(); };
  assert.strictEqual(run(), run(), '同种子同输入 -> 同一结果');
}

console.log('远征（站桩 40s 后寻路）：', JSON.stringify(exploreStats));
console.log('赛车（固定追车策略）：');
for (const r of raceStats) console.log('  ', JSON.stringify(r));
console.log(assert.count() + ' assertions passed');
