/* 团子清洁队 · 音效：WebAudio 合成短音。挂到 window.TuanziAudio。 */
(function (root) {
  'use strict';
  let audio = null, on = true;

  function ensure() {
    if (!audio) audio = new (root.AudioContext || root.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  }

  function tone(freq, duration = .08, type = 'sine', volume = .035, delay = 0) {
    if (!on || !audio) return;
    const osc = audio.createOscillator(), gain = audio.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audio.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + delay + duration);
    osc.connect(gain).connect(audio.destination); osc.start(audio.currentTime + delay); osc.stop(audio.currentTime + delay + duration);
  }

  function toggle() { on = !on; return on; }

  root.TuanziAudio = { ensure, tone, toggle, isOn: () => on };
})(window);
