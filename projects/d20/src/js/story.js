/* 剧情内容：从 GAME_CONFIG 的配置表组装成 SunD20Story（结构与原单文件内嵌的故事对象一致）。纯数据，无 DOM。 */
(function (root, factory) {
  const story = factory(root.GAME_CONFIG);
  if (typeof module === 'object' && module.exports) module.exports = story;
  if (root) root.SunD20Story = story;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (CFG) {
  'use strict';
  if (!CFG) throw new Error('缺少 GAME_CONFIG，请先加载 config.generated.js');
  const RES = ['capital', 'reputation', 'leverage', 'pressure'];
  const REL = ['counsel', 'engineer', 'broker'];
  const STATS = ['rhetoric', 'insight', 'nerve', 'craft'];
  const split = v => v == null || v === '' ? [] : String(v).split('|');
  const copy = v => JSON.parse(JSON.stringify(v));
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.keys(value).forEach(function (key) { freeze(value[key]); });
      Object.freeze(value);
    }
    return value;
  }
  // 把一行里有值的列收成对象，空列不写入（与原数据“只写非零项”一致）
  function pick(row, keys, prefix = '') {
    const out = {};
    for (const k of keys) if (row[prefix + k] != null) out[k] = row[prefix + k];
    return out;
  }
  // outcomes.csv 一行 -> success / failure / criticalSuccess / criticalFailure 对象
  function outcome(row) {
    const o = { text: row.text, delta: pick(row, RES) };
    const relation = pick(row, REL, 'rel_');
    if (Object.keys(relation).length) o.relation = relation;
    if (split(row.items).length) o.item = split(row.items);
    if (split(row.flags).length) o.flags = split(row.flags);
    o.next = row.next;
    return o;
  }
  const outcomesByChoice = {};
  for (const row of CFG.outcomes) (outcomesByChoice[row.choice] ||= {})[row.result] = outcome(row);

  const scenes = {};
  for (const s of CFG.scenes) {
    const scene = { id: s.id, act: s.act, title: s.title, kicker: s.kicker };
    if (s.speaker) scene.speaker = s.speaker;
    scene.body = [s.body1, s.body2].filter(t => t != null);
    scene.choices = CFG.choices.filter(c => c.scene === s.id).map(c => ({
      id: c.id, label: c.label, intent: c.intent, skill: c.skill, dc: c.dc,
      ...copy(CFG.choiceConditions[c.id] || {}),
      ...outcomesByChoice[c.id]
    }));
    scenes[s.id] = scene;
  }

  const interludes = {};
  for (const r of CFG.interludes) {
    const effect = {};
    const stats = pick(r, STATS), resources = pick(r, RES), relations = pick(r, REL, 'rel_');
    if (Object.keys(stats).length) effect.stats = stats;
    if (Object.keys(resources).length) effect.resources = resources;
    if (Object.keys(relations).length) effect.relations = relations;
    if (split(r.trained).length) effect.trained = split(r.trained);
    if (split(r.traits).length) effect.traits = split(r.traits);
    if (r.fate != null) effect.fate = r.fate;
    (interludes[r.act] ||= [])[r.slot - 1] = { id: r.id, title: r.title, description: r.description, effect };
  }

  const story = {
    metadata: copy(CFG.meta),
    origins: CFG.origins.map(o => ({ id: o.id, title: o.title, description: o.description, bonuses: { stats: { [o.stat]: o.statBonus } }, trained: split(o.trained), trait: o.trait })),
    characters: Object.fromEntries(CFG.characters.map(c => [c.id, { name: c.name, role: c.role, pronoun: c.pronoun, look: c.look, description: c.description }])),
    acts: CFG.acts.map(a => ({ id: a.id, title: a.title, kicker: a.kicker, location: a.location, summary: a.summary })),
    scenes,
    interludes,
    endings: copy(CFG.endings)
  };
  return freeze(story);
});
