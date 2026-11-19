/* 六分街深夜剪辑室：纯规则（无 DOM），全部数值取自 GAME_CONFIG */
(function (root) {
  'use strict';

  function fill(tpl, vars) {
    return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  }

  // clips.csv -> { id: clip }
  function clipMap(cfg) {
    const map = {};
    cfg.clips.forEach(c => { map[c.id] = c; });
    return map;
  }

  // 是否计入"主题契合"：标签包含"温暖"或等于"轻松"
  function isThemeClip(clip, theme) {
    return theme.tagIncludes.some(t => clip.tag.includes(t)) || theme.tagEquals.includes(clip.tag);
  }

  // 相邻片段情绪强度差之和
  function moodJumps(selected) {
    return selected.slice(1).reduce((sum, clip, i) => sum + Math.abs(clip.mood - selected[i].mood), 0);
  }

  // 三项分 + 加权总分
  function calculate(timeline, cfg) {
    if (!timeline.length) return { theme: 0, flow: 0, stable: 0, total: 0 };
    const map = clipMap(cfg);
    const s = cfg.scoring;
    const size = cfg.commission.timelineSize;
    const selected = timeline.map(id => map[id]);
    const themeCount = selected.filter(c => isThemeClip(c, s.theme)).length;
    const last = selected[selected.length - 1];
    const theme = Math.min(s.theme.max, themeCount * s.theme.perThemeClip + (last && last.tag === s.theme.endingTag ? s.theme.endingBonus : 0));
    const flow = Math.max(s.flow.min, s.flow.base - moodJumps(selected) * s.flow.jumpPenalty - Math.abs(size - selected.length) * s.flow.lengthPenalty);
    const stable = selected.reduce((sum, c) => sum + c.stable, 0) / selected.length;
    const w = s.weights;
    return { theme, flow, stable, total: theme * w.theme + flow * w.flow + stable * w.stable };
  }

  // 点击素材卡：已在时间轴则移除，否则在未满时追加
  function toggleClip(timeline, id, cfg) {
    if (timeline.includes(id)) return { timeline: timeline.filter(x => x !== id), full: false };
    if (timeline.length < cfg.commission.timelineSize) return { timeline: timeline.concat(id), full: false };
    return { timeline: timeline.slice(), full: true };
  }

  function removeAt(timeline, index) {
    if (!timeline[index]) return timeline.slice();
    const next = timeline.slice();
    next.splice(index, 1);
    return next;
  }

  function canPreview(timeline, cfg) {
    return timeline.length === cfg.commission.timelineSize;
  }

  // 试映判定：先看结尾，再看节奏；返回反馈 key 与色调
  function previewVerdict(timeline, cfg) {
    const score = calculate(timeline, cfg);
    if (timeline[timeline.length - 1] !== cfg.commission.requiredEndingClip) return { key: 'ending', tone: 'warn', score };
    if (score.flow < cfg.commission.previewFlowThreshold) return { key: 'flow', tone: 'warn', score };
    return { key: 'good', tone: 'good', score };
  }

  function progress(state, cfg) {
    const p = cfg.scoring.progress;
    const value = state.finished ? p.finished : state.previewed ? p.previewed : state.timeline.length * p.perClip;
    const label = state.finished ? cfg.texts.progressDone
      : fill(cfg.texts.progressLabel, { count: state.timeline.length, size: cfg.commission.timelineSize });
    return { value, label };
  }

  root.LiufenRules = { fill, clipMap, isThemeClip, moodJumps, calculate, toggleClip, removeAt, canPreview, previewVerdict, progress };
})(window);
