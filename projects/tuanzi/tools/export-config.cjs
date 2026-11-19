#!/usr/bin/env node
/*
 * 配置表导出：把 config/ 下的策划配置表（JSON / CSV）打包成运行时脚本
 * src/js/config.generated.js（window.GAME_CONFIG）。
 * 浏览器以 file:// 直接打开时无法 fetch 本地 JSON，所以导出为普通脚本。
 *
 *   node tools/export-config.cjs          # 重新生成
 *   node tools/export-config.cjs --check  # 只校验是否与配置表一致（CI / 测试用）
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_DIR = path.join(ROOT, 'config');
const OUT = path.join(ROOT, 'src', 'js', 'config.generated.js');

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(v => v !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(v => v !== '')) rows.push(row);
  const [head, ...body] = rows;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h.trim(), coerce(r[i])])));
}

function coerce(v) {
  if (v === undefined) return null;
  const s = v.trim();
  if (s === '') return null;
  if (s === 'true' || s === 'false') return s === 'true';
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function loadConfig() {
  const config = {};
  for (const file of fs.readdirSync(CONFIG_DIR).sort()) {
    const ext = path.extname(file);
    const key = path.basename(file, ext).replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
    const text = fs.readFileSync(path.join(CONFIG_DIR, file), 'utf8');
    if (ext === '.json') config[key] = JSON.parse(text);
    else if (ext === '.csv') config[key] = parseCsv(text);
  }
  return config;
}

function render(config) {
  return '/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */\n'
    + 'window.GAME_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n';
}

if (require.main === module) {
  const out = render(loadConfig());
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== out) { console.error('config.generated.js 与 config/ 不一致，请运行 node tools/export-config.cjs'); process.exit(1); }
    console.log('config.generated.js 与 config/ 一致');
  } else {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, out);
    console.log('已生成', path.relative(ROOT, OUT));
  }
}

module.exports = { loadConfig, parseCsv, render };
