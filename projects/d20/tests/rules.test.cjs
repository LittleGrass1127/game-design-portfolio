/* 规则与配置测试：配置完整性、核心公式、关键规则、结局判定、确定性、存档校验、与原单文件行为一致、导出一致性。
   运行：node tests/rules.test.cjs */
'use strict';
const fs = require('fs');
const path = require('path');
const { loadScripts, makeAssert } = require('./helpers/load.cjs');
const { loadOriginal } = require('./helpers/original.cjs');
const { playEpisode } = require('./helpers/policy.cjs');
const exporter = require('../tools/export-config.cjs');

const assert = makeAssert();
const w = loadScripts(['src/js/config.generated.js', 'src/js/story.js', 'src/js/rules.js']);
const CFG = w.GAME_CONFIG, STORY = w.SunD20Story, Engine = w.SunD20Engine;
const plain = v => JSON.parse(JSON.stringify(v));
// vm 沙箱里的对象原型与主进程不同，深比较前先转成普通 JSON
const deq = (a, b, msg) => assert.deepStrictEqual(plain(a), plain(b), msg);
const unique = (list, label) => assert.strictEqual(new Set(list).size, list.length, label + ' ID 重复');

// ---------- 1. 配置完整性 ----------
const statIds = CFG.stats.map(s => s.id), resIds = CFG.resources.map(r => r.id);
const allies = CFG.characters.filter(c => c.ally).map(c => c.id);
const sceneIds = CFG.scenes.map(s => s.id), choiceIds = CFG.choices.map(c => c.id);
unique(statIds, 'stats'); unique(resIds, 'resources'); unique(CFG.characters.map(c => c.id), 'characters');
unique(sceneIds, 'scenes'); unique(choiceIds, 'choices'); unique(CFG.origins.map(o => o.id), 'origins');
unique(CFG.interludes.map(i => i.id), 'interludes'); unique(CFG.endings.map(e => e.id), 'endings');
deq(statIds, ['rhetoric', 'insight', 'nerve', 'craft']);
deq(allies, ['counsel', 'engineer', 'broker']);
assert.strictEqual(CFG.acts.length, 4, '4 幕');
assert.strictEqual(CFG.scenes.length, 13, '13 个场景节点');
assert.strictEqual(CFG.choices.length, 37, '37 个选项');
for (const r of CFG.resources) assert.ok(r.min <= r.start && r.start <= r.max, '资源初始值在范围内：' + r.id);
for (const s of CFG.stats) assert.ok(s.min <= s.start && s.start <= s.max, '属性初始值在范围内：' + s.id);
for (const o of CFG.origins) { assert.ok(statIds.includes(o.stat), '出身属性存在'); assert.ok(o.trained.split('|').every(t => statIds.includes(t)), '出身熟练存在'); }
for (const s of CFG.scenes) {
  assert.ok(CFG.acts.some(a => a.id === s.act), '场景幕次存在：' + s.id);
  assert.ok(!s.speaker || allies.includes(s.speaker), '场景说话人存在：' + s.id);
  const n = CFG.choices.filter(c => c.scene === s.id).length;
  assert.ok(n >= 2 && n <= 3, '每个场景 2–3 个选项：' + s.id);
}
for (const c of CFG.choices) {
  assert.ok(sceneIds.includes(c.scene), '选项所属场景存在：' + c.id);
  assert.ok(statIds.includes(c.skill), '检定属性存在：' + c.id);
  assert.ok(Number.isInteger(c.dc) && c.dc >= CFG.rules.dcRange[0] && c.dc <= CFG.rules.dcRange[1], 'DC 范围：' + c.id);
  const results = CFG.outcomes.filter(o => o.choice === c.id).map(o => o.result);
  assert.ok(results.includes('success') && results.includes('failure'), '成败两支齐全：' + c.id);
}
assert.strictEqual(CFG.outcomes.filter(o => o.result === 'success' || o.result === 'failure').length, 74, '74 条成败分支');
for (const o of CFG.outcomes) {
  assert.ok(choiceIds.includes(o.choice), '后果引用的选项存在');
  assert.ok(['success', 'failure', 'criticalSuccess', 'criticalFailure'].includes(o.result), '后果类型合法');
  assert.ok(o.next === 'END' || sceneIds.includes(o.next), '后续节点存在：' + o.choice + '/' + o.result);
  assert.ok(typeof o.text === 'string' && o.text.length > 10, '后果文案非空');
  const from = CFG.scenes.find(s => s.id === CFG.choices.find(c => c.id === o.choice).scene);
  if (o.next !== 'END') assert.ok(CFG.scenes.find(s => s.id === o.next).act - from.act <= 1, '不跳幕：' + o.choice);
}
// 条件里引用的 flag / item 必须能在某个后果里拿到（或是出身特质 / 营地特质）
const flagSources = new Set(['crisis', ...CFG.outcomes.flatMap(o => (o.flags || '').split('|').filter(Boolean))]);
const itemSources = new Set(CFG.outcomes.flatMap(o => (o.items || '').split('|').filter(Boolean)));
const traitSources = new Set([...CFG.origins.map(o => o.trait), ...CFG.interludes.flatMap(i => (i.traits || '').split('|').filter(Boolean))]);
function walk(cond, fn) { if (!cond || typeof cond !== 'object') return; if (Array.isArray(cond)) return cond.forEach(c => walk(c, fn)); fn(cond); for (const k of ['all', 'any']) if (cond[k]) cond[k].forEach(c => walk(c, fn)); for (const k of ['not', 'condition']) if (cond[k]) walk(cond[k], fn); }
const checkRefs = cond => walk(cond, c => {
  if (c.flag) assert.ok(flagSources.has(c.flag), '条件 flag 可获得：' + c.flag);
  if (c.item) assert.ok(itemSources.has(c.item), '条件 item 可获得：' + c.item);
  if (c.trait) assert.ok(traitSources.has(c.trait), '条件 trait 可获得：' + c.trait);
  if (c.stat) assert.ok(statIds.includes(c.stat));
  if (c.resource) assert.ok(resIds.includes(c.resource));
  if (c.relation) assert.ok(allies.includes(c.relation));
});
for (const [id, spec] of Object.entries(CFG.choiceConditions)) { assert.ok(choiceIds.includes(id), '条件表选项存在：' + id); Object.values(spec).forEach(checkRefs); }
CFG.endings.forEach(e => checkRefs(e.condition));
deq(CFG.endings[CFG.endings.length - 1].condition, {}, '最后一个结局是无条件兜底');
assert.strictEqual(CFG.endings.length, 5, '5 种结局');
// 营地：3 次 × 3 槽，槽位对应 3 个房间 / 3 个模组
for (const act of [1, 2, 3]) deq(CFG.interludes.filter(i => i.act === act).map(i => i.slot), [1, 2, 3], '营地槽位：第' + act + '幕后');
deq(CFG.campRooms.map(r => r.slot), [1, 2, 3]);
for (const r of CFG.campRooms) assert.ok(CFG.vehicleModules.some(m => m.id === r.module), '房间对应模组存在：' + r.id);
assert.strictEqual(CFG.raceLegs.length, 3, '3 段夜航');
deq(CFG.raceTiers.map(t => t.tier), ['gold', 'silver', 'bronze'], '档位按从高到低判定');
assert.strictEqual(CFG.combatActs.length, 4); assert.strictEqual(CFG.exploreMaps.maps.length, 4);
for (const m of CFG.exploreMaps.maps) assert.strictEqual(m.objectives.length, 3, '每幕 3 个合同节点：' + m.id);

