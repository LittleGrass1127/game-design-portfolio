/* 与原单文件对拍：node tests/parity.test.cjs
   从 ../../demos/kaoyan.html 取出原规则脚本与内嵌 exam_config，和本工程 rules.js + config/ 跑同样的局，结果必须逐字节一致。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');

const A = makeAssert();
const J = x => JSON.stringify(x);
const html = fs.readFileSync(path.resolve(__dirname, '../../../demos/kaoyan.html'), 'utf8');
const origConfig = JSON.parse(html.match(/<script id="exam-config" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const origRules = html.match(/<script>(\/\* China Exam rules[\s\S]*?)<\/script>/)[1];
const oldWin = vm.createContext({});
vm.runInContext(origRules, oldWin);
const Old = oldWin.ExamEngine;

const w = loadScripts(['src/js/config.generated.js', 'src/js/rules.js']);
const New = w.KaoyanRules.ExamEngine;
const C = w.KaoyanRules.buildExamConfig(w.GAME_CONFIG);
const ids = C.actions.map(a => a.id);
A.strictEqual(J(ids), J(origConfig.actions.map(a => a.id)));

// 效率公式逐点一致
const e1 = new Old(origConfig, Old.newGame(origConfig, 0, 0)), e2 = new New(C, New.newGame(C, 0, 0));
for (let en = 0; en <= 100; en += 2.5) for (let st = 0; st <= 100; st += 2.5)
  A.strictEqual(e2.efficiency({ energy: en, stress: st }), e1.efficiency({ energy: en, stress: st }));

// 整局对拍：同种子、同一串决策
const lcg = seed => () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
function play(Engine, cfg, seed, bg, goal, planSeed) {
  const eng = new Engine(cfg, Engine.newGame(cfg, bg, goal, seed)), rng = lcg(planSeed), trace = [];
  while (!eng.state.finished) {
    if (eng.pendingEvent()) {
      const opts = [0, 1].filter(i => eng.canChoose(i));
      trace.push(J(eng.chooseEvent(opts[Math.floor(rng() * opts.length)])));
      continue;
    }
    let plan = [0, 1, 2].map(() => ids[Math.floor(rng() * ids.length)]);
    const p = eng.preview(plan);
    trace.push(J(p));
    if (!p.valid) plan = ['job', 'study0', 'rest'];
    trace.push(J(eng.commit(plan)));
  }
  return { trace, state: J(eng.state), admitted: eng.isAdmitted(), total: eng.total() };
}
let games = 0, admitted = 0;
for (let g = 0; g < 90; g++) {
  const args = [3000 + g * 7, g % 3, Math.floor(g / 3) % 3, 11 + g];
  const a = play(Old, origConfig, ...args), b = play(New, C, ...args);
  A.strictEqual(b.trace.length, a.trace.length);
  b.trace.forEach((t, i) => A.strictEqual(t, a.trace[i]));
  A.strictEqual(b.state, a.state);
  A.strictEqual(b.admitted, a.admitted);
  games++; if (b.admitted) admitted++;
}
// 新工程的存档单文件版可读、单文件版存档新工程可读
const s1 = play(New, C, 5, 1, 1, 5).state;
A.ok(Old.validateState(origConfig, JSON.parse(s1)).valid);
A.ok(New.validateState(C, JSON.parse(play(Old, origConfig, 5, 1, 1, 5).state)).valid);

console.log('对拍 ' + games + ' 局，其中随机策略录取 ' + admitted + ' 局');
console.log(A.count() + ' assertions passed');
