/* 规则核心测试：node tests/rules.test.cjs
   重点验证“预览即结算”——行动预览与实际结算是同一套规则、同一个结果。 */
'use strict';
const { loadScripts, makeAssert } = require('./helpers/load.cjs');

const A = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/rules.js']);
const { ExamEngine, buildExamConfig, makeOrder, rounded } = w.KaoyanRules;
const C = buildExamConfig(w.GAME_CONFIG);
const J = x => JSON.stringify(x);
const f = Math.fround;
const ids = C.actions.map(a => a.id);
const engineWith = (patch = {}, bg = 0, goal = 0, seed = C.seed) => {
  const s = ExamEngine.newGame(C, bg, goal, seed);
  Object.assign(s, patch);
  return new ExamEngine(C, s);
};
// 测试用的确定性随机数（与游戏内 LCG 相同参数）
const lcg = seed => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
const pick = (rng, list) => list[Math.floor(rng() * list.length)];

// ---------- 1. 学习效率公式 ----------
{
  const e = C.efficiency;
  const expect = (energy, stress) => f(Math.min(1, f(f(e.base) + f(f(e.energySlope) * f(energy)))) * f(1 - f(Math.max(0, f(f(stress) - e.stressThreshold)) * f(e.stressSlope))));
  const eng = engineWith();
  for (let energy = 0; energy <= 100; energy += 5)
    for (let stress = 0; stress <= 100; stress += 5) A.strictEqual(eng.efficiency({ energy, stress }), expect(energy, stress));
  A.strictEqual(eng.efficiency({ energy: 60, stress: 35 }), 1, '精力 60 / 压力 35 恰好满效率');
  A.strictEqual(eng.efficiency({ energy: 100, stress: 0 }), 1);
  A.ok(eng.efficiency({ energy: 59, stress: 35 }) < 1 && eng.efficiency({ energy: 60, stress: 36 }) < 1);
  A.strictEqual(rounded(eng.efficiency({ energy: 0, stress: 100 }) * 100), 37.1, '最差状态效率 ≈ 0.55 × 0.675');
}

// ---------- 2. 单步结算公式 ----------
{
  // 开局（精力75 压力20 → 效率1）：数学自习 +10，精力 61，压力 29
  const eng = engineWith({}, 0);
  const p = eng.preview(['study2', 'rest', 'rest']);
  A.ok(p.valid);
  A.strictEqual(p.steps[0].gain, 10); A.strictEqual(p.steps[0].efficiency, 1);
  A.strictEqual(p.steps[0].after.energy, 61); A.strictEqual(p.steps[0].after.stress, 29);
  A.strictEqual(p.steps[0].after.scores[2], 60);
  // 周末：生活费 -60、精力 +12、压力 -5
  A.strictEqual(p.after.money, C.initialMoney - C.weeklyExpense);
  A.strictEqual(p.after.energy, 100, '61+34+34+12 被 clamp 到 100');
  A.strictEqual(p.after.stress, 0, '29-18-18-5 被 clamp 到 0');
  // 低效率下涨分四舍五入到一位小数
  const tired = engineWith({ energy: 20, stress: 80 });
  const t = tired.preview(['sprint2', 'rest', 'rest']);
  const eff = tired.efficiency();
  A.strictEqual(t.steps[0].gain, rounded(f(f(14.5) * eff)));
  A.strictEqual(t.steps[0].gain, 7.9, '14.5 × 0.7 × 0.775 = 7.87 → 7.9');
}

// ---------- 3. 预览即结算：开局全部 11^3 种排法 × 3 种起点 ----------
let parityCount = 0;
for (let bg = 0; bg < C.backgrounds.length; bg++) {
  for (const a of ids) for (const b of ids) for (const c of ids) {
    const eng = engineWith({}, bg, 1);
    const stateBefore = J(eng.state);
    const p = eng.preview([a, b, c]);
    A.strictEqual(J(eng.state), stateBefore, '预览不得改动状态');
    const r = eng.commit([a, b, c]);
    A.strictEqual(r.ok, p.valid, '预览能否执行 == 实际能否执行');
    if (p.valid) {
      const pa = p.after, s = eng.state;
      A.strictEqual(J([s.scores, s.energy, s.stress, s.money]), J([pa.scores, pa.energy, pa.stress, pa.money]), '预览结果 != 实际结算');
      A.strictEqual(J(r.steps), J(p.steps));
    }
    parityCount++;
  }
}

