/* 精灵巡游季 · 界面与事件绑定 */
(() => {
  'use strict';
  const CFG = window.GAME_CONFIG;
  const R = window.JinglingRules;
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

  // 由配置表生成选项按钮，插在说明块（.brief）之前
  function buildChoices(boxId, rows, dataKey, title, desc) {
    const box = $('#' + boxId);
    const brief = $('.brief', box);
    rows.forEach(row => {
      const node = document.createElement('button');
      node.className = 'choice';
      node.type = 'button';
      node.dataset[dataKey] = row.id;
      node.setAttribute('aria-pressed', 'false');
      node.innerHTML = `<strong>${row[title]}</strong><span>${row[desc]}</span>`;
      box.insertBefore(node, brief);
    });
  }

  function buildChallenge() {
    const box = $('#challenge-actions');
    CFG.challengeActions.slice().sort((a, b) => a.displayOrder - b.displayOrder).forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'secondary challenge-action';
      btn.type = 'button';
      btn.dataset.action = a.id;
      btn.textContent = a.label;
      box.appendChild(btn);
    });
  }

  const total = R.challengeSequence().length;
  let state = R.createState();

  function render() {
    const rumor = R.getRumor(state.rumor);
    $$('.choice[data-rumor]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.rumor === state.rumor)));
    $$('.choice[data-resonance]').forEach(node => node.setAttribute('aria-pressed', String(node.dataset.resonance === state.resonance)));
    $('#scene-title').textContent = rumor.name;
    $('#scene-note').textContent = rumor.scene;
    $('#partner-btn').disabled = !state.resonance || state.partnered;
    $('#challenge-panel').hidden = !state.partnered;
    $('#spirit-name').textContent = state.partnered ? rumor.spirit : R.text('unknownSpirit');
    setScore(R.scoreValue(state));
    const label = state.complete ? R.text('progressDone')
      : state.partnered ? R.text('progressChallenge', { step: state.challenge.length, total })
      : R.text('progressSearching');
    setProgress(R.progressValue(state), label);
    $$('.challenge-action').forEach(button => {
      const used = state.challenge.includes(button.dataset.action);
      button.disabled = used || state.complete;
      button.classList.toggle('selected', used);
    });
  }

  function init() {
    buildChoices('rumor-list', CFG.rumors, 'rumor', 'title', 'hint');
    buildChoices('resonance-list', CFG.resonances, 'resonance', 'name', 'desc');
    buildChallenge();

    // 切换传闻：整条流程重置
    $$('.choice[data-rumor]').forEach(node => node.addEventListener('click', () => {
      state = R.createState(node.dataset.rumor);
      setFeedback(R.text('intro'));
      render();
    }));
    $$('.choice[data-resonance]').forEach(node => node.addEventListener('click', () => {
      state.resonance = node.dataset.resonance;
      render();
    }));
    $('#partner-btn').addEventListener('click', () => {
      const result = R.tryPartner(state.rumor, state.resonance);
      if (result.ok) {
        state.partnered = true;
        setFeedback(R.text('partnerOk', { spirit: result.spirit }), 'good');
      } else {
        setFeedback(R.text('partnerFail', { hint: result.hint }), 'warn');
      }
      render();
    });
    $$('.challenge-action').forEach(button => button.addEventListener('click', () => {
      const result = R.applyChallengeAction(state.challenge, button.dataset.action);
      state.challenge = result.challenge;
      if (!result.ok) {
        setFeedback(R.text('challengeBroken'), 'warn');
      } else {
        setFeedback(R.text('challengeStep', { step: state.challenge.length, total }), 'good');
        if (result.complete) {
          state.complete = true;
          setFeedback(R.text('complete', { spirit: R.getRumor(state.rumor).spirit }), 'good');
          toast(R.text('completeToast'));
        }
      }
      render();
    }));
    setFeedback(R.text('intro'));
    render();
  }

  init();
})();