// ---------- 2. 故事数据与原单文件完全一致 ----------
const O = loadOriginal();
deq(plain(STORY), plain(O.SunD20Story), '配置表组装出的故事 == 原单文件内嵌故事');

// ---------- 3. 核心公式 ----------
assert.strictEqual(Engine.chance({ dc: 10, bonus: 4 }), 0.75, '普通：需 6+，15/20');
assert.strictEqual(Engine.chance({ dc: 30, bonus: 0 }), 0.05, '自然 20 必成');
assert.strictEqual(Engine.chance({ dc: 2, bonus: 10 }), 0.95, '自然 1 必败');
assert.strictEqual(Engine.chance({ dc: 11, bonus: 0, mode: 'advantage' }), 1 - (10 / 20) ** 2, '优势：1-(失败率)^2');
assert.strictEqual(Engine.chance({ dc: 11, bonus: 0, mode: 'disadvantage' }), (10 / 20) ** 2, '劣势：成功率^2');
{
  // 熟练加值 = 2 + floor((等级-1)/2)
  const e = new Engine(STORY, { seed: 7 }); e.chooseOrigin('hunter');
  const v = e._view(STORY.scenes.dock_counsel.choices[1]); // read_omission：洞察 DC12
  assert.strictEqual(v.stat, 4); assert.strictEqual(v.proficiency, 2); assert.strictEqual(v.bonus, 6);
  assert.strictEqual(v.mode, 'advantage', '读懂沉默 -> 优势');
  e.state.level = 3; assert.strictEqual(e._view(STORY.scenes.dock_counsel.choices[1]).proficiency, 3);
  e.state.level = 5; assert.strictEqual(e._view(STORY.scenes.dock_counsel.choices[1]).proficiency, 4);
  // 预算不足时选项锁定
  e.state.resources.capital = 1; assert.strictEqual(e._view(STORY.scenes.dock_counsel.choices[2]).available, false, '资本<2 锁定交接底稿');
}
{
  // 大成功 ×1.5 放大有利增量、大失败放大不利增量（无专属文本时）
  const e = new Engine(STORY, { seed: 1 });
  const ch = STORY.scenes.dock_invitation.choices[2];
  const cs = e._outcome(ch, { success: true, critical: 'success' });
  deq(plain(cs.delta), { leverage: 2, reputation: 2 }, '1 -> ceil(1.5)=2');
  const cf = e._outcome(ch, { success: false, critical: 'failure' });
  deq(plain(cf.delta), { reputation: -2, pressure: 2 }, '不利项放大');
  // 有专属大失败文本时覆盖而非放大
  const seat = STORY.scenes.council_witness.choices[0];
  const sf = e._outcome(seat, { success: false, critical: 'failure' });
  assert.ok(sf.flags.counsel_withdrew, '专属大失败：晏律师退出');
  assert.strictEqual(sf.delta.pressure, 2);
}
// 等级阈值
{
  const e = new Engine(STORY, { seed: 3 }); e.chooseOrigin('orator');
  const xpTable = [[0, 1], [6, 1], [7, 2], [15, 3], [24, 4], [34, 5], [99, 5]];
  for (const [xp, lv] of xpTable) { const st = plain(e.state); st.xp = xp; assert.strictEqual(1 + CFG.rules.levelThresholds.filter(n => xp >= n).length, lv, 'xp ' + xp + ' -> LV' + lv); }
}

