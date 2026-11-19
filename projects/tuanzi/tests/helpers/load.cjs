/* 测试辅助：在 Node vm 沙箱里按 index.html 的顺序加载浏览器脚本（无 DOM），返回 window。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScripts(files, extra = {}) {
  const window = { ...extra };
  window.window = window;
  const ctx = vm.createContext(window);
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../..', f), 'utf8'), ctx, { filename: f });
  }
  return window;
}

function makeAssert() {
  let count = 0;
  const assert = require('assert');
  const wrap = {};
  for (const k of ['ok', 'equal', 'strictEqual', 'deepStrictEqual', 'notStrictEqual', 'throws']) {
    wrap[k] = (...a) => { count++; assert[k](...a); };
  }
  wrap.count = () => count;
  return wrap;
}

module.exports = { loadScripts, makeAssert };
