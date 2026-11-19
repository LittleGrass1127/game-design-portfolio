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
const R = win.ChunfengRules;
const sc = cfg.scoring;

// 1. 生成文件与配置表一致
const generated = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'config.generated.js'), 'utf8');
a.strictEqual(generated, render(loadConfig()), 'config.generated.js 需重新导出');

// 2. 花材表：字段齐全、ID 唯一、属性等级有显示名
const ids = new Set();
for (const f of cfg.flowers) {
  for (const k of ['id', 'name', 'color', 'height', 'scent']) a.ok(f[k] !== null && f[k] !== undefined, `${f.id} 缺字段 ${k}`);
  a.ok(!ids.has(f.id), `花材 ID 重复 ${f.id}`);
  ids.add(f.id);
  a.ok(cfg.attributeLevels.some(r => r.attr === 'height' && r.level === f.height), `${f.id} 株高等级无定义`);
  a.ok(cfg.attributeLevels.some(r => r.attr === 'scent' && r.level === f.scent), `${f.id} 香型等级无定义`);
}
a.ok(ids.has(sc.ring.defaultFlower), '默认花材不存在');
const levelKeys = cfg.attributeLevels.map(r => `${r.attr}:${r.level}`);
a.strictEqual(new Set(levelKeys).size, levelKeys.length, '属性等级重复');

// 3. 愿望表：ID 唯一、引用的统计量存在、目标可达成
const statKeys = Object.keys(R.stats([], cfg));
const wishIds = new Set(cfg.wishes.map(w => w.id));
a.strictEqual(wishIds.size, cfg.wishes.length, '愿望 ID 重复');
for (const w of cfg.wishes) {
  a.ok(statKeys.includes(w.stat), `愿望 ${w.id} 引用了不存在的统计量 ${w.stat}`);
  a.ok(w.min > 0 && w.min <= sc.ring.minPlanted, `愿望 ${w.id} 门槛越界`);
}
a.ok(new Set(cfg.flowers.map(f => f.color)).size >= cfg.wishes.find(w => w.stat === 'colors').min, '颜色种类不足以满足色彩愿望');
a.ok(cfg.flowers.some(f => f.height === sc.stats.lowHeight), '没有低株花材');
a.ok(cfg.flowers.some(f => f.scent >= sc.stats.fragrantScentMin), '没有浓香花材');

// 4. 花坛与权重范围
a.ok(sc.ring.minPlanted <= sc.ring.slotCount, '最少种植数超过落点数');
a.ok(sc.weights.harmony > 0 && sc.weights.harmony < 1 && sc.weights.layers > 0 && sc.weights.layers < 1, '比例权重越界');
// 三项满分时总分恰为 100
a.ok(Math.abs(100 * sc.weights.harmony + 100 * sc.weights.layers + sc.weights.wishes - 100) < 1e-9, '满分应为 100');
a.ok(sc.pass.minTotal > 0 && sc.pass.minTotal <= 100, '通过线越界');

// 5. 评分函数
const slots = R.emptySlots(cfg);
a.strictEqual(slots.length, 16);
a.deepStrictEqual(plain(R.calculate(slots, cfg)), { harmony: 0, layers: 0, wishes: 0, total: 0 });
// 12 株全种星铃花：单色单高
const mono = slots.map((_, i) => (i < 12 ? 'bell' : null));
const s1 = R.calculate(mono, cfg);
a.strictEqual(s1.harmony, 45);   // 1×21 + 12×2
a.strictEqual(s1.layers, 25);
a.strictEqual(s1.wishes, 0);
a.strictEqual(R.submitVerdict(mono, cfg).pass, false);
// 混合布置：4 色、3 高、低株≥2、浓香≥2
const mix = mono.slice();
mix[0] = 'wind'; mix[1] = 'wind'; mix[2] = 'sun'; mix[3] = 'rose'; mix[4] = 'rose';
const s2 = R.calculate(mix, cfg);
a.strictEqual(s2.harmony, 100);
a.strictEqual(s2.layers, 95);    // 3×25 + 20
a.strictEqual(s2.wishes, 3);
a.strictEqual(Math.round(s2.total), 98);
a.strictEqual(R.submitVerdict(mix, cfg).pass, true);
// 拔除操作
a.strictEqual(R.toggleSlot(mix, 0, 'bell')[0], null);
a.strictEqual(R.canSubmit(R.toggleSlot(mix, 0, 'bell'), false, cfg), false);  // 11 株不能提交
a.strictEqual(R.canSubmit(mix, true, cfg), false);                              // 已提交不能重复
// 落点 0 在正上方
const p0 = R.slotPosition(0, cfg);
a.ok(Math.abs(p0.left - 50) < 1e-9 && Math.abs(p0.top - 2) < 1e-9);

console.log(`${a.count()} assertions passed`);
