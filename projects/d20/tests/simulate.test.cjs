/* 批量模拟：4 种固定策略 × 400 个固定种子 = 1,600 局完整剧情（含营地与夜航结算），
   统计场景 / 选项 / 成败分支 / 专属大成功大失败 / 结局覆盖。运行：node tests/simulate.test.cjs */
'use strict';
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { playEpisode } = require('./helpers/policy.cjs');

const assert = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/story.js', 'src/js/rules.js']);
const CFG = w.GAME_CONFIG, STORY = w.SunD20Story, Engine = w.SunD20Engine;

const POLICIES = ['random', 'greedy', 'risky', 'last'], SEEDS = 400;
const scenes = new Set(), choices = new Set(), branches = new Set(), specials = new Set();
const endings = {}, byPolicy = {}, checks = new Set(), finalPressure = [];
let runs = 0, rerolls = 0;
for (const policy of POLICIES) {
  byPolicy[policy] = {};
  for (let i = 0; i < SEEDS; i++) {
    const { engine, log, ending } = playEpisode(Engine, STORY, 10000 + i, policy);
    runs++; rerolls += log.rerolls;
    log.scenes.forEach(s => scenes.add(s)); log.choices.forEach(c => choices.add(c));
    for (const b of log.branches) { if (b.includes(':')) branches.add(b); else if (/#critical/.test(b)) specials.add(b); }
    endings[ending] = (endings[ending] || 0) + 1; byPolicy[policy][ending] = (byPolicy[policy][ending] || 0) + 1;
    checks.add(engine.state.completedChecks); finalPressure.push(engine.state.resources.pressure);
    assert.strictEqual(engine.state.phase, 'ending', '每局都能走到结局（无软锁）');
  }
}
// 专属大成功 / 大失败文本：outcomes.csv 里 result=critical* 的行
const specialRows = CFG.outcomes.filter(o => o.result.startsWith('critical')).map(o => o.choice + '#' + o.result);
const specialHit = specialRows.filter(k => specials.has(k));

assert.strictEqual(runs, 1600);
assert.deepStrictEqual([...checks], [12], '每局恰好 12 次检定');
assert.strictEqual(scenes.size, CFG.scenes.length, '场景覆盖 13/13');
assert.strictEqual(choices.size, CFG.choices.length, '选项覆盖 37/37');
assert.strictEqual(branches.size, CFG.choices.length * 2, '成败分支覆盖 74/74');
assert.strictEqual(specialHit.length, specialRows.length, '专属大成功/大失败文本全部触发');
assert.strictEqual(Object.keys(endings).length, CFG.endings.length, '5 种结局全部可达');

console.log('局数', runs, '| 场景', scenes.size + '/' + CFG.scenes.length, '| 选项', choices.size + '/' + CFG.choices.length,
  '| 成败分支', branches.size + '/' + CFG.choices.length * 2, '| 专属暴击文本', specialHit.length + '/' + specialRows.length, '| 改口次数', rerolls);
console.log('结局分布', JSON.stringify(endings));
for (const p of POLICIES) console.log('  ', p, JSON.stringify(byPolicy[p]));
console.log(assert.count() + ' assertions passed');
