/* 旧影回声 · 纯规则（无 DOM），数值全部来自 window.GAME_CONFIG */
(function (global) {
  'use strict';
  const C = () => global.GAME_CONFIG;

  // 文案模板：{key} 占位替换
  function text(key, vars) {
    const row = C().text.find(r => r.key === key);
    if (!row) return key;
    return String(row.text).replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? vars[k] : ''));
  }

  function getEvidence(id) {
    return C().evidence.find(e => e.id === id) || null;
  }

  function createState() {
    return { exposure: C().exposure.initial, selected: null, fact: null, inference: null, checked: false, archived: false };
  }

  // 曝光是否处于可识别区间（闭区间）
  function isReadable(exposure) {
    const e = C().exposure;
    return exposure >= e.readableMin && exposure <= e.readableMax;
  }

  // 曝光反馈类型：readable / over / dark
  function exposureZone(exposure) {
    if (isReadable(exposure)) return 'readable';
    if (exposure > C().exposure.readableMax) return 'over';
    return 'dark';
  }

  // 灯箱亮度系数：base + 曝光 / divisor
  function exposureVisual(exposure) {
    const e = C().exposure;
    return e.visualBase + exposure / e.visualDivisor;
  }

  // 核对：曝光可识别，且事实槽放的是 fact、推断槽放的是 inference
  function checkEvidence(state) {
    const fact = getEvidence(state.fact);
    const inference = getEvidence(state.inference);
    if (!fact || !inference) return false;
    return isReadable(state.exposure) && fact.type === 'fact' && inference.type === 'inference';
  }

  // 进度条：取当前达到的最高阶段
  function progressStep(state) {
    const p = C().progress;
    if (state.archived) return p.archived;
    if (state.checked) return p.checked;
    if (state.fact && state.inference) return p.classified;
    if (isReadable(state.exposure)) return p.readable;
    return p.initial;
  }

  global.JiuyingRules = { text, getEvidence, createState, isReadable, exposureZone, exposureVisual, checkEvidence, progressStep };
})(window);
