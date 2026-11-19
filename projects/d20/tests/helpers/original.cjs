/* 测试辅助：从原单文件 demos/d20.html 取出纯逻辑脚本块（故事 / 规则 / 动作模拟），在独立 vm 沙箱里加载，用作“行为一致”的对照组。 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ORIGINAL = path.resolve(__dirname, '..', '..', '..', '..', 'demos', 'd20.html');

function originalBlocks() {
  const html = fs.readFileSync(ORIGINAL, 'utf8');
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
}

// 块顺序：0 Phaser、1 故事、2 规则引擎、3 金融 noir 画、4 动作模拟、5 动作美术、6 界面
function loadOriginal() {
  const blocks = originalBlocks();
  const window = {};
  window.window = window;
  const ctx = vm.createContext(window);
  for (const i of [1, 2, 4]) vm.runInContext(blocks[i], ctx, { filename: 'demos/d20.html#script' + i });
  return window;
}

module.exports = { ORIGINAL, originalBlocks, loadOriginal };
