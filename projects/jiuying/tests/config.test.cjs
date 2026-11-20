/* 旧影回声 · 配置完整性 + 判定函数测试：node tests/config.test.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { loadConfig, render } = require('../tools/export-config.cjs');

const a = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/rules.js']);
const C = w.GAME_CONFIG;
const R = w.JiuyingRules;

// 1. 导出产物与配置表一致（等价于 --check）
const generated = fs.readFileSync(path.join(__dirname, '..', 'src/js/config.generated.js'), 'utf8');
a.strictEqual(generated, render(loadConfig()), 'config.generated.js 需重新导出');

// 2. 线索表：字段齐全、ID 唯一、类型引用存在
const evFields = ['id', 'title', 'detail', 'slotName', 'type'];
const typeIds = C.evidenceTypes.map(t => t.id);
a.strictEqual(new Set(C.evidence.map(e => e.id)).size, C.evidence.length, 'evidence id 重复');
for (const e of C.evidence) {
  for (const f of evFields) a.ok(e[f] !== null && e[f] !== undefined && e[f] !== '', `evidence.${e.id}.${f} 为空`);
  a.ok(typeIds.includes(e.type), `evidence.${e.id} 的 type 不存在`);
}

// 3. 分类表：规则只认 fact / inference 两类，且每类至少一条线索
a.strictEqual(typeIds.slice().sort().join(','), 'fact,inference');
for (const t of C.evidenceTypes) {
  for (const f of ['label', 'slotId', 'assignButtonId', 'placeholder']) a.ok(t[f], `evidenceTypes.${t.id}.${f} 为空`);
  a.ok(C.evidence.some(e => e.type === t.id), `类型 ${t.id} 没有任何线索`);
}

// 4. 曝光参数范围：min < 可识别下限 <= 上限 < max，初始值不在可识别区间（保证有操作）
const ex = C.exposure;
a.ok(ex.min < ex.readableMin && ex.readableMin <= ex.readableMax && ex.readableMax < ex.max, '曝光区间顺序错误');
a.ok(ex.initial >= ex.min && ex.initial <= ex.max, '初始曝光越界');
a.ok(!R.isReadable(ex.initial), '初始曝光不应直接可识别');
a.ok(ex.visualDivisor > 0);

// 5. 进度阶段单调递增且在 0–100
const stages = ['initial', 'readable', 'classified', 'checked', 'archived'].map(k => C.progress[k]);
stages.forEach((v, i) => a.ok(v >= 0 && v <= 100 && (i === 0 || v > stages[i - 1]), `progress 第 ${i} 阶段不合法`));
a.strictEqual(C.progress.archived, 100);

// 6. 文案表：key 唯一，代码用到的 key 都存在
const keys = C.text.map(r => r.key);
a.strictEqual(new Set(keys).size, keys.length, 'text key 重复');
const used = ['exposureDark', 'exposureReadable', 'exposureOver', 'needSelect', 'checkPass', 'checkFailExposure', 'checkFailType', 'archived', 'archivedLocked', 'archiveToast', 'progressLabel', 'progressDone', 'playHint'];
for (const k of used) a.ok(keys.includes(k), `缺少文案 ${k}`);

// 7. 判定函数：曝光区间边界
a.strictEqual(R.exposureZone(ex.readableMin - 1), 'dark');
a.strictEqual(R.exposureZone(ex.readableMin), 'readable');
a.strictEqual(R.exposureZone(ex.readableMax), 'readable');
a.strictEqual(R.exposureZone(ex.readableMax + 1), 'over');

// 8. 核对规则穷举：通过 ⇔ 曝光可识别 且 事实槽为 fact 且 推断槽为 inference
let passCount = 0;
for (const exposure of [ex.initial, 60, 90]) {
  for (const f of C.evidence) for (const i of C.evidence) {
    const expect = R.isReadable(exposure) && f.type === 'fact' && i.type === 'inference';
    const got = R.checkEvidence({ exposure, fact: f.id, inference: i.id });
    a.strictEqual(got, expect, `核对判定错误 ${exposure}/${f.id}/${i.id}`);
    if (got) passCount++;
  }
}
const nf = C.evidence.filter(e => e.type === 'fact').length;
const ni = C.evidence.filter(e => e.type === 'inference').length;
a.strictEqual(passCount, nf * ni, '只有可识别曝光下的正确组合能通过');
a.strictEqual(R.checkEvidence({ exposure: 60, fact: null, inference: 'note' }), false);

// 9. 进度阶段判定
const s = R.createState();
a.strictEqual(R.progressStep(s), C.progress.initial);
s.exposure = 60; a.strictEqual(R.progressStep(s), C.progress.readable);
s.fact = 'receipt'; s.inference = 'note'; a.strictEqual(R.progressStep(s), C.progress.classified);
s.checked = R.checkEvidence(s); a.strictEqual(R.progressStep(s), C.progress.checked);
s.archived = true; a.strictEqual(R.progressStep(s), 100);
a.strictEqual(R.text('progressLabel', { step: 38 }), '修复进度 38%');

// 10. 核对失败原因：曝光不对优先报曝光，曝光对了才报分类
a.strictEqual(R.checkFailReason({ exposure: 60, fact: 'receipt', inference: 'note' }), null);
a.strictEqual(R.checkFailReason({ exposure: ex.initial, fact: 'receipt', inference: 'note' }), 'exposure');
a.strictEqual(R.checkFailReason({ exposure: 90, fact: 'note', inference: 'receipt' }), 'exposure');
a.strictEqual(R.checkFailReason({ exposure: 60, fact: 'note', inference: 'receipt' }), 'type');
a.strictEqual(R.checkFailReason({ exposure: 60, fact: 'receipt', inference: 'camera' }), 'type');
for (const exposure of [ex.initial, 60, 90]) for (const f of C.evidence) for (const i of C.evidence)
  a.strictEqual(R.checkFailReason({ exposure, fact: f.id, inference: i.id }) === null, R.checkEvidence({ exposure, fact: f.id, inference: i.id }));

// 11. 归类：同一条线索不能同时占两栏
const plain = x => JSON.parse(JSON.stringify(x));
a.deepStrictEqual(plain(R.assignEvidence({ fact: null, inference: null }, 'fact', 'receipt')), { fact: 'receipt', inference: null });
a.deepStrictEqual(plain(R.assignEvidence({ fact: 'receipt', inference: null }, 'inference', 'receipt')), { fact: null, inference: 'receipt' });
a.deepStrictEqual(plain(R.assignEvidence({ fact: 'receipt', inference: 'note' }, 'fact', 'note')), { fact: 'note', inference: null });
a.deepStrictEqual(plain(R.assignEvidence({ fact: 'receipt', inference: 'note' }, 'fact', 'camera')), { fact: 'camera', inference: 'note' });

console.log(`${a.count()} assertions passed`);