// ---------- 4. 关键规则：流程、改口、营地、夜航 ----------
{
  const e = new Engine(STORY, { seed: 42 });
  assert.strictEqual(e.beginCheck('reply_on_record').ok, false, '未选出身不能检定');
  e.chooseOrigin('founder');
  assert.strictEqual(e.state.stats.nerve, 4); assert.ok(e.state.trained.includes('nerve')); assert.ok(e.state.traits.includes('下一张牌'));
  assert.strictEqual(e.chooseOrigin('orator').ok, false, '出身只能选一次');
  const r = e.beginCheck('board_without_answer'); assert.ok(r.ok);
  assert.strictEqual(r.roll.dice.length, 2, '下一张牌 -> 优势掷两次');
  assert.strictEqual(e.beginCheck('reply_on_record').ok, false, '检定未接受前不能再检定');
  e.acceptRoll();
  assert.strictEqual(e.state.completedChecks, 1); assert.strictEqual(e.state.sceneId, 'dock_counsel');
  // 改口：只能对非大失败的失败使用，消耗 1
  const e2 = new Engine(STORY, { seed: 0 }); e2.chooseOrigin('hunter');
  let found = false;
  for (let seed = 0; seed < 200 && !found; seed++) {
    const t = new Engine(STORY, { seed }); t.chooseOrigin('hunter'); t.beginCheck('inspect_invitation');
    const roll = t.state.pending.roll;
    if (!roll.success && !roll.critical) {
      const before = t.state.fate, rr = t.reroll(); assert.ok(rr.ok, '可改口'); assert.strictEqual(t.state.fate, before - 1);
      assert.strictEqual(t.reroll().ok, false, '每次检定只能改口一次'); found = true;
    }
  }
  assert.ok(found, '找到可改口的失败');
}
{
  // 走完第一幕 -> 营地；营地选择后进入第二幕；夜航结算按档位给奖励
  const { engine: e } = playEpisode(Engine, STORY, 2024, 'greedy', { races: false });
  assert.strictEqual(e.state.phase, 'ending');
  assert.strictEqual(e.state.completedChecks, 12, '一局恰好 12 次检定');
  assert.strictEqual(e.state.training, 3, '一局 3 次营地');
  const t = new Engine(STORY, { seed: 5 }); t.chooseOrigin('engineer');
  while (t.state.phase !== 'interlude') { const v = t.choices().find(x => x.available); t.beginCheck(v.id); t.acceptRoll(); }
  assert.strictEqual(t.state.interludeAfter, 1);
  assert.strictEqual(t.applyRaceResult('night-drive-1', { absorbed: 20, maxCombo: 8, tier: 'gold' }).ok, false, '营地前不能结算夜航');
  t.train('keep_margin'); assert.strictEqual(t.state.act, 2);
  const before = plain(t.state);
  const g = t.applyRaceResult('night-drive-1', { absorbed: 20, maxCombo: 8, tier: 'gold' });
  assert.ok(g.ok);
  assert.strictEqual(t.state.resources.leverage - before.resources.leverage, 2, '金档 筹码+2');
  assert.strictEqual(t.state.fate - before.fate, 1, '金档 改口+1');
  assert.ok(t.state.items.includes('金色车辙章·1'));
  assert.strictEqual(t.applyRaceResult('night-drive-1', { absorbed: 20, maxCombo: 8, tier: 'gold' }).ok, false, '同一段不能重复结算');
  assert.strictEqual(t.applyRaceResult('night-drive-2', { absorbed: 1, maxCombo: 1, tier: 'bronze' }).ok, false, '赛段与幕次不符');
  deq(plain(Engine.raceReward('silver', 2)), { resources: { leverage: 1, pressure: -1 }, item: '合流车队徽·2' });
}