// ---------- 4. 预览即结算 + 固定种子确定性：整局随机计划 ----------
function playGame(seed, bg, goal, planSeed, check) {
  const eng = new ExamEngine(C, ExamEngine.newGame(C, bg, goal, seed));
  const rng = lcg(planSeed);
  let guard = 0;
  while (!eng.state.finished && guard++ < 100) {
    if (eng.pendingEvent()) {
      const opts = [0, 1].filter(i => eng.canChoose(i));
      eng.chooseEvent(pick(rng, opts));
      continue;
    }
    let plan = [pick(rng, ids), pick(rng, ids), pick(rng, ids)];
    let p = eng.preview(plan);
    if (!p.valid) { plan = ['job', 'study0', 'rest']; p = eng.preview(plan); }
    const r = eng.commit(plan);
    if (check) {
      check.ok(r.ok && p.valid);
      check.strictEqual(J(p.steps), J(r.steps));
      const s = eng.state.eventIndex >= 0 || eng.state.finished ? eng.state : r.after;
      check.strictEqual(J([s.scores, s.energy, s.stress, s.money]), J([p.after.scores, p.after.energy, p.after.stress, p.after.money]));
    }
  }
  return eng;
}
const GAMES = 60;
const finals = [];
for (let g = 0; g < GAMES; g++) {
  const eng = playGame(1000 + g, g % 3, (g >> 1) % 3, 77 + g, A);
  A.ok(eng.state.finished); A.strictEqual(eng.state.week, C.weeks + 1);
  A.strictEqual(eng.state.journal.filter(x => x.type === 'week').length, C.weeks);
  const evs = eng.state.journal.filter(x => x.type === 'event');
  A.strictEqual(evs.length, C.weeks / C.eventEveryWeeks, '每局 6 个事件');
  A.strictEqual(new Set(evs.map(x => x.eventIndex)).size, evs.length, '事件不重复');
  A.ok(evs.every(x => x.week % C.eventEveryWeeks === 0), '事件只在偶数周出现');
  A.ok(ExamEngine.validateState(C, eng.state).valid, '终局存档可通过校验');
  finals.push(J(eng.state));
}
// 同种子、同计划 → 完全相同的终局（包括日记）
for (let g = 0; g < 10; g++) A.strictEqual(J(playGame(1000 + g, g % 3, (g >> 1) % 3, 77 + g).state), finals[g]);
// 事件顺序：确定、是排列、不同种子会不同
A.strictEqual(J(makeOrder(8, 2027)), J(makeOrder(8, 2027)));
A.strictEqual(J(makeOrder(8, 2027).slice().sort()), J([0, 1, 2, 3, 4, 5, 6, 7]));
A.ok(new Set([1, 2, 3, 4, 5].map(s => J(makeOrder(8, s)))).size > 1);

// ---------- 5. 资源边界 clamp ----------
{
  const full = engineWith({ energy: 100, stress: 0 });
  const p = full.preview(['rest', 'walk', 'rest']);
  A.ok(p.steps.every(s => s.after.energy === 100 && s.after.stress === 0), '精力不超过 100、压力不低于 0');
  const low = engineWith({ energy: 5, stress: 95 });
  const q = low.preview(['sprint0', 'sprint1', 'sprint2']);
  A.strictEqual(q.steps[0].after.energy, 0); A.strictEqual(q.steps[0].after.stress, 100);
  A.ok(q.steps.every(s => s.after.energy >= 0 && s.after.stress <= 100));
  // 科目满分封顶，实际涨分按封顶后的差值记录
  const capped = engineWith({ scores: [99, 35, 148, 55] }, 0);
  const r = capped.preview(['study0', 'study2', 'study2']);
  A.strictEqual(r.after.scores[0], 100); A.strictEqual(r.steps[0].gain, 1);
  A.strictEqual(r.after.scores[2], 150); A.strictEqual(r.steps[2].gain, 0);
  // 事件也会 clamp
  const ev = engineWith({ week: 2, energy: 98, stress: 3, eventIndex: makeOrder(8, C.seed)[0] });
  const e = ev.pendingEvent(), best = e.options.findIndex(o => o.energy > 0 || o.stress < 0);
  if (best >= 0) { ev.chooseEvent(best); A.ok(ev.state.energy <= 100 && ev.state.stress >= 0); }
  else A.ok(true);
}

