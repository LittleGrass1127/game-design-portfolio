/* 通用界面小工具：toast / 反馈条 / 进度条 / 评分环 */
(function (root) {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

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
    root.clearTimeout(toast.timer);
    toast.timer = root.setTimeout(() => node.classList.remove('show'), 2200);
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

  root.UI = { $, $$, toast, setFeedback, setProgress, setScore };
})(window);
