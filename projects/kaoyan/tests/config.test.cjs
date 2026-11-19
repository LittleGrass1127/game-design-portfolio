/* 配置表完整性 + 导出一致性：node tests/config.test.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { loadConfig, render } = require('../tools/export-config.cjs');

const ROOT = path.resolve(__dirname, '..');
const A = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/rules.js']);
const G = w.GAME_CONFIG;
const C = w.KaoyanRules.buildExamConfig(G);
const unique = list => new Set(list).size === list.length;

// 1. 导出文件与 config/ 一致（等价于 export-config --check）
A.strictEqual(fs.readFileSync(path.join(ROOT, 'src/js/config.generated.js'), 'utf8'), render(loadConfig()), 'config.generated.js 过期');
for (const key of ['examConfig', 'subjects', 'backgrounds', 'goals', 'actions', 'events', 'eventOptions', 'uiText'])
  A.ok(G[key], '缺少配置表 ' + key);

// 2. 基础参数
const base = G.examConfig;
for (const k of ['weeks', 'slots', 'seed', 'initialEnergy', 'initialStress', 'initialMoney', 'weeklyExpense', 'weeklyEnergy', 'weeklyStress', 'resourceMax', 'eventEveryWeeks'])
  A.ok(Number.isFinite(base[k]), '基础参数缺失 ' + k);
A.strictEqual(base.weeks, 12); A.strictEqual(base.slots, 3);
A.ok(base.initialEnergy >= 0 && base.initialEnergy <= base.resourceMax);
A.ok(base.initialStress >= 0 && base.initialStress <= base.resourceMax);
const e = base.efficiency;
A.ok(e.base > 0 && e.base < 1 && e.energySlope > 0 && e.stressSlope > 0 && e.stressThreshold >= 0);
// 满精力时精力系数应恰好封顶（规则说明“精力低于60时效率下降”依赖这一点）
A.ok(e.base + e.energySlope * base.resourceMax >= 1);

// 3. 科目
A.strictEqual(G.subjects.length, 4);
A.ok(unique(G.subjects.map(s => s.key)) && unique(G.subjects.map(s => s.index)));
A.strictEqual(G.subjects.map(s => s.key).join(), w.KaoyanRules.SUBJECT_KEYS.join());
G.subjects.forEach(s => A.ok(s.cap > 0 && typeof s.name === 'string'));

// 4. 起点与目标：分数不超过满分、目标单科线可达、总分线不超过满分合计
const capSum = C.caps.reduce((a, b) => a + b, 0);
C.backgrounds.forEach(b => A.ok(b.scores.every((v, i) => Number.isFinite(v) && v >= 0 && v <= C.caps[i]), '起点分数越界 ' + b.name));
C.goals.forEach(g => {
  A.ok(g.minimums.every((v, i) => Number.isFinite(v) && v > 0 && v <= C.caps[i]), '单科线越界 ' + g.name);
  A.ok(g.total <= capSum && g.total >= g.minimums.reduce((a, b) => a + b, 0), '总分线不合理 ' + g.name);
  A.ok(typeof g.tagline === 'string' && g.tagline.length > 0);
});
A.ok(C.goals.every((g, i) => i === 0 || g.total > C.goals[i - 1].total), '目标总分应递增');

// 5. 行动：11 种，ID 唯一，科目引用存在，分类合法
A.strictEqual(G.actions.length, 11);
A.ok(unique(G.actions.map(a => a.id)), '行动 id 重复');
G.actions.forEach(a => {
  A.ok(['study', 'sprint', 'life'].includes(a.category), '分类非法 ' + a.id);
  A.ok(a.subject === -1 || (Number.isInteger(a.subject) && a.subject >= 0 && a.subject < 4), '科目引用不存在 ' + a.id);
  A.ok((a.category === 'life') === (a.subject < 0), '生活类行动不应涨分 ' + a.id);
  A.ok(a.cost >= 0 && a.income >= 0 && a.gain >= 0 && typeof a.badge === 'string' && a.badge.length === 1);
});
A.ok(G.actions.some(a => a.id === G.uiText.previewFiller), '预览补位行动不存在');
// 冲刺 = 自习 × 1.45（数值关系：更快，但花钱且更累）
for (let i = 0; i < 4; i++) {
  const s = G.actions.find(a => a.id === 'study' + i), p = G.actions.find(a => a.id === 'sprint' + i);
  A.ok(Math.abs(p.gain - s.gain * 1.45) < 1e-9 && p.cost > 0 && p.energy < s.energy && p.stress > s.stress);
}

// 6. 事件：每个事件恰好两个选项，引用存在，数值合理
A.strictEqual(G.events.length, 8);
A.ok(unique(G.events.map(x => x.index)));
G.events.forEach(ev => {
  const opts = G.eventOptions.filter(o => o.event === ev.index);
  A.strictEqual(opts.length, 2, '事件选项数 ' + ev.title);
  A.strictEqual(opts.map(o => o.option).sort().join(), "0,1");
});
A.ok(G.eventOptions.every(o => G.events.some(ev => ev.index === o.event)), '选项引用了不存在的事件');
G.eventOptions.forEach(o => A.ok(['money', 'energy', 'stress', ...w.KaoyanRules.SUBJECT_KEYS].every(k => Number.isFinite(o[k])) && typeof o.text === 'string'));
// 一局事件数（周数/间隔）不超过事件池，保证“每局不重复”
A.ok(Math.floor(base.weeks / base.eventEveryWeeks) <= G.events.length);

// 7. 组装结果与原单文件内嵌的 exam_config 完全一致（逆推无损）
const html = fs.readFileSync(path.join(ROOT, '../../demos/kaoyan.html'), 'utf8');
const orig = JSON.parse(html.match(/<script id="exam-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const pick = (x, t) => Array.isArray(t) ? t.map((v, i) => pick(x[i], v)) : (t && typeof t === 'object') ? Object.fromEntries(Object.keys(t).map(k => [k, pick(x[k], t[k])])) : x;
A.deepStrictEqual(JSON.parse(JSON.stringify(pick(C, orig))), orig);

// 8. 界面文案表
A.ok(G.uiText.phases.length >= 1 && G.uiText.phases.at(-1).maxWeek >= base.weeks, '阶段表未覆盖全部周');
A.strictEqual(G.uiText.scenes.at(-1).when, 'always', '书桌提示需要兜底项');

// 9. 配置表真正驱动规则：改表 → 结算随之变化
{
  const G2 = JSON.parse(JSON.stringify(G));
  G2.examConfig.weeklyExpense = 100; G2.examConfig.efficiency.stressThreshold = 10;
  G2.actions.find(a => a.id === 'study2').gain = 20;
  const C2 = w.KaoyanRules.buildExamConfig(G2), E = w.KaoyanRules.ExamEngine;
  const p = new E(C2, E.newGame(C2, 0, 0)).preview(['study2', 'rest', 'rest']);
  A.strictEqual(p.after.money, C2.initialMoney - 100, '生活费读自 exam-config.json');
  A.ok(p.steps[0].efficiency < 1, '压力阈值读自 exam-config.json');
  A.ok(p.steps[0].gain > 10, '行动收益读自 actions.csv');
}

console.log(A.count() + ' assertions passed');