// ---------- 6. 预算 ----------
{
  const poor = engineWith({ money: 10 });
  const p = poor.preview(['sprint0', 'rest', 'rest']);
  A.ok(!p.valid); A.ok(p.error.includes('第 1 时段的预算不足'));
  A.strictEqual(poor.commit(['sprint0', 'rest', 'rest']).ok, false, '预览不通过则不能结算');
  A.strictEqual(poor.state.week, 1);
  const q = poor.preview(['job', 'sprint0', 'rest']);
  A.ok(q.valid, '兼职收入可支付同周后面的冲刺');
  A.strictEqual(q.after.money, 10 + 200 - 25 - C.weeklyExpense);
  const broke = engineWith({ money: 20 });
  const b = broke.commit(['study0', 'rest', 'walk']);
  A.ok(b.ok); A.strictEqual(broke.state.money, -40, '生活费可欠款');
  A.ok(broke.state.logs.some(x => x.includes('欠款 ¥40')));
  // 付费事件选项在钱不够时不可选
  const lampIdx = C.events.findIndex(x => x.options.some(o => o.money <= -100));
  let seed = C.seed; while (makeOrder(8, seed).indexOf(lampIdx) >= C.weeks / C.eventEveryWeeks) seed++;
  const order = makeOrder(8, seed);
  const st = ExamEngine.newGame(C, 0, 0, seed); st.week = 2 * (order.indexOf(lampIdx) + 1); st.eventIndex = lampIdx; st.money = 50;
  const lamp = new ExamEngine(C, st);
  const paid = lamp.pendingEvent().options.findIndex(o => o.money < 0);
  A.strictEqual(lamp.canChoose(paid), false); A.strictEqual(lamp.chooseEvent(paid).ok, false);
  A.strictEqual(lamp.canChoose(1 - paid), true);
}

// ---------- 7. 周数推进与事件节奏 ----------
{
  const eng = engineWith();
  A.ok(eng.commit(['study0', 'study1', 'rest']).ok);
  A.strictEqual(eng.state.week, 2); A.strictEqual(eng.state.eventIndex, -1, '奇数周结算后直接进入下一周');
  A.ok(eng.commit(['study2', 'study3', 'rest']).ok);
  A.strictEqual(eng.state.week, 2, '偶数周结算后先停在事件');
  A.strictEqual(eng.state.eventIndex, eng.state.eventOrder[0]);
  A.strictEqual(eng.preview(['rest', 'rest', 'rest']).error, '请先处理本周生活事件。');
  A.strictEqual(eng.commit(['rest', 'rest', 'rest']).ok, false);
  A.ok(eng.chooseEvent(0).ok);
  A.strictEqual(eng.state.week, 3); A.strictEqual(eng.state.eventIndex, -1);
  A.strictEqual(eng.preview(['rest', 'rest']).error, '请安排完整的三个时段。');
  A.strictEqual(eng.preview(['rest', 'nope', 'rest']).error, '第 2 时段尚未安排。');
  A.strictEqual(J(eng.state.lastPlan), J(['study2', 'study3', 'rest']));
}

// ---------- 8. 结局判定 ----------
{
  const done = (scores, goal) => engineWith({ week: C.weeks + 1, finished: true, scores }, 0, goal);
  A.ok(done([60, 60, 100, 100], 0).isAdmitted(), '总分 320 且四科过线 → 录取');
  A.ok(!done([39, 70, 110, 110], 0).isAdmitted(), '总分够但政治未过单科线');
  A.ok(!done([40, 40, 60, 60], 0).isAdmitted(), '单科都过线但总分 200 不够');
  A.ok(done([60, 60, 140, 140], 2).isAdmitted(), '海城研究院 400 线');
  A.ok(!done([59, 61, 140, 140], 2).isAdmitted());
  A.ok(!engineWith({ scores: [100, 100, 150, 150] }).isAdmitted(), '未考完不判定录取');
  A.strictEqual(done([60, 60, 100, 100], 0).preview(['rest', 'rest', 'rest']).error, '本轮备考已经结束。');
  // 最后一周结算后进入结局
  const last = engineWith({ week: 11 });
  last.commit(['rest', 'rest', 'rest']); A.strictEqual(last.state.finished, false);
  last.chooseEvent(0); last.commit(['rest', 'rest', 'rest']);
  A.ok(last.pendingEvent(), '第 12 周仍有事件'); last.chooseEvent(0);
  A.ok(last.state.finished); A.ok(last.state.logs.at(-1).startsWith('考场落笔'));
}

// ---------- 9. 存档校验 ----------
{
  const ok = ExamEngine.newGame(C, 1, 2, 42);
  A.ok(ExamEngine.validateState(C, ok).valid);
  const bad = patch => !ExamEngine.validateState(C, Object.assign(JSON.parse(J(ok)), patch)).valid;
  A.ok(bad({ energy: 101 })); A.ok(bad({ stress: -1 })); A.ok(bad({ scores: [0, 0, 151, 0] }));
  A.ok(bad({ finished: true })); A.ok(bad({ eventOrder: [0, 1, 2, 3, 4, 5, 6, 7] }));
  A.ok(bad({ eventIndex: 0 }), '奇数周不能挂事件'); A.ok(bad({ version: 2 })); A.ok(bad({ lastPlan: ['fly', 'rest', 'rest'] }));
  A.throws(() => ExamEngine.newGame(C, 9, 0)); A.throws(() => new ExamEngine(C, { version: 1 }));
}

console.log('预览==结算 穷举排法 ' + parityCount + ' 组，整局随机 ' + GAMES + ' 局');
console.log(A.count() + ' assertions passed');
