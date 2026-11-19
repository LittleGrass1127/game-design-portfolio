/* 春风编花会：纯规则（无 DOM），全部数值取自 GAME_CONFIG */
(function (root) {
  'use strict';

  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  }

  function flowerMap(cfg) {
    const map = {};
    cfg.flowers.forEach(f => { map[f.id] = f; });
    return map;
  }

  // attribute-levels.csv -> 株高 / 香型的显示名
  function levelLabel(cfg, attr, level) {
    const row = cfg.attributeLevels.find(r => r.attr === attr && r.level === level);
    return row ? row.label : String(level);
  }

  // 花环统计量：颜色种数、株高种数、低株数、浓香数
  function stats(slots, cfg) {
    const map = flowerMap(cfg);
    const used = slots.filter(Boolean).map(id => map[id]);
    const s = cfg.scoring.stats;
    return {
      planted: used.length,
      colors: new Set(used.map(x => x.color)).size,
      heights: new Set(used.map(x => x.height)).size,
      low: used.filter(x => x.height === s.lowHeight).length,
      fragrant: used.filter(x => x.scent >= s.fragrantScentMin).length
    };
  }

  // 愿望命中：wishes.csv 每行 = 某统计量 >= min
  function wishHits(st, cfg) {
    return cfg.wishes.map(w => ({ id: w.id, hit: st[w.stat] >= w.min }));
  }

  function calculate(slots, cfg) {
    const st = stats(slots, cfg);
    if (!st.planted) return { harmony: 0, layers: 0, wishes: 0, total: 0 };
    const sc = cfg.scoring;
    const harmony = Math.min(sc.harmony.max, st.colors * sc.harmony.perColor + Math.min(st.planted, sc.harmony.plantedCap) * sc.harmony.perPlanted);
    const layers = Math.min(sc.layers.max, st.heights * sc.layers.perHeight + (st.low >= sc.layers.lowBonusMin ? sc.layers.lowBonus : 0));
    const wishes = wishHits(st, cfg).filter(w => w.hit).length;
    const w = sc.weights;
    return { harmony, layers, wishes, total: harmony * w.harmony + layers * w.layers + wishes / cfg.wishes.length * w.wishes };
  }

  // 点击落点：空则种当前花材，有花则拔除
  function toggleSlot(slots, index, flowerId) {
    const next = slots.slice();
    next[index] = next[index] ? null : flowerId;
    return next;
  }

  function emptySlots(cfg) {
    return Array(cfg.scoring.ring.slotCount).fill(null);
  }

  function canSubmit(slots, submitted, cfg) {
    return slots.filter(Boolean).length >= cfg.scoring.ring.minPlanted && !submitted;
  }

  // 提交判定：愿望全中且总分达标才算通过
  function submitVerdict(slots, cfg) {
    const score = calculate(slots, cfg);
    const p = cfg.scoring.pass;
    const wishesOk = !p.requireAllWishes || score.wishes === cfg.wishes.length;
    const pass = wishesOk && score.total >= p.minTotal;
    return { pass, tone: pass ? 'good' : 'warn', score };
  }

  // 落点在环上的位置（百分比），从正上方顺时针
  function slotPosition(i, cfg) {
    const r = cfg.scoring.ring;
    const angle = (Math.PI * 2 * i / r.slotCount) - Math.PI / 2;
    return { left: 50 + Math.cos(angle) * r.radiusPercent, top: 50 + Math.sin(angle) * r.radiusPercent };
  }

  function progress(slots, submitted, cfg) {
    const used = slots.filter(Boolean).length;
    const r = cfg.scoring.ring;
    return {
      value: submitted ? cfg.scoring.progress.submitted : used / r.minPlanted * cfg.scoring.progress.plantedSpan,
      label: submitted ? cfg.texts.progressDone : fill(cfg.texts.progressLabel, { used, min: r.minPlanted })
    };
  }

  root.ChunfengRules = { fill, flowerMap, levelLabel, stats, wishHits, calculate, toggleSlot, emptySlots, canSubmit, submitVerdict, slotPosition, progress };
})(window);
