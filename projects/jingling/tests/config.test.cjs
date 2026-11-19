/* 精灵巡游季 · 配置完整性 + 判定函数测试：node tests/config.test.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { loadConfig, render } = require('../tools/export-config.cjs');

const a = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/rules.js']);
const C = w.GAME_CONFIG;
const R = w.JinglingRules;

// 1. 导出产物与配置表一致（等价于 --check）
const generated = fs.readFileSync(path.join(__dirname, '..', 'src/js/config.generated.js'), 'utf8');
a.strictEqual(generated, render(loadConfig()), 'config.generated.js 需重新导出');

function checkTable(name, rows, fields) {
  a.ok(rows.length > 0, `${name} 为空`);
  a.strictEqual(new Set(rows.map(r => r.id)).size, rows.length, `${name} id 重复`);
  for (const r of rows) for (const f of fields) a.ok(r[f] !== null && r[f] !== undefined && r[f] !== '', `${name}.${r.id}.${f} 为空`);
}

// 2. 字段齐全、ID 唯一
checkTable('rumors', C.rumors, ['id', 'title', 'hint', 'name', 'scene', 'correctResonance', 'spirit', 'failHint']);
checkTable('resonances', C.resonances, ['id', 'name', 'desc']);
checkTable('challengeActions', C.challengeActions, ['id', 'label', 'displayOrder', 'step']);

// 3. 引用存在：传闻的正确共鸣、默认传闻
const resIds = C.resonances.map(r => r.id);
for (const r of C.rumors) a.ok(resIds.includes(r.correctResonance), `传闻 ${r.id} 引用了不存在的共鸣`);
a.ok(R.getRumor(C.flow.defaultRumor), '默认传闻不存在');
// 设计约束：每种共鸣恰好对应一条传闻（一一对应，选项不冗余）、精灵名不重复
for (const id of resIds) a.strictEqual(C.rumors.filter(r => r.correctResonance === id).length, 1, `共鸣 ${id} 对应传闻数 != 1`);
a.strictEqual(new Set(C.rumors.map(r => r.spirit)).size, C.rumors.length, '精灵名重复');

// 4. 挑战序列：step 为 1..N 连续不重复，displayOrder 不重复；展示顺序不能直接等于正确顺序
const steps = C.challengeActions.map(x => x.step).sort((x, y) => x - y);
steps.forEach((s, i) => a.strictEqual(s, i + 1, 'step 需为 1..N 连续'));
a.strictEqual(new Set(C.challengeActions.map(x => x.displayOrder)).size, C.challengeActions.length, 'displayOrder 重复');
const display = C.challengeActions.slice().sort((x, y) => x.displayOrder - y.displayOrder).map(x => x.id).join();
a.notStrictEqual(display, R.challengeSequence().join(), '展示顺序等于正确顺序，挑战失去判断');
a.strictEqual(R.challengeSequence().join(), 'observe,steady,sync');

// 5. 数值范围：分数与进度 0–100 且按阶段递增，完成时 = 100
const sc = C.flow.score, pg = C.flow.progress;
const scoreSeq = [sc.initial, sc.resonance, sc.partnered, sc.complete];
scoreSeq.forEach((v, i) => a.ok(v >= 0 && v <= 100 && (i === 0 || v > scoreSeq[i - 1]), `score 第 ${i} 阶段不合法`));
a.ok(pg.initial < pg.resonance && pg.resonance < pg.partneredBase, 'progress 前段需递增');
a.ok(pg.partneredBase + (C.challengeActions.length - 1) * pg.perStep < pg.complete, '挑战未完成时进度不应达到完成值');
a.strictEqual(sc.complete, 100); a.strictEqual(pg.complete, 100);

// 6. 文案表：key 唯一，代码用到的 key 都存在
const keys = C.text.map(r => r.key);
a.strictEqual(new Set(keys).size, keys.length, 'text key 重复');
for (const k of ['intro', 'partnerOk', 'partnerFail', 'challengeBroken', 'challengeStep', 'complete', 'completeToast', 'unknownSpirit', 'progressSearching', 'progressChallenge', 'progressDone'])
  a.ok(keys.includes(k), `缺少文案 ${k}`);

// 7. 结伴判定穷举：仅正确共鸣成功，失败返回该传闻的提示
for (const r of C.rumors) for (const res of C.resonances) {
  const got = R.tryPartner(r.id, res.id);
  a.strictEqual(got.ok, res.id === r.correctResonance, `${r.id}+${res.id}`);
  if (!got.ok) a.strictEqual(got.hint, r.failHint);
}
a.strictEqual(R.tryPartner('bridge', null).ok, false);

// 8. 挑战序列：正确顺序完成；中途按错清空
let ch = [];
for (const id of R.challengeSequence()) {
  const res = R.applyChallengeAction(ch, id);
  a.ok(res.ok); ch = res.challenge;
}
a.strictEqual(R.applyChallengeAction(['observe', 'steady'], 'sync').complete, true);
const wrong = R.applyChallengeAction(['observe'], 'sync');
a.strictEqual(wrong.ok, false); a.strictEqual(wrong.challenge.length, 0);
a.strictEqual(R.applyChallengeAction([], 'steady').ok, false);

// 9. 进度/分数随状态变化
const s = R.createState();
a.strictEqual(s.rumor, C.flow.defaultRumor);
a.strictEqual(R.scoreValue(s), sc.initial); a.strictEqual(R.progressValue(s), pg.initial);
s.resonance = 'wind'; a.strictEqual(R.progressValue(s), pg.resonance);
s.partnered = true; s.challenge = ['observe', 'steady'];
a.strictEqual(R.progressValue(s), pg.partneredBase + 2 * pg.perStep);
a.strictEqual(R.text('progressChallenge', { step: 2, total: 3 }), '协作挑战 2/3');

console.log(`${a.count()} assertions passed`);
