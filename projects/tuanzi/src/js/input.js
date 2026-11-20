/* 团子清洁队 · 输入：键盘 / 鼠标 / 触屏 → 移动方向与目标点。挂到 window.TuanziInput。 */
(function (root) {
  'use strict';
  const G = root.GAME_CONFIG.game;
  const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  const input = { keys: new Set(), pointer: false, target: null };

  // 键盘方向 + 指针目标合成移动方向（未归一化）；到达目标点后清除目标
  function direction(player) {
    let dx = 0, dy = 0;
    if (input.keys.has('a') || input.keys.has('arrowleft')) dx--;
    if (input.keys.has('d') || input.keys.has('arrowright')) dx++;
    if (input.keys.has('w') || input.keys.has('arrowup')) dy--;
    if (input.keys.has('s') || input.keys.has('arrowdown')) dy++;
    if (input.target) {
      const tx = input.target.x - player.x, ty = input.target.y - player.y, d = Math.hypot(tx, ty);
      if (d > G.pointerArriveDist) { dx += tx / d; dy += ty / d; }
      else input.target = null;
    }
    return { dx, dy };
  }

  // 清空输入：开局、失焦时调用，避免上一局的目标点或卡住的按键带进来
  function clear() { input.keys.clear(); input.pointer = false; input.target = null; }

  // handlers: getCamera(), onDash(), onNumber(n), onConfirm() -> 返回 true 表示已处理回车
  function bind(canvas, handlers) {
    const toWorld = event => {
      const r = canvas.getBoundingClientRect(), cam = handlers.getCamera();
      return { x: (event.clientX - r.left) / r.width * G.view.w + cam.x, y: (event.clientY - r.top) / r.height * G.view.h + cam.y };
    };
    root.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      if (MOVE_KEYS.includes(key) || key === ' ') e.preventDefault();
      if (MOVE_KEYS.includes(key)) input.target = null; // 键盘方向清除指针目标
      if (key === 'enter' && handlers.onConfirm && handlers.onConfirm()) { e.preventDefault(); return; }
      input.keys.add(key);
      if (key === ' ') handlers.onDash();
      if (['1', '2', '3', '4'].includes(key)) handlers.onNumber(Number(key));
    });
    root.addEventListener('keyup', e => input.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('pointerdown', e => { input.pointer = true; input.target = toWorld(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (input.pointer) input.target = toWorld(e); });
    canvas.addEventListener('pointerup', () => { input.pointer = false; });
    canvas.addEventListener('pointercancel', () => { input.pointer = false; });
    root.addEventListener('blur', clear);
  }

  root.TuanziInput = { state: input, direction, bind, clear };
})(window);
