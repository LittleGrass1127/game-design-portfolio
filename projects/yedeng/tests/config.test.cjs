/* 配置完整性 + 评分规则测试：node tests/config.test.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { loadConfig, render } = require('../tools/export-config.cjs');

const a = makeAssert();
// vm 沙箱里的对象原型与主环境不同，深比较前先转成普通对象
const plain = x => JSON.parse(JSON.stringify(x));
const win = loadScripts(['src/js/config.generated.js', 'src/js/rules.js']);
const cfg = win.GAME_CONFIG;
const R = win.YedengRules;

// 1. 生成文件与配置表一致（等价于 export-config --check）
const generated = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'config.generated.js'), 'utf8');
a.strictEqual(generated, render(loadConfig()), 'config.generated.js 需重新导出');

// 2. 素材表：字段齐全、ID 唯一、数值范围
const ids = new Set();
for (const c of cfg.clips) {
  for (const k of ['id', 'name', 'tag', 'mood', 'stable']) a.ok(c[k] !== null && c[k] !== undefined, `${c.id} 缺字段 ${k}`);
  a.ok(!ids.has(c.id), `素材 ID 重复 ${c.id}`);
  ids.add(c.id);
  a.ok(Number.isInteger(c.mood) && c.mood >= 1 && c.mood <= 5, `${c.id} 情绪强度应在 1–5`);
  a.ok(c.stable >= 0 && c.stable <= 100, `${c.id} 稳定度应在 0–100`);
}

// 3. 委托：引用存在、素材数够选
const cm = cfg.commission;
a.ok(ids.has(cm.requiredEndingClip), '委托要求的结尾素材不存在');
a.ok(cfg.clips.length > cm.timelineSize, '素材数应多于时间轴格数，才有取舍');
a.ok(cm.objectives.length > 0, '委托目标为空');
a.ok(cm.previewFlowThreshold > 0 && cm.previewFlowThreshold <= 100, '节奏阈值越界');
const ending = cfg.clips.find(c => c.id === cm.requiredEndingClip);
a.strictEqual(ending.tag, cfg.scoring.theme.endingTag, '结尾素材标签应与结尾加分标签一致');

// 4. 评分权重：三项在 0–1 且和为 1；单项上限 100
const w = cfg.scoring.weights;
for (const k of ['theme', 'flow', 'stable']) a.ok(w[k] > 0 && w[k] < 1, `权重 ${k} 越界`);
a.ok(Math.abs(w.theme + w.flow + w.stable - 1) < 1e-9, '权重和应为 1');
a.ok(cfg.scoring.flow.min >= 0 && cfg.scoring.flow.min < cfg.scoring.flow.base, '节奏下限应低于基准');
a.ok(cm.timelineSize * cfg.scoring.progress.perClip <= cfg.scoring.progress.previewed, '选满前进度不应超过试映进度');

// 5. 文案：三种试映反馈都有
for (const k of ['ending', 'flow', 'good']) a.ok(cfg.texts.preview[k], `缺少试映文案 ${k}`);
for (const k of ['playHint', 'feedbackInitial', 'cardLabel', 'slotTag', 'premiereGood', 'premiereWarn', 'resetLabel', 'resetLabelDone']) a.ok(cfg.texts[k], `缺少文案 ${k}`);
a.ok(cfg.texts.cardLabel.includes('{mood}'), '素材卡要显示情绪强度（节奏分的依据）');

// 6. 评分函数
a.deepStrictEqual(plain(R.calculate([], cfg)), { theme: 0, flow: 0, stable: 0, total: 0 });
const best = ['breakfast', 'cat', 'noodles', 'blooper', 'portrait'];
const s1 = R.calculate(best, cfg);
a.strictEqual(s1.theme, 100);           // 5×18+28=118 封顶 100
a.strictEqual(s1.flow, 70);             // 情绪跳跃 1+0+0+1=2 → 100-30
a.strictEqual(s1.stable, 88);           // (94+89+91+68+98)/5
a.strictEqual(Math.round(s1.total), 86);
a.strictEqual(R.previewVerdict(best, cfg).key, 'good');
// 结尾不是合影 → 先报结尾问题
a.strictEqual(R.previewVerdict(['breakfast', 'cat', 'noodles', 'portrait', 'chase'], cfg).key, 'ending');
// 情绪大幅跳跃 → 报节奏问题
const jumpy = ['chase', 'neon', 'blooper', 'breakfast', 'portrait'];
a.strictEqual(R.calculate(jumpy, cfg).flow, 55);
a.strictEqual(R.previewVerdict(jumpy, cfg).key, 'flow');
// 不足五段时有长度惩罚
a.strictEqual(R.calculate(['portrait'], cfg).flow, 52);  // 100 - 4×12

// 7. 时间轴操作
let tl = [];
for (const id of best) tl = R.toggleClip(tl, id, cfg).timeline;
a.strictEqual(tl.length, 5);
a.strictEqual(R.toggleClip(tl, 'neon', cfg).full, true);
a.deepStrictEqual(plain(R.toggleClip(tl, 'cat', cfg).timeline), ['breakfast', 'noodles', 'blooper', 'portrait']);
a.deepStrictEqual(plain(R.removeAt(tl, 0)), ['cat', 'noodles', 'blooper', 'portrait']);
a.strictEqual(R.progress({ timeline: tl, previewed: false, finished: false }, cfg).label, '时间轴 5/5');

// 8. 结尾要求体现在分数上：不以合影结尾的排列，主题分到不了满分，总分最高值也低于通过方案的最高值
const th = cfg.scoring.theme;
a.ok(cfg.clips.filter(c => R.isThemeClip(c, th)).length >= cm.timelineSize, '主题素材足够排满时间轴');
a.ok(cm.timelineSize * th.perThemeClip < th.max, '只靠主题素材数量不能把主题分堆满');
a.ok(cm.timelineSize * th.perThemeClip + th.endingBonus >= th.max, '主题素材 + 结尾加分可以到满分');
const noEnding = ['breakfast', 'cat', 'noodles', 'blooper', 'neon'];
a.strictEqual(R.calculate(noEnding, cfg).theme, 72);       // 4×18，无结尾加分
a.strictEqual(R.calculate(['breakfast', 'noodles', 'cat', 'portrait', 'blooper'], cfg).theme, 90);  // 5 段主题素材但合影不在结尾
let bestPass = 0, bestFail = 0, passCount = 0;
(function walk(cur) {
  if (cur.length === cm.timelineSize) {
    const v = R.previewVerdict(cur, cfg);
    if (v.key === 'good') { passCount++; bestPass = Math.max(bestPass, v.score.total); } else bestFail = Math.max(bestFail, v.score.total);
    return;
  }
  for (const c of cfg.clips) if (!cur.includes(c.id)) walk(cur.concat(c.id));
})([]);
a.strictEqual(passCount, 24);
a.ok(bestPass > bestFail, `最高分必须来自试映通过的方案（${bestPass.toFixed(2)} vs ${bestFail.toFixed(2)}）`);

console.log(`${a.count()} assertions passed`);