// ---------- 5. 结局判定（按 endings.json 自上而下第一条满足） ----------
{
  const base = () => { const e = new Engine(STORY, { seed: 9 }); e.chooseOrigin('orator'); return plain(e.state); };
  // 引擎未单独导出条件判定 meets()，借 _view 的 required 判定来求值（与 acceptRoll 判结局用的是同一个函数）
  const probe = new Engine(STORY, { seed: 1 });
  const meets = (cond, st) => probe._view({ id: 'x', skill: 'rhetoric', dc: 10, required: cond }, st).available;
  const judge = st => (STORY.endings.find(en => meets(en.condition, st)) || STORY.endings[STORY.endings.length - 1]).id;
  let st = base(); st.resources.pressure = 6; st.flags.intent_publish = true; st.resources.leverage = 9; st.relations.counsel = 3;
  assert.strictEqual(judge(st), 'crisis', '压力满 6 优先进入危机结局');
  st = base(); st.flags.intent_publish = true; st.resources.leverage = 4; st.relations.counsel = 1;
  assert.strictEqual(judge(st), 'public_record');
  st.flags.counsel_withdrew = true; assert.strictEqual(judge(st), 'withdrawal', '晏律师退出 -> 审查不成立');
  st = base(); st.flags.intent_open = true; st.resources.reputation = 4; st.relations.engineer = 1;
  assert.strictEqual(judge(st), 'open_protocol');
  st.resources.reputation = 3; assert.strictEqual(judge(st), 'withdrawal', '声望不足 -> 退出');
  st = base(); st.flags.intent_control = true; st.resources.capital = 4; st.resources.reputation = 3;
  assert.strictEqual(judge(st), 'steward');
  st.resources.capital = 3; assert.strictEqual(judge(st), 'withdrawal');
}

// ---------- 6. 确定性与存档 ----------
{
  const a = playEpisode(Engine, STORY, 777, 'random'), b = playEpisode(Engine, STORY, 777, 'random');
  assert.strictEqual(a.engine.serialize(), b.engine.serialize(), '同种子同策略 -> 完全相同的一局');
  const c = playEpisode(Engine, STORY, 778, 'random');
  assert.notStrictEqual(a.engine.serialize(), c.engine.serialize(), '换种子 -> 不同的一局');
  const restored = Engine.restore(STORY, a.engine.serialize());
  assert.strictEqual(restored.state.endingId, a.ending, '存档回放后结局一致');
  const bad = JSON.parse(a.engine.serialize()); bad.resources.capital += 5;
  assert.strictEqual(Engine.validate(STORY, bad).valid, false, '篡改资源的存档被拒绝');
  const bad2 = JSON.parse(a.engine.serialize()); bad2.history[0].roll.kept = 20;
  assert.strictEqual(Engine.validate(STORY, bad2).valid, false, '篡改骰面的存档被拒绝');
}

// ---------- 7. 与原单文件规则引擎逐局一致 ----------
{
  let same = 0;
  for (const policy of ['random', 'greedy', 'risky', 'last']) for (let i = 0; i < 25; i++) {
    const seed = 5000 + i * 37;
    const mine = playEpisode(Engine, STORY, seed, policy), theirs = playEpisode(O.SunD20Engine, O.SunD20Story, seed, policy);
    deq(JSON.parse(mine.engine.serialize()), JSON.parse(theirs.engine.serialize()), '与原版状态一致 seed=' + seed + ' ' + policy);
    same++;
  }
  assert.strictEqual(same, 100);
}

// ---------- 8. 配置导出一致 ----------
{
  const out = exporter.render(exporter.loadConfig());
  const cur = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'js', 'config.generated.js'), 'utf8');
  assert.strictEqual(cur, out, 'config.generated.js 与 config/ 一致（export-config --check）');
}

console.log(assert.count() + ' assertions passed');
