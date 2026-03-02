const AudioEngine = (() => {
  let ctx = null;
  let bgmOsc = null;
  let bgmGain = null;
  let ambientOsc = null, ambientGain = null;

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async function resume() {
    ensure();
    if (ctx.state === "suspended") await ctx.resume();
  }

  function blip(freq = 760, ms = 80, type = "triangle", gainValue = 0.12) {
    ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(gainValue, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.02);
  }

  function keyClick() { blip(800, 40, "sine", 0.05); }
  function unlockChime() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 250, "sine", 0.1), i * 100)); }
  function errorBuzz() { blip(150, 200, "sawtooth", 0.1); }
  function fireworkPop(freq = 300) { blip(freq, 200, "sawtooth", 0.1); }
  function candleOut() { blip(200, 300, "sine", 0.15); }
  function starChime(i) {
    const freqs = [523, 587, 659, 698, 784, 880, 987, 1046];
    blip(freqs[i % freqs.length], 300, "sine", 0.05);
  }
  function success() { [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 150), i * 80)); }
  function fail() { blip(180, 220, "sawtooth", 0.09); }

  function startAmbient() {
    ensure();
    if (ambientOsc) return;
    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();
    ambientOsc.type = "sine";
    ambientOsc.frequency.value = 300;
    ambientGain.gain.value = 0.02;
    ambientOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    ambientOsc.start();
  }

  function stopAmbient() {
    if (ambientOsc) {
      ambientOsc.stop();
      ambientOsc.disconnect();
      ambientGain.disconnect();
      ambientOsc = null;
      ambientGain = null;
    }
  }

  async function toggleBgm() {
    await resume();
    if (!bgmOsc) {
      bgmOsc = ctx.createOscillator();
      bgmGain = ctx.createGain();
      bgmOsc.type = "triangle";
      bgmOsc.frequency.value = 220;
      bgmGain.gain.value = 0.03;
      bgmOsc.connect(bgmGain);
      bgmGain.connect(ctx.destination);
      bgmOsc.start();
      return true;
    }
    bgmOsc.stop();
    bgmOsc.disconnect();
    bgmGain.disconnect();
    bgmOsc = null;
    bgmGain = null;
    return false;
  }

  return { resume, blip, keyClick, unlockChime, errorBuzz, fireworkPop, candleOut, starChime, success, fail, startAmbient, stopAmbient, toggleBgm };
})();

