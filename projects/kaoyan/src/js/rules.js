/* 中国式考研 · 规则核心（原 C# 规则核心的 JS 移植，纯逻辑，无 DOM）。
   参数来自 config/ 配置表（原 Unity 工程 exam_config.json 拆分），经 buildExamConfig 组装。
   同一份文件可在浏览器与 Node 中运行。 */
(function (root) {
  'use strict';
  const SUBJECT_KEYS = ['politics', 'english', 'math', 'major'];
  // 把 config/ 下的多张配置表（GAME_CONFIG）组装成规则引擎使用的结构（与原 exam_config.json 同形）
  function buildExamConfig(g) {
    const base = g.examConfig, subjects = g.subjects.slice().sort((a, b) => a.index - b.index);
    const keys = subjects.map(s => s.key);
    const byIndex = list => list.slice().sort((a, b) => a.index - b.index);
    const nums = (row, prefix) => keys.map(k => row[prefix + k]);
    return {
      weeks: base.weeks, slots: base.slots, seed: base.seed,
      initialEnergy: base.initialEnergy, initialStress: base.initialStress, initialMoney: base.initialMoney,
      weeklyExpense: base.weeklyExpense, weeklyEnergy: base.weeklyEnergy, weeklyStress: base.weeklyStress,
      resourceMax: base.resourceMax, eventEveryWeeks: base.eventEveryWeeks, efficiency: Object.assign({}, base.efficiency),
      subjectNames: subjects.map(s => s.name), caps: subjects.map(s => s.cap),
      backgrounds: byIndex(g.backgrounds).map(b => ({ name: b.name, description: b.description, scores: nums(b, '') })),
      goals: byIndex(g.goals).map(x => ({ name: x.name, description: x.description, total: x.total, minimums: nums(x, 'min_'), tagline: x.tagline })),
      actions: g.actions.map(a => ({ id: a.id, name: a.name, description: a.description, subject: a.subject, gain: a.gain,
        energy: a.energy, stress: a.stress, cost: a.cost, income: a.income, category: a.category, badge: a.badge })),
      events: byIndex(g.events).map(e => ({ title: e.title, body: e.body, symbol: e.symbol,
        options: g.eventOptions.filter(o => o.event === e.index).sort((a, b) => a.option - b.option).map(o => ({
          text: o.text, description: o.description, money: o.money, energy: o.energy, stress: o.stress, scores: nums(o, '') })) }))
    };
  }
  const f = Math.fround;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(x, hi));
  const copy = value => JSON.parse(JSON.stringify(value));
  // C# casts Single to Decimal (seven significant digits) before rounding.
  const rounded = value => {
    const decimal = Number(f(value).toPrecision(7));
    return Math.sign(decimal) * Math.round((Math.abs(decimal) + Number.EPSILON) * 10) / 10;
  };
  const fmt = value => String(rounded(value));
  function makeOrder(count, seed) {
    const order = Array.from({ length: count }, (_, i) => i);
    let rng = seed >>> 0;
    for (let i = count - 1; i > 0; i--) {
      rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
      const j = rng % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }
  const finite = x => typeof x === 'number' && Number.isFinite(x);
  const boundedText = x => typeof x === 'string' && x.length <= 4000;
  function validSnapshot(c, s) {
    return s && typeof s === 'object' && Number.isInteger(s.week) && s.week >= 1 && s.week <= c.weeks + 1 &&
      Number.isInteger(s.money) && Math.abs(s.money) <= 2147483647 &&
      finite(s.energy) && s.energy >= 0 && s.energy <= c.resourceMax && finite(s.stress) && s.stress >= 0 && s.stress <= c.resourceMax &&
      Array.isArray(s.scores) && s.scores.length === 4 && s.scores.every((v, i) => finite(v) && v >= 0 && v <= c.caps[i]) &&
      Number.isInteger(s.eventIndex) && s.eventIndex >= -1 && s.eventIndex < c.events.length && typeof s.finished === 'boolean';
  }
  function validJournal(c, rows) {
    if (!Array.isArray(rows) || rows.length > c.weeks * 2) return false;
    return rows.every(x => {
      if (!x || typeof x !== 'object' || !['week', 'event'].includes(x.type) || !Number.isInteger(x.week) ||
          x.week < 1 || x.week > c.weeks || !validSnapshot(c, x.before) || !validSnapshot(c, x.after)) return false;
      if (x.type === 'week') return Array.isArray(x.plan) && x.plan.length === c.slots && x.plan.every(id => c.actions.some(a => a.id === id)) &&
        Array.isArray(x.steps) && x.steps.length === c.slots && x.steps.every((step, i) => step && step.id === x.plan[i] &&
          boundedText(step.name) && boundedText(step.detail) && finite(step.gain) && finite(step.efficiency) && step.efficiency >= 0 && step.efficiency <= 1 &&
          Number.isInteger(step.subject) && step.subject >= -1 && step.subject < 4 && validSnapshot(c, step.before) && validSnapshot(c, step.after));
      const event = c.events[x.eventIndex];
      return Number.isInteger(x.eventIndex) && !!event && Number.isInteger(x.option) && x.option >= 0 && x.option < event.options.length &&
        boundedText(x.title) && boundedText(x.text) && boundedText(x.description);
    });
  }
  function validateConfig(c) {
    if (!c || !Number.isInteger(c.weeks) || c.weeks < 1 || c.weeks > 100 || c.slots !== 3 ||
        !Array.isArray(c.caps) || c.caps.length !== 4 || !c.caps.every(x => finite(x) && x > 0) ||
        !Array.isArray(c.actions) || !c.actions.length || !Array.isArray(c.goals) || !c.goals.length ||
        !Array.isArray(c.backgrounds) || !c.backgrounds.length || !Array.isArray(c.events) ||
        !Array.isArray(c.subjectNames) || c.subjectNames.length !== 4 || !finite(c.resourceMax) || c.resourceMax <= 0 ||
        !Number.isInteger(c.eventEveryWeeks) || c.eventEveryWeeks < 1 || !c.efficiency || !finite(c.efficiency.base)) throw new Error('配置不完整');
  }
  function validateState(config, state) {
    try { validateConfig(config); } catch (e) { return { valid: false, error: e.message }; }
    const bad = error => ({ valid: false, error: error || '存档不兼容或已损坏。' });
    if (!state || typeof state !== 'object' || Array.isArray(state) || state.version !== 1) return bad();
    for (const [key, min, max] of [['week', 1, config.weeks + 1], ['background', 0, config.backgrounds.length - 1],
      ['goal', 0, config.goals.length - 1], ['seed', -2147483648, 2147483647], ['money', -2147483648, 2147483647],
      ['eventIndex', -1, config.events.length - 1]]) {
      if (!Number.isInteger(state[key]) || state[key] < min || state[key] > max) return bad('存档字段无效：' + key);
    }
    if (typeof state.finished !== 'boolean' || state.finished !== (state.week === config.weeks + 1)) return bad('存档进度不一致。');
    if (!finite(state.energy) || state.energy < 0 || state.energy > config.resourceMax || !finite(state.stress) || state.stress < 0 || state.stress > config.resourceMax) return bad('存档中的状态数值无效。');
    if (!Array.isArray(state.scores) || state.scores.length !== 4 || state.scores.some((x, i) => !finite(x) || x < 0 || x > config.caps[i])) return bad('存档成绩无效。');
    if (!Array.isArray(state.logs) || state.logs.length > 1000 || state.logs.some(x => typeof x !== 'string' || x.length > 4000)) return bad('存档日记无效。');
    const expected = makeOrder(config.events.length, state.seed);
    if (!Array.isArray(state.eventOrder) || state.eventOrder.length !== expected.length || expected.some((x, i) => x !== state.eventOrder[i])) return bad('存档事件顺序无效。');
    if (state.eventIndex >= 0 && (state.finished || state.week % config.eventEveryWeeks !== 0 || state.eventIndex !== expected[((state.week / config.eventEveryWeeks) - 1) % expected.length])) return bad('存档中的生活事件进度不一致。');
    if (state.lastPlan != null && (!Array.isArray(state.lastPlan) || state.lastPlan.length !== config.slots || state.lastPlan.some(id => !config.actions.some(a => a.id === id)))) return bad('存档中的上周安排无效。');
    if (state.journal != null && !validJournal(config, state.journal)) return bad('存档记录无效。');
    return { valid: true, error: '' };
  }
  function snapshot(s) {
    return { week: s.week, money: s.money, energy: s.energy, stress: s.stress,
      scores: s.scores.slice(), eventIndex: s.eventIndex, finished: s.finished };
  }
  class ExamEngine {
    constructor(config, state) {
      validateConfig(config);
      const checked = validateState(config, state);
      if (!checked.valid) throw new Error(checked.error);
      this.config = config;
      this.state = copy(state);
      if (!this.state.journal) this.state.journal = [];
    }
    static newGame(c, background, goal, seed = c.seed) {
      validateConfig(c);
      if (!Number.isInteger(background) || background < 0 || background >= c.backgrounds.length ||
          !Number.isInteger(goal) || goal < 0 || goal >= c.goals.length || !Number.isInteger(seed) || seed < -2147483648 || seed > 2147483647) throw new Error('请选择有效的起点与目标');
      return { version: 1, week: 1, background, goal, seed, scores: c.backgrounds[background].scores.slice(),
        energy: c.initialEnergy, stress: c.initialStress, money: c.initialMoney, eventIndex: -1, finished: false,
        eventOrder: makeOrder(c.events.length, seed), lastPlan: null, journal: [],
        logs: ['备考日记 / 最后十二周', '你的决定有据可查，考试不会追加隐藏随机扣分。'] };
    }
    // 学习效率 = min(1, 基础 + 斜率×精力) × (1 − max(0, 压力 − 阈值) × 斜率)，全程按 C# float 精度
    efficiency(s = this.state) {
      const e = this.config.efficiency;
      const energyFactor = Math.min(1, f(f(e.base) + f(f(e.energySlope) * f(s.energy))));
      const stressFactor = f(1 - f(Math.max(0, f(f(s.stress) - e.stressThreshold)) * f(e.stressSlope)));
      return f(energyFactor * stressFactor);
    }
    total(s = this.state) { return rounded(s.scores.reduce((sum, score) => f(sum + f(score)), 0)); }
    goal() { return this.config.goals[this.state.goal]; }
    isAdmitted() {
      return this.state.finished && this.total() >= this.goal().total && this.state.scores.every((v, i) => v >= this.goal().minimums[i]);
    }
    action(id) { return this.config.actions.find(a => a.id === id) || null; }
    preview(ids) {
      // 预览即结算：commit() 直接采用这里算出的 after，不存在第二套公式
      const result = { valid: false, error: '', after: copy(this.state), steps: [] }, max = this.config.resourceMax;
      if (this.state.finished) { result.error = '本轮备考已经结束。'; return result; }
      if (this.state.eventIndex >= 0) { result.error = '请先处理本周生活事件。'; return result; }
      if (!Array.isArray(ids) || ids.length !== this.config.slots) { result.error = '请安排完整的三个时段。'; return result; }
      for (let slot = 0; slot < ids.length; slot++) {
        const a = this.action(ids[slot]);
        if (!a) { result.error = '第 ' + (slot + 1) + ' 时段尚未安排。'; return result; }
        if (a.cost > 0 && result.after.money < a.cost) { result.error = '第 ' + (slot + 1) + ' 时段的预算不足；可先安排兼职或改为免费自习。'; return result; }
        const before = snapshot(result.after), efficiency = this.efficiency(result.after);
        let gain = 0;
        if (a.subject >= 0) {
          gain = rounded(f(f(a.gain) * efficiency));
          const old = f(result.after.scores[a.subject]);
          result.after.scores[a.subject] = rounded(clamp(f(old + f(gain)), 0, this.config.caps[a.subject]));
          gain = rounded(f(f(result.after.scores[a.subject]) - old));
        }
        result.after.money += a.income - a.cost;
        result.after.energy = clamp(f(f(result.after.energy) + f(a.energy)), 0, max);
        result.after.stress = clamp(f(f(result.after.stress) + f(a.stress)), 0, max);
        const benefit = a.subject >= 0 ? this.config.subjectNames[a.subject] + ' +' + fmt(gain) + ' 分 · 效率 ' + fmt(f(efficiency * 100)) + '%' : '恢复与生活安排';
        const detail = benefit + '\n精力 ' + fmt(result.after.energy) + ' / 压力 ' + fmt(result.after.stress) + ' / 余额 ¥' + result.after.money;
        result.steps.push({ id: a.id, name: a.name, detail, gain, subject: a.subject, efficiency, before, after: snapshot(result.after) });
      }
      result.after.money -= this.config.weeklyExpense;
      result.after.energy = clamp(f(f(result.after.energy) + f(this.config.weeklyEnergy)), 0, max);
      result.after.stress = clamp(f(f(result.after.stress) + f(this.config.weeklyStress)), 0, max);
      result.valid = true;
      return result;
    }
    commit(ids) {
      const p = this.preview(ids), before = copy(this.state);
      if (!p.valid) return { ok: false, error: p.error, before, after: copy(this.state), steps: p.steps };
      this.state = p.after;
      this.state.lastPlan = ids.slice();
      const changes = this.config.subjectNames.map((name, i) => name + ' +' + fmt(f(f(this.state.scores[i]) - f(before.scores[i])))).join(' · ');
      this.state.logs.push('第 ' + this.state.week + ' 周 / ' + changes + ' / 总分 ' + fmt(this.total()));
      this.state.logs.push('  ' + p.steps.map(x => x.name).join(' → '));
      if (this.state.money < 0) this.state.logs.push('  生活费已记账，欠款 ¥' + (-this.state.money) + '；兼职会优先补足余额。无额外隐藏惩罚。');
      this.state.journal.push({ type: 'week', week: before.week, plan: ids.slice(), steps: p.steps, before: snapshot(before), after: snapshot(this.state) });
      const every = this.config.eventEveryWeeks;
      if (this.state.week % every === 0 && this.config.events.length > 0)
        this.state.eventIndex = this.state.eventOrder[((this.state.week / every) - 1) % this.state.eventOrder.length];
      else this._advanceWeek();
      return { ok: true, error: '', before, after: copy(this.state), steps: p.steps };
    }
    pendingEvent() { return this.state.eventIndex >= 0 ? this.config.events[this.state.eventIndex] || null : null; }
    canChoose(option) {
      const e = this.pendingEvent();
      if (!e || !Number.isInteger(option) || option < 0 || option >= e.options.length) return false;
      return e.options[option].money >= 0 || this.state.money >= -e.options[option].money;
    }
    chooseEvent(option) {
      if (!this.canChoose(option)) return { ok: false, error: '该选项暂时无法负担，请选择另一项。' };
      const e = this.pendingEvent(), o = e.options[option], before = snapshot(this.state), eventIndex = this.state.eventIndex;
      this.state.money += o.money;
      this.state.energy = clamp(f(f(this.state.energy) + f(o.energy)), 0, this.config.resourceMax);
      this.state.stress = clamp(f(f(this.state.stress) + f(o.stress)), 0, this.config.resourceMax);
      if (o.scores) for (let i = 0; i < Math.min(4, o.scores.length); i++)
        this.state.scores[i] = rounded(clamp(f(f(this.state.scores[i]) + f(o.scores[i])), 0, this.config.caps[i]));
      this.state.logs.push('  生活事件 / ' + e.title + '：' + o.text + '（' + o.description + '）');
      this.state.journal.push({ type: 'event', week: this.state.week, eventIndex, title: e.title, option, text: o.text, description: o.description, before, after: snapshot(this.state) });
      this.state.eventIndex = -1;
      this._advanceWeek();
      return { ok: true, error: '', before, after: snapshot(this.state) };
    }
    _advanceWeek() {
      this.state.week++;
      if (this.state.week > this.config.weeks) {
        this.state.finished = true;
        this.state.logs.push('考场落笔 / ' + this.config.subjectNames.map((x, i) => x + ' ' + fmt(this.state.scores[i])).join(' · ') + ' / 总分 ' + fmt(this.total()));
      }
    }
  }
  Object.assign(ExamEngine, { rounded, copy, makeOrder, validateState, snapshot, clamp, buildExamConfig });
  root.ExamEngine = ExamEngine;
  root.KaoyanRules = { ExamEngine, buildExamConfig, validateState, makeOrder, rounded, SUBJECT_KEYS };
  root.validateState = validateState;
  if (typeof module !== 'undefined' && module.exports) module.exports = ExamEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
