/* act5.js — Full Birthday Cake + Blow Candles + Wish Making (Adapted from Proj 1 Act 3) */
const Act5 = (() => {
    const section = document.getElementById('act5');
    let micStream = null, analyser = null, audioCtx = null;
    let micActive = false, blownOut = false;
    let candleEls = [], litCount = 0;
    let animId = null, scene, camera, renderer;
    const CANDLE_COUNT = 6;

    function initThree() {
        const canvas = document.getElementById('act5-canvas');
        if (!canvas) return;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
        camera.position.set(0, 0, 10);
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        animateThree();
    }

    const fireworkSystems = [];
    function spawnFirework(x, y) {
        const count = 100;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);
        const col = new THREE.Color().setHSL(Math.random(), 1, .6);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
            const r = .05 + Math.random() * .1;
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos(2 * Math.random() - 1);
            vel[i * 3] = r * Math.sin(p) * Math.cos(t);
            vel[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
            vel[i * 3 + 2] = r * Math.cos(p);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo._vel = vel; geo._life = 0;
        const sys = new THREE.Points(geo, new THREE.PointsMaterial({ size: .15, color: col, transparent: true }));
        scene.add(sys); fireworkSystems.push(sys);
        AudioEngine.fireworkPop();
    }

    function animateThree() {
        animId = requestAnimationFrame(animateThree);
        fireworkSystems.forEach((sys, idx) => {
            sys.geometry._life += 0.02;
            if (sys.geometry._life > 1) { scene.remove(sys); fireworkSystems.splice(idx, 1); return; }
            const pos = sys.geometry.attributes.position.array;
            const vel = sys.geometry._vel;
            for (let i = 0; i < pos.length / 3; i++) {
                pos[i * 3] += vel[i * 3]; pos[i * 3 + 1] += vel[i * 3 + 1] - 0.002;
            }
            sys.geometry.attributes.position.needsUpdate = true;
            sys.material.opacity = 1 - sys.geometry._life;
        });
        renderer.render(scene, camera);
    }

    function buildFullCake() {
        const wrap = document.getElementById('full-cake-wrap');
        wrap.innerHTML = '';
        const candleRow = document.createElement('div');
        candleRow.className = 'full-candle-row';
        candleEls = [];
        for (let i = 0; i < CANDLE_COUNT; i++) {
            const c = document.createElement('div');
            c.className = 'full-candle';
            c.innerHTML = `<div class=\"fc-flame-wrap\"><div class=\"fc-flame-out\"></div><div class=\"fc-flame-in\"></div></div><div class=\"fc-body\" style=\"background:hsl(${i * 40},80%,65%)\"></div>`;
            candleRow.appendChild(c); candleEls.push(c);
        }
        wrap.appendChild(candleRow);
        const cake = document.createElement('div');
        cake.className = 'full-cake-body';
        cake.innerHTML = `<div class=\"fc-layer fc-l1\"></div><div class=\"fc-layer fc-l2\"></div><div class=\"fc-layer fc-l3\"></div><div class=\"fc-plate\"></div>`;
        wrap.appendChild(cake);
    }

    async function startMic() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            audioCtx.createMediaStreamSource(stream).connect(analyser);
            micActive = true;
            document.getElementById('mic-btn').textContent = '🎤 正在聆听…用力吹！';
            detectBlow();
        } catch (e) {
            document.getElementById('mic-btn').textContent = '🕯️ 点击吹灭蜡烛';
            document.getElementById('mic-btn').onclick = blowOutAll;
        }
    }

    function detectBlow() {
        if (!micActive || blownOut) return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const vol = data.reduce((a, b) => a + b, 0) / data.length;
        if (vol > 30) {
            litCount++;
            if (litCount < CANDLE_COUNT) {
                const f = candleEls[litCount - 1].querySelector('.fc-flame-wrap');
                if (f) f.style.opacity = '0';
            } else { blowOutAll(); }
        }
        setTimeout(detectBlow, 100);
    }

    function blowOutAll() {
        blownOut = true;
        AudioEngine.candleOut();
        candleEls.forEach(c => c.querySelector('.fc-flame-wrap').style.opacity = '0');
        setTimeout(() => {
            document.getElementById('wish-panel').classList.remove('hidden');
            document.getElementById('birthday-name').textContent = '🎂 生日快乐！';
        }, 1000);
    }

    function show() {
        section.classList.remove('hidden');
        initThree(); buildFullCake();
        document.getElementById('mic-btn').onclick = startMic;
        document.getElementById('wish-submit-btn').onclick = () => {
            document.getElementById('wish-input-wrap').classList.add('hidden');
            document.getElementById('wish-sealed').classList.remove('hidden');
        };
        document.getElementById('to-act6-btn').onclick = () => window.dispatchEvent(new Event('act5:done'));
    }

    function hide() { cancelAnimationFrame(animId); if (audioCtx) audioCtx.close(); section.classList.add('hidden'); }

    return { show, hide };
})();
