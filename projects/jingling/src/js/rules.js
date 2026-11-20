/* 精灵巡游季 · 纯规则（无 DOM），内容与数值全部来自 window.GAME_CONFIG */
(function (global) {
  'use strict';
  const C = () => global.GAME_CONFIG;

  // 文案模板：{key} 占位替换
  function text(key, vars) {
    const row = C().text.find(r => r.key === key);
    if (!row) return key;
    return String(row.text).replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? vars[k] : ''));
  }

  function getRumor(id) {
    return C().rumors.find(r => r.id === id) || null;
  }

  // 挑战正确顺序：按 challenge-actions.csv 的 step 升序
  function challengeSequence() {
    return C().challengeActions.slice().sort((a, b) => a.step - b.step).map(a => a.id);
  }

  function createState(rumorId) {
    return { rumor: rumorId || C().flow.defaultRumor, resonance: null, partnered: false, challenge: [], complete: false };
  }

  // 尝试结伴：共鸣方式与传闻的 correctResonance 一致即成功；失败返回该传闻的提示
  function tryPartner(rumorId, resonanceId) {
    const rumor = getRumor(rumorId);
    const ok = !!rumor && resonanceId === rumor.correctResonance;
    return { ok, spirit: rumor ? rumor.spirit : '', hint: rumor ? rumor.failHint : '' };
  }

  // 挑战一步：按错任意一步清空重来；返回新的步骤数组（不修改入参）
  function applyChallengeAction(challenge, actionId) {
    const seq = challengeSequence();
    const expected = seq[challenge.length];
    if (actionId !== expected) return { ok: false, challenge: [], complete: false };
    const next = challenge.concat(actionId);
    return { ok: true, challenge: next, complete: next.length === seq.length };
  }

  // 图鉴收集进度：collected 为已收录的传闻 id 列表（切换传闻不清空）
  function collectionSummary(collected) {
    const total = C().rumors.length;
    const count = C().rumors.filter(r => collected.includes(r.id)).length;
    return { count, total, all: count === total };
  }

  // 共鸣进度圆环
  function scoreValue(state) {
    const s = C().flow.score;
    return state.complete ? s.complete : state.partnered ? s.partnered : state.resonance ? s.resonance : s.initial;
  }

  // 顶部进度条：结伴后按完成步骤数累加
  function progressValue(state) {
    const p = C().flow.progress;
    return state.complete ? p.complete
      : state.partnered ? p.partneredBase + state.challenge.length * p.perStep
      : state.resonance ? p.resonance : p.initial;
  }

  global.JinglingRules = { text, getRumor, challengeSequence, createState, tryPartner, applyChallengeAction, collectionSummary, scoreValue, progressValue };
})(window);
