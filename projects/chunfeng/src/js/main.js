/* 入口：根据配置渲染种子篮、愿望与环形落点，绑定种植 / 提交事件 */
(function () {
  'use strict';
  const cfg = window.GAME_CONFIG;
  const R = window.ChunfengRules;
  const { $, $$, setFeedback, setProgress, setScore } = window.UI;
  const flowers = R.flowerMap(cfg);
  const T = cfg.texts;
  const state = { selected: cfg.scoring.ring.defaultFlower, slots: R.emptySlots(cfg), submitted: false };
  const ring = $('#flower-ring');

  function buildStatic() {
    $('#seed-cards').innerHTML = cfg.flowers.map(f => {
      const label = R.fill(T.cardLabel, { color: f.color, height: R.levelLabel(cfg, 'height', f.height), scent: R.levelLabel(cfg, 'scent', f.scent) });
      return `<button class="card" data-flower="${f.id}" type="button"><strong>${f.name}</strong><span>${label}</span></button>`;
    }).join('') + `<div class="brief"><strong>${T.windTitle}</strong><span>${T.windText}</span></div>`;
    $('#wish-count').textContent = `${cfg.wishes.length} 条`;
    $('#wish-list').innerHTML = cfg.wishes.map(w => `<div class="objective">${R.fill(T.wishLine, w)}</div>`).join('');
    setFeedback(T.feedbackInitial);

    for (let i = 0; i < cfg.scoring.ring.slotCount; i += 1) {
      const button = document.createElement('button');
      button.className = 'flower-slot';
      button.type = 'button';
      button.setAttribute('aria-label', R.fill(T.slotAria, { index: i + 1 }));
      const pos = R.slotPosition(i, cfg);
      button.style.left = `${pos.left}%`;
      button.style.top = `${pos.top}%`;
      button.addEventListener('click', () => {
        if (state.submitted) return;
        state.slots = R.toggleSlot(state.slots, i, state.selected);
        render();
      });
      ring.appendChild(button);
    }
  }

  function render() {
    $$('.card[data-flower]').forEach(card => card.classList.toggle('selected', card.dataset.flower === state.selected));
    $$('.flower-slot', ring).forEach((slot, i) => {
      const flower = state.slots[i] ? flowers[state.slots[i]] : null;
      slot.dataset.flower = state.slots[i] || '';
      slot.classList.toggle('filled', Boolean(flower));
      slot.textContent = flower ? flower.name.slice(0, 1) : String(i + 1);
    });
    const score = R.calculate(state.slots, cfg);
    setScore(score.total);
    $('#harmony').textContent = Math.round(score.harmony);
    $('#layers').textContent = Math.round(score.layers);
    $('#wishes').textContent = `${score.wishes}/${cfg.wishes.length}`;
    const p = R.progress(state.slots, state.submitted, cfg);
    setProgress(p.value, p.label);
    $('#flower-submit').disabled = !R.canSubmit(state.slots, state.submitted, cfg);
  }

  function bind() {
    $$('.card[data-flower]').forEach(card => card.addEventListener('click', () => {
      state.selected = card.dataset.flower;
      render();
    }));
    $('#flower-clear').addEventListener('click', () => {
      state.slots = R.emptySlots(cfg);
      state.submitted = false;
      setFeedback(T.feedbackInitial);
      render();
    });
    $('#flower-submit').addEventListener('click', () => {
      const v = R.submitVerdict(state.slots, cfg);
      // 未达标不锁定花环，可继续调整后再提交
      state.submitted = v.pass;
      setFeedback(v.pass ? T.submitGood : T.submitRetry, v.tone);
      render();
    });
  }

  buildStatic();
  bind();
  render();
})();
