/* 入口：根据配置渲染种子篮、愿望与环形落点，绑定种植 / 提交事件 */
(function () {
  'use strict';
  const cfg = window.GAME_CONFIG;
  const R = window.ChunfengRules;
  const { $, $$, toast, setFeedback, setProgress, setScore } = window.UI;
  const flowers = R.flowerMap(cfg);
  const T = cfg.texts;
  const state = { selected: cfg.scoring.ring.defaultFlower, slots: R.emptySlots(cfg), submitted: false };
  const ring = $('#flower-ring');
  const hintVars = { min: cfg.scoring.ring.minPlanted, pass: cfg.scoring.pass.minTotal };
  const initialFeedback = R.fill(T.feedbackInitial, hintVars);

  function buildStatic() {
    $('#seed-cards').innerHTML = cfg.flowers.map(f => {
      const label = R.fill(T.cardLabel, { color: f.color, height: R.levelLabel(cfg, 'height', f.height), scent: R.levelLabel(cfg, 'scent', f.scent) });
      return `<button class="card" data-flower="${f.id}" type="button"><strong>${f.name}</strong><span>${label}</span></button>`;
    }).join('') + `<div class="brief"><strong>${T.windTitle}</strong><span>${T.windText}</span></div>`;
    $('#wish-count').textContent = `${cfg.wishes.length} 条`;
    $('#wish-list').innerHTML = cfg.wishes.map(w => `<div class="objective" data-wish="${w.id}">${R.fill(T.wishLine, w)}</div>`).join('');
    $('#play-hint').textContent = R.fill(T.playHint, hintVars);
    setFeedback(initialFeedback);

    for (let i = 0; i < cfg.scoring.ring.slotCount; i += 1) {
      const button = document.createElement('button');
      button.className = 'flower-slot';
      button.type = 'button';
      button.setAttribute('aria-label', R.fill(T.slotAria, { index: i + 1 }));
      const pos = R.slotPosition(i, cfg);
      button.style.left = `${pos.left}%`;
      button.style.top = `${pos.top}%`;
      button.addEventListener('click', () => {
        if (state.submitted) return toast(T.toastLocked);
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
    const hits = R.wishHits(R.stats(state.slots, cfg), cfg);
    $$('.objective[data-wish]').forEach(node => node.classList.toggle('done', hits.some(h => h.id === node.dataset.wish && h.hit)));
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
      setFeedback(initialFeedback);
      render();
    });
    $('#flower-submit').addEventListener('click', () => {
      const v = R.submitVerdict(state.slots, cfg);
      // 未达标不锁定花环，可继续调整后再提交
      state.submitted = v.pass;
      const vars = { score: Math.round(v.score.total), layers: Math.round(v.score.layers), pass: cfg.scoring.pass.minTotal,
        missing: v.missing.map(w => R.fill(T.missingItem, w)).join('、') };
      const tpl = v.pass ? T.submitGood : v.reason === 'missing' ? T.submitMissing : T.submitLowScore;
      setFeedback(R.fill(tpl, vars), v.tone);
      render();
    });
  }

  buildStatic();
  bind();
  render();
})();
