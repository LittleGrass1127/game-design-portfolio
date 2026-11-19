/* D20 规则核心：检定、改口、成败结算、成长、夜航奖励、结局判定与存档回放校验。纯逻辑，无 DOM。 */
(function (root) {
  'use strict';
  const CFG = root.GAME_CONFIG;
  if (!CFG) throw new Error('缺少 GAME_CONFIG，请先加载 config.generated.js');
  const R = CFG.rules;
  // 属性 / 资源 / 同伴关系：来自 stats.csv、resources.csv、characters.csv
  const STATS = CFG.stats.map(s => s.id);
  const RELATIONS = CFG.characters.filter(c => c.ally).map(c => c.id);
  const LABELS = Object.fromEntries([...CFG.stats.map(s => [s.id, s.label]), ...CFG.resources.map(r => [r.id, r.label]), ...CFG.characters.filter(c => c.ally).map(c => [c.id, c.name])]);
  const LIMITS = Object.fromEntries(CFG.resources.map(r => [r.id, [r.min, r.max]]));
  const STAT_RANGE = Object.fromEntries(CFG.stats.map(s => [s.id, [s.min, s.max]]));
  // 夜航档位奖励：race-tiers.csv
  const RACE_REWARD_KEYS = ['leverage', 'reputation', 'pressure'];
  const RACE_LEG_IDS = CFG.raceLegs.map(l => l.id);
  const MAX_ABSORBED = CFG.race.traffic.total;
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const list = value => value == null ? [] : Array.isArray(value) ? value : [value];
  const fail = error => ({ ok: false, error });
  const levelFor = xp => 1 + R.levelThresholds.filter(n => xp >= n).length;
  const stable = value => Array.isArray(value) ? '[' + value.map(stable).join(',') + ']' : plain(value) ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}' : JSON.stringify(value);
  function safeTree(value, depth = 0, seen = new Set()) {
    if (depth > 24) return false;
    if (value == null || typeof value === 'boolean') return true;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'string') return value.length <= 20000;
    if (!Array.isArray(value) && !plain(value)) return false;
    if (seen.has(value) || Object.keys(value).length > 500) return false;
    seen.add(value);
    const valid = Object.keys(value).every(key => !['__proto__', 'prototype', 'constructor'].includes(key) && safeTree(value[key], depth + 1, seen));
    seen.delete(value); return valid;
  }
  function firstScene(story) { return story.startScene || story.startSceneId || Object.keys(story.scenes).find(id => story.scenes[id].act === 1); }
  function meets(condition, state) {
    if (condition == null || condition === true) return true;
    if (condition === false) return false;
    if (Array.isArray(condition)) return condition.every(c => meets(c.condition || c, state));
    if (!plain(condition)) return false;
    if (condition.all && !condition.all.every(c => meets(c, state))) return false;
    if (condition.any && !condition.any.some(c => meets(c, state))) return false;
    if (condition.not && meets(condition.not, state)) return false;
    if (condition.condition && !meets(condition.condition, state)) return false;
    let value, hasLeaf = false;
    if (condition.stat) { value = state.stats[condition.stat]; hasLeaf = true; }
    if (condition.resource) { value = state.resources[condition.resource]; hasLeaf = true; }
    if (condition.relation) { value = state.relations[condition.relation]; hasLeaf = true; }
    if (condition.flag) { value = Boolean(state.flags[condition.flag]); hasLeaf = true; }
    if (condition.item) { value = state.items.includes(condition.item); hasLeaf = true; }
    if (condition.trait) { value = state.traits.includes(condition.trait); hasLeaf = true; }
    if (condition.trained) { value = state.trained.includes(condition.trained); hasLeaf = true; }
    if (!hasLeaf) return Boolean(condition.all || condition.any || condition.not || condition.condition || Object.keys(condition).every(k => ['description', 'reason', 'label', 'always'].includes(k))) && condition.always !== false;
    if (value === undefined) return false;
    if (condition.gte !== undefined && !(value >= condition.gte)) return false;
    if (condition.lte !== undefined && !(value <= condition.lte)) return false;
    if (condition.min !== undefined && !(value >= condition.min)) return false;
    if (condition.max !== undefined && !(value <= condition.max)) return false;
    if (condition.eq !== undefined && value !== condition.eq) return false;
    if (condition.value !== undefined && !condition.op && value !== condition.value) return false;
    if (condition.op) {
      const target = condition.value;
      if (!({ gte: value >= target, lte: value <= target, eq: value === target, gt: value > target, lt: value < target, ne: value !== target })[condition.op]) return false;
    }
    const compared = ['gte', 'lte', 'min', 'max', 'eq', 'value', 'op'].some(k => condition[k] !== undefined);
    return compared || typeof value !== 'boolean' ? true : value;
  }
  function describe(condition) {
    if (!condition) return '';
    if (condition.description || condition.reason || condition.label) return condition.description || condition.reason || condition.label;
    if (Array.isArray(condition)) return condition.map(c => describe(c.condition || c)).join('、');
    if (condition.all) return condition.all.map(describe).join('且');
    if (condition.any) return condition.any.map(describe).join('或');
    if (condition.not) return '不满足「' + describe(condition.not) + '」';
    const key = condition.stat || condition.resource || condition.relation;
    if (key) return (LABELS[key] || key) + (condition.gte !== undefined || condition.min !== undefined ? '≥' + (condition.gte ?? condition.min) : condition.lte !== undefined || condition.max !== undefined ? '≤' + (condition.lte ?? condition.max) : '=' + (condition.eq ?? condition.value ?? '指定值'));
    return condition.flag ? '经历「' + condition.flag + '」' : condition.item ? '持有「' + condition.item + '」' : condition.trait ? '拥有「' + condition.trait + '」' : condition.trained ? '受训于' + (LABELS[condition.trained] || condition.trained) : '特定经历';
  }
  function activeReasons(spec, state) {
    if (!spec) return [];
    return list(spec).filter(entry => meets(entry.condition || entry, state)).map(entry => entry.reason || describe(entry.condition || entry));
  }
  function die(state) {
    let value;
    do {
      state.rngState = (state.rngState + 0x6D2B79F5) >>> 0;
      let t = state.rngState;
      t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      value = (t ^ t >>> 14) >>> 0;
    } while (value >= 4294967280);
    return value % 20 + 1;
  }
  function flagsObject(value) { return Array.isArray(value) ? Object.fromEntries(value.map(key => [key, true])) : typeof value === 'string' ? { [value]: true } : value || {}; }
  function resourceDelta(before, after) { return Object.fromEntries(Object.keys(LIMITS).map(key => [key, after.resources[key] - before.resources[key]]).filter(([, value]) => value !== 0)); }

  class SunD20Engine {
    constructor(story, options = {}) {
      if (!story || !story.scenes || !Array.isArray(story.origins) || !Array.isArray(story.endings) || !firstScene(story)) throw new Error('故事数据不完整。');
      this.story = story;
      if (options.state !== undefined) {
        const candidate = clone(options.state);
        // v1 narrative saves predate the playable travel layer.  Treat the
        // missing list as an empty travel history so existing local saves keep
        // working after the action update.
        if (candidate && candidate.version === 1 && candidate.races === undefined) candidate.races = [];
        const checked = SunD20Engine.validate(story, candidate);
        if (!checked.valid) throw new Error(checked.error);
        this.state = candidate;
      } else this.state = SunD20Engine.newState(story, options.seed);
    }
    static newState(story, seed = R.defaultSeed) {
      if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) throw new Error('种子必须是无符号32位整数。');
      return { version: 1, seed, rngState: seed, phase: 'origin', originId: null,
        stats: Object.fromEntries(CFG.stats.map(s => [s.id, s.start])), trained: [], traits: [],
        resources: Object.fromEntries(CFG.resources.map(r => [r.id, r.start])),
        relations: Object.fromEntries(RELATIONS.map(k => [k, R.relationStart])), flags: {}, items: [], fate: R.fateStart,
        act: 1, sceneId: firstScene(story), sceneIndex: 0, xp: 0, level: 1, training: 0, completedChecks: 0,
        pending: null, history: [], races: [], journal: [], interludeAfter: null, nextSceneId: null, endingId: null };
    }
    static chance(params = {}) {
      const dc = Number(params.dc), bonus = Number(params.bonus ?? params.modifier ?? ((params.stat || 0) + (params.proficiency || 0) + (params.situational || 0)));
      if (!Number.isFinite(dc) || !Number.isFinite(bonus)) return 0;
      const mode = params.mode || (params.advantage && !params.disadvantage ? 'advantage' : params.disadvantage && !params.advantage ? 'disadvantage' : 'normal');
      let successes = 0, cases = 0;
      for (let first = 1; first <= 20; first++) for (let second = 1; second <= (mode === 'normal' ? 1 : 20); second++) {
        const kept = mode === 'advantage' ? Math.max(first, second) : mode === 'disadvantage' ? Math.min(first, second) : first;
        cases++; if (kept === 20 || (kept !== 1 && kept + bonus >= dc)) successes++;
      }
      return successes / cases;
    }
    static validate(story, state) {
      try {
        const candidate = clone(state);
        if (candidate && candidate.version === 1 && candidate.races === undefined) candidate.races = [];
        if (!safeTree(candidate) || !plain(candidate) || candidate.version !== 1 || !Number.isInteger(candidate.seed) || candidate.seed < 0 || candidate.seed > 0xFFFFFFFF || !Array.isArray(candidate.journal) || candidate.journal.length > 128 || !Array.isArray(candidate.races) || candidate.races.length > RACE_LEG_IDS.length) throw new Error('存档结构无效。');
        if (JSON.stringify(candidate).length > 220000) throw new Error('存档超过合理长度。');
        const replay = new SunD20Engine(story, { seed: candidate.seed });
        for (const action of candidate.journal) {
          if (!plain(action) || typeof action.type !== 'string') throw new Error('存档行动记录无效。');
          let result;
          if (action.type === 'origin' && Object.keys(action).length === 2) result = replay.chooseOrigin(action.id);
          else if (action.type === 'check' && Object.keys(action).length === 2) result = replay.beginCheck(action.id);
          else if (action.type === 'accept' && Object.keys(action).length === 1) result = replay.acceptRoll();
          else if (action.type === 'reroll' && Object.keys(action).length === 1) result = replay.reroll();
          else if (action.type === 'train' && Object.keys(action).length === 2) result = replay.train(action.id);
          else if (action.type === 'race' && Object.keys(action).length === 5) result = replay.applyRaceResult(action.id, { absorbed: action.absorbed, maxCombo: action.maxCombo, tier: action.tier });
          else throw new Error('存档包含未知行动。');
          if (!result.ok) throw new Error('存档行动顺序无效：' + result.error);
        }
        if (stable(replay.state) !== stable(candidate)) throw new Error('存档资源、骰面或进度与行动记录不一致。');
        return { valid: true, ok: true, errors: [], error: null };
      } catch (error) { const message = error instanceof Error ? error.message : '存档无效。'; return { valid: false, ok: false, errors: [message], error: message }; }
    }
    static restore(story, json) {
      if (typeof json !== 'string' || json.length > 220000) throw new Error('存档文本无效。');
      let state; try { state = JSON.parse(json); } catch (_) { throw new Error('存档不是有效JSON。'); }
      return new SunD20Engine(story, { state });
    }
    serialize() { return JSON.stringify(this.state); }
    currentScene() { return this.story.scenes[this.state.sceneId] || null; }
    _commit(state, action) { state.journal.push(action); this.state = state; }
    _effect(state, effect = {}) {
      for (const key of STATS) if (Number.isFinite(effect.stats?.[key])) state.stats[key] = clamp(state.stats[key] + Math.trunc(effect.stats[key]), ...STAT_RANGE[key]);
      for (const key of Object.keys(LIMITS)) if (Number.isFinite(effect.resources?.[key])) state.resources[key] = clamp(state.resources[key] + Math.trunc(effect.resources[key]), ...LIMITS[key]);
      for (const key of RELATIONS) if (Number.isFinite(effect.relations?.[key])) state.relations[key] = clamp(state.relations[key] + Math.trunc(effect.relations[key]), ...R.relationRange);
      for (const skill of list(effect.trained)) if (STATS.includes(skill) && !state.trained.includes(skill)) state.trained.push(skill);
      for (const trait of list(effect.traits)) if (typeof trait === 'string' && trait.length <= 80 && !state.traits.includes(trait)) state.traits.push(trait);
      for (const item of list(effect.item || effect.items)) if (typeof item === 'string' && item.length <= 80 && !state.items.includes(item)) state.items.push(item);
      for (const [flag, value] of Object.entries(flagsObject(effect.flag || effect.flags))) if (typeof value === 'boolean' && flag.length <= 80 && !['__proto__', 'prototype', 'constructor'].includes(flag)) state.flags[flag] = value;
      if (Number.isFinite(effect.fate)) state.fate = clamp(state.fate + Math.trunc(effect.fate), ...R.fateRange);
      if (state.resources.pressure >= R.crisisPressure) state.flags.crisis = true;
    }
    chooseOrigin(id) {
      if (this.state.phase !== 'origin') return fail('出身已经确定。');
      const origin = this.story.origins.find(o => o.id === id);
      if (!origin) return fail('请选择有效出身。');
      const state = clone(this.state); state.originId = id;
      this._effect(state, { ...(origin.bonuses || {}), trained: origin.trained, traits: list(origin.trait || origin.traits) });
      state.phase = 'scene'; state.act = this.story.scenes[state.sceneId].act;
      this._commit(state, { type: 'origin', id }); return { ok: true, state: this.state };
    }
    _view(choice, state = this.state) {
      const stat = state.stats[choice.skill] || 0;
      const proficiency = state.trained.includes(choice.skill) ? R.proficiency.base + Math.floor((state.level - 1) / R.proficiency.levelsPerStep) : 0;
      const modifiers = [{ label: LABELS[choice.skill] || choice.skill, reason: '人物属性', value: stat }, { label: '熟练', reason: state.trained.includes(choice.skill) ? '该技能已受训' : '该技能未受训', value: proficiency }];
      for (const modifier of list(choice.modifier)) {
        if (typeof modifier === 'number' && Number.isFinite(modifier)) modifiers.push({ label: '情境', reason: '情境修正', value: clamp(Math.trunc(modifier), ...R.modifierRange) });
        else if (modifier && Number.isFinite(modifier.value) && meets(modifier.condition, state)) modifiers.push({ label: modifier.reason || '情境', reason: modifier.reason || '情境修正', value: clamp(Math.trunc(modifier.value), ...R.modifierRange) });
      }
      const advantageReasons = activeReasons(choice.advantageIf, state), disadvantageReasons = activeReasons(choice.disadvantageIf, state);
      const mode = advantageReasons.length && !disadvantageReasons.length ? 'advantage' : disadvantageReasons.length && !advantageReasons.length ? 'disadvantage' : 'normal';
      const available = STATS.includes(choice.skill) && Number.isInteger(choice.dc) && choice.dc >= R.dcRange[0] && choice.dc <= R.dcRange[1] && meets(choice.required, state);
      const bonus = modifiers.reduce((sum, modifier) => sum + modifier.value, 0);
      const formula = 'D20' + modifiers.filter(m => m.value !== 0).map(m => (m.value >= 0 ? ' + ' : ' − ') + Math.abs(m.value) + '（' + m.label + '）').join('') + ' ≥ DC ' + choice.dc;
      const reason = !available ? '需要：' + describe(choice.required) : advantageReasons.length && disadvantageReasons.length ? '优势与劣势相抵' : mode === 'advantage' ? '优势：' + advantageReasons.join('；') : mode === 'disadvantage' ? '劣势：' + disadvantageReasons.join('；') : '普通检定';
      return { ...choice, available, reason, chance: SunD20Engine.chance({ dc: choice.dc, bonus, mode }), mode, modifiers, formula, bonus, stat, proficiency, advantageReasons, disadvantageReasons };
    }
    choices() { return (this.currentScene()?.choices || []).map(choice => this._view(choice)); }
    _roll(state, choice) {
      const view = this._view(choice, state), dice = [die(state)];
      if (view.mode !== 'normal') dice.push(die(state));
      const kept = view.mode === 'advantage' ? Math.max(...dice) : view.mode === 'disadvantage' ? Math.min(...dice) : dice[0];
      const critical = kept === 20 ? 'success' : kept === 1 ? 'failure' : null;
      return { dice, kept, total: kept + view.bonus, dc: choice.dc, success: kept === 20 || (kept !== 1 && kept + view.bonus >= choice.dc), critical, mode: view.mode, breakdown: clone(view.modifiers), bonus: view.bonus, formula: view.formula };
    }
    beginCheck(choiceId) {
      if (this.state.phase !== 'scene' || this.state.pending) return fail('请先完成当前检定或选择成长。');
      if (this.state.completedChecks >= R.maxChecks) return fail('本轮行动数量已达安全上限。');
      const choice = this.currentScene()?.choices.find(c => c.id === choiceId);
      if (!choice) return fail('这个选项不存在。');
      const view = this._view(choice); if (!view.available) return fail(view.reason);
      const state = clone(this.state), roll = this._roll(state, choice);
      state.pending = { sceneId: state.sceneId, choiceId, roll, rerolled: false }; state.phase = 'check';
      this._commit(state, { type: 'check', id: choiceId });
      return { ok: true, roll: clone(roll), choice: view };
    }
    reroll() {
      const pending = this.state.pending;
      if (this.state.phase !== 'check' || !pending || pending.roll.success || pending.roll.critical || pending.rerolled || this.state.fate <= 0) return fail('改口只能用于一次非大失败的失败检定，且需要改口次数。');
      const choice = this.story.scenes[pending.sceneId].choices.find(c => c.id === pending.choiceId);
      const state = clone(this.state); state.fate--;
      const roll = this._roll(state, choice);
      state.pending.roll = roll; state.pending.rerolled = true;
      this._commit(state, { type: 'reroll' }); return { ok: true, roll: clone(roll), choice: this._view(choice) };
    }
    _outcome(choice, roll) {
      const base = clone(roll.success ? choice.success : choice.failure);
      const special = roll.critical === 'success' ? choice.criticalSuccess : roll.critical === 'failure' ? choice.criticalFailure : null;
      if (special) return { ...base, ...clone(special), delta: { ...base.delta, ...special.delta }, relation: { ...base.relation, ...special.relation }, flags: { ...flagsObject(base.flags), ...flagsObject(special.flags) }, item: [...new Set([...list(base.item), ...list(special.item)])] };
      if (roll.critical && base.delta) for (const [key, value] of Object.entries(base.delta)) {
        const favorable = key === 'pressure' ? value < 0 : value > 0;
        if ((roll.success && favorable) || (!roll.success && !favorable)) base.delta[key] = value >= 0 ? Math.ceil(value * R.criticalMultiplier) : Math.floor(value * R.criticalMultiplier);
      }
      return base;
    }
    acceptRoll() {
      const pending = this.state.pending;
      if (this.state.phase !== 'check' || !pending) return fail('没有等待确认的检定。');
      const scene = this.story.scenes[pending.sceneId], choice = scene.choices.find(c => c.id === pending.choiceId);
      const outcome = this._outcome(choice, pending.roll), nextId = outcome.next || choice.next || scene.next;
      if (nextId !== 'END' && (!nextId || !this.story.scenes[nextId])) return fail('故事后续节点无效。');
      const state = clone(this.state), before = clone(this.state);
      this._effect(state, { resources: outcome.delta, relations: outcome.relation, flags: outcome.flags, item: outcome.item });
      state.completedChecks++; state.sceneIndex++;
      state.xp = Math.min(R.xp.cap, state.xp + (pending.roll.success ? R.xp.success : R.xp.failure) + (pending.roll.critical ? R.xp.criticalBonus : 0)); state.level = levelFor(state.xp);
      state.history.push({ sceneId: pending.sceneId, choiceId: pending.choiceId, roll: clone(pending.roll), rerolled: pending.rerolled, text: outcome.text, delta: resourceDelta(before, state), next: nextId });
      state.pending = null;
      let nextType;
      if (nextId === 'END') {
        state.phase = 'ending'; const ending = this.story.endings.find(e => meets(e.condition, state)) || this.story.endings[this.story.endings.length - 1];
        state.endingId = ending.id; nextType = 'ending';
      } else {
        const next = this.story.scenes[nextId];
        if (next.act > scene.act && scene.act < 4) {
          state.phase = 'interlude'; state.interludeAfter = scene.act; state.nextSceneId = nextId; nextType = 'interlude';
        } else { state.phase = 'scene'; state.sceneId = nextId; state.act = next.act; nextType = 'scene'; }
      }
      const stateDelta = { resources: resourceDelta(before, state), relations: Object.fromEntries(RELATIONS.map(key => [key, state.relations[key] - before.relations[key]]).filter(([, value]) => value !== 0)), fate: state.fate - before.fate, xp: state.xp - before.xp, level: state.level - before.level, flags: Object.keys(state.flags).filter(key => state.flags[key] !== before.flags[key]), items: state.items.filter(item => !before.items.includes(item)) };
      this._commit(state, { type: 'accept' });
      return { ok: true, result: { ...clone(outcome), success: pending.roll.success, critical: pending.roll.critical, roll: clone(pending.roll), choiceId: choice.id, delta: stateDelta.resources }, stateDelta, nextType };
    }
    interludeChoices() { return this.state.phase === 'interlude' ? clone(this.story.interludes?.[this.state.interludeAfter] || []) : []; }
    train(id) {
      if (this.state.phase !== 'interlude' || this.state.training >= R.maxTraining) return fail('当前不在成长阶段。');
      const reward = (this.story.interludes?.[this.state.interludeAfter] || []).find(r => r.id === id);
      if (!reward) return fail('请选择有效的成长奖励。');
      const state = clone(this.state); this._effect(state, reward.effect); state.training++;
      state.sceneId = state.nextSceneId; state.act = this.story.scenes[state.sceneId].act;
      state.nextSceneId = null; state.interludeAfter = null; state.phase = 'scene';
      this._commit(state, { type: 'train', id }); return { ok: true, reward: clone(reward), state: this.state };
    }
    applyRaceResult(id, result = {}) {
      if (this.state.phase !== 'scene' || this.state.pending) return fail('只能在前往下一幕时结算夜航。');
      const leg = RACE_LEG_IDS.indexOf(String(id)) + 1;
      if (leg < 1 || this.state.act !== leg + 1) return fail('这段夜航与当前幕次不符。');
      if (this.state.races.some(entry => entry.id === id)) return fail('这段夜航已经结算。');
      const absorbed = result.absorbed, maxCombo = result.maxCombo, tier = result.tier;
      if (!Number.isInteger(absorbed) || absorbed < 0 || absorbed > MAX_ABSORBED || !Number.isInteger(maxCombo) || maxCombo < 0 || maxCombo > absorbed || !CFG.raceTiers.some(t => t.tier === tier)) return fail('夜航结果无效。');
      const state = clone(this.state), before = clone(this.state), reward = SunD20Engine.raceReward(tier, leg);
      this._effect(state, reward);
      state.races.push({ id, absorbed, maxCombo, tier });
      this._commit(state, { type: 'race', id, absorbed, maxCombo, tier });
      return { ok: true, reward: clone(reward), stateDelta: { resources: resourceDelta(before, state), fate: state.fate - before.fate }, state: this.state };
    }
    // 夜航档位 -> 结算奖励（race-tiers.csv 一行）
    static raceReward(tier, leg) {
      const row = CFG.raceTiers.find(t => t.tier === tier);
      const reward = { resources: Object.fromEntries(RACE_REWARD_KEYS.filter(k => row[k] != null).map(k => [k, row[k]])) };
      if (row.fate != null) reward.fate = row.fate;
      reward.item = row.itemPrefix + leg;
      return reward;
    }
    ending() { return this.state.phase === 'ending' ? this.story.endings.find(e => e.id === this.state.endingId) || null : null; }
  }
  root.SunD20Engine = SunD20Engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = SunD20Engine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
