/* 入口：根据配置渲染委托与素材卡，绑定剪辑 / 试映 / 放映事件 */
(function () {
  'use strict';
  const cfg = window.GAME_CONFIG;
  const R = window.LiufenRules;
  const { $, $$, toast, setFeedback, setProgress, setScore } = window.UI;
  const clips = R.clipMap(cfg);
  const T = cfg.texts;
  const state = { timeline: [], previewed: false, finished: false };

  // 委托面板与素材卡由配置生成
  function buildStatic() {
    const c = cfg.commission;
    $('#brief-title').textContent = c.title;
    $('#brief-text').textContent = c.brief;
    $('#brief-tag').textContent = c.panelTag;
    $('#objective-list').innerHTML = c.objectives.map(o => `<div class="objective">${o}</div>`).join('');
    $('#clip-count').textContent = `${cfg.clips.length} 选 ${c.timelineSize}`;
    $('#clip-cards').innerHTML = cfg.clips.map(clip =>
      `<button class="card" data-clip="${clip.id}" type="button"><strong>${clip.name}</strong><span>${R.fill(T.cardLabel, clip)}</span></button>`
    ).join('');
    $('.timeline').innerHTML = Array.from({ length: c.timelineSize }, () => '<button class="timeline-slot" type="button"></button>').join('');
    setFeedback(T.feedbackInitial);
  }

  function render() {
    $$('.card[data-clip]').forEach(card => card.classList.toggle('selected', state.timeline.includes(card.dataset.clip)));
    $$('.timeline-slot').forEach((slot, index) => {
      const clip = clips[state.timeline[index]];
      const head = `<div class="slot-index">${R.fill(T.slotIndex, { index: index + 1 })}</div>`;
      slot.classList.toggle('filled', Boolean(clip));
      slot.innerHTML = clip
        ? `${head}<div class="slot-name">${clip.name}</div><div class="slot-tag">${clip.tag}</div>`
        : `${head}<div class="slot-name">${T.slotEmpty}</div>`;
    });
    const score = R.calculate(state.timeline, cfg);
    [['theme-meter', score.theme], ['flow-meter', score.flow], ['stable-meter', score.stable]].forEach(([id, value]) => {
      const node = $(`#${id}`);
      if (node) node.style.width = `${value}%`;
      const num = $(`#${id}-value`);
      if (num) num.textContent = Math.round(value);
    });
    setScore(score.total);
    const p = R.progress(state, cfg);
    setProgress(p.value, p.label);
    $('#preview-btn').disabled = !R.canPreview(state.timeline, cfg);
    $('#premiere-btn').disabled = !state.previewed || state.finished;
  }

  function bind() {
    $$('.card[data-clip]').forEach(card => card.addEventListener('click', () => {
      const res = R.toggleClip(state.timeline, card.dataset.clip, cfg);
      if (res.full) toast(T.toastTimelineFull);
      state.timeline = res.timeline;
      state.previewed = false;
      render();
    }));

    $$('.timeline-slot').forEach((slot, index) => slot.addEventListener('click', () => {
      if (!state.timeline[index]) return;
      state.timeline = R.removeAt(state.timeline, index);
      state.previewed = false;
      render();
    }));

    $('#preview-btn').addEventListener('click', () => {
      const v = R.previewVerdict(state.timeline, cfg);
      state.previewed = true;
      setFeedback(T.preview[v.key], v.tone);
      render();
    });

    $('#premiere-btn').addEventListener('click', () => {
      state.finished = true;
      const score = Math.round(R.calculate(state.timeline, cfg).total);
      setFeedback(R.fill(T.premiereFeedback, { score }), 'good');
      toast(T.toastPremiere);
      render();
    });

    $('#reset-btn').addEventListener('click', () => {
      state.timeline = [];
      state.previewed = false;
      state.finished = false;
      setFeedback(T.feedbackInitial);
      render();
    });
  }

  buildStatic();
  bind();
  render();
})();
