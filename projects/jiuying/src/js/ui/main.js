/* 旧影回声 · 界面与事件绑定 */
(() => {
  'use strict';
  const CFG = window.GAME_CONFIG;
  const R = window.JiuyingRules;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function toast(message) {
    let node = $('#toast');
    if (!node) {
      node = document.createElement('div');
      node.id = 'toast';
      node.className = 'toast';
      node.setAttribute('role', 'status');
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('show'), 2200);
  }

  function setFeedback(message, tone = '') {
    const node = $('#feedback');
    if (!node) return;
    node.className = `feedback ${tone}`.trim();
    node.textContent = message;
  }

  function setProgress(value, label) {
    const fill = $('#progress-fill');
    const text = $('#progress-text');
    if (fill) fill.style.width = `${Math.max(0, Math.min(100, value))}%`;
    if (text && label) text.textContent = label;
  }

  function setScore(value) {
    const score = $('#score');
    if (!score) return;
    score.textContent = Math.round(value);
    score.parentElement.style.setProperty('--score-angle', `${value * 3.6}deg`);
  }

  // 线索卡片由 evidence.csv 生成，插在“归为事实/推断”按钮前
  function buildCards() {
    const box = $('#evidence-cards');
    const actions = $('.actions', box);
    CFG.evidence.forEach(item => {
      const card = document.createElement('button');
      card.className = 'card';
      card.type = 'button';
      card.dataset.evidence = item.id;
      card.innerHTML = `<strong>${item.title}</strong><span>${item.detail}</span>`;
      box.insertBefore(card, actions);
    });
  }

  const state = R.createState();
  function render() {
    const lightbox = $('#negative');
    lightbox.style.setProperty('--exposure', String(R.exposureVisual(state.exposure)));
    lightbox.style.setProperty('--clue-opacity', R.isReadable(state.exposure) ? '1' : '0');
    $('#exposure').value = state.exposure;
    $('#exposure-value').textContent = `${state.exposure}%`;
    $$('.card[data-evidence]').forEach(card => card.classList.toggle('selected', card.dataset.evidence === state.selected));
    CFG.evidenceTypes.forEach(t => {
      const picked = state[t.id];
      $('#' + t.slotId).textContent = picked ? R.getEvidence(picked).slotName : t.placeholder;
    });
    $('#check-evidence').disabled = !state.fact || !state.inference || state.archived;
    $('#archive-photo').disabled = !state.checked || state.archived;
    const step = R.progressStep(state);
    setProgress(step, state.archived ? R.text('progressDone') : R.text('progressLabel', { step }));
    setScore(step);
  }

  function exposureFeedback() {
    const zone = R.exposureZone(state.exposure);
    if (zone === 'readable') setFeedback(R.text('exposureReadable'), 'good');
    else if (zone === 'over') setFeedback(R.text('exposureOver'), 'warn');
    else setFeedback(R.text('exposureDark'));
  }

  function init() {
    buildCards();
    const slider = $('#exposure');
    slider.min = CFG.exposure.min;
    slider.max = CFG.exposure.max;
    slider.value = CFG.exposure.initial;

    slider.addEventListener('input', event => {
      if (state.archived) return render();
      state.exposure = Number(event.target.value);
      state.checked = false;
      exposureFeedback();
      render();
    });
    $$('.card[data-evidence]').forEach(card => card.addEventListener('click', () => {
      state.selected = card.dataset.evidence;
      render();
    }));
    // 归类按钮：把当前选中线索放入对应槽位
    CFG.evidenceTypes.forEach(t => {
      $('#' + t.assignButtonId).addEventListener('click', () => {
        if (state.archived) return toast(R.text('archivedLocked'));
        if (!state.selected) return toast(R.text('needSelect'));
        Object.assign(state, R.assignEvidence(state, t.id, state.selected));
        state.checked = false;
        render();
      });
    });
    $('#check-evidence').addEventListener('click', () => {
      const reason = R.checkFailReason(state);
      state.checked = !reason;
      setFeedback(R.text(reason === 'exposure' ? 'checkFailExposure' : reason === 'type' ? 'checkFailType' : 'checkPass'), state.checked ? 'good' : 'warn');
      render();
    });
    $('#archive-photo').addEventListener('click', () => {
      state.archived = true;
      setFeedback(R.text('archived'), 'good');
      toast(R.text('archiveToast'));
      render();
    });
    $('#reset-case').addEventListener('click', () => {
      Object.assign(state, R.createState());
      exposureFeedback();
      render();
    });
    $('#play-hint').textContent = R.text('playHint');
    exposureFeedback();
    render();
  }

  init();
})();
