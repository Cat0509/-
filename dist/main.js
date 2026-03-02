/* main.js — Orchestrator for 6 Acts */
; (function () {
    'use strict';

    // SVG gradient definition for the lock ring (injected into act1)
    const svg = document.querySelector('#lock-ring');
    if (svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#a855f7"/>
        <stop offset="50%"  stop-color="#f0c060"/>
        <stop offset="100%" stop-color="#ff6eb4"/>
      </linearGradient>`;
        svg.prepend(defs);
    }

    /* ---- State machine ---- */
    let currentAct = 0;

    function transitionTo(act) {
        if (act === currentAct) return;
        currentAct = act;

        // Hide all acts
        document.querySelectorAll('.act').forEach(s => s.classList.add('hidden'));

        switch (act) {
            case 1: Act1.show(); break;
            case 2: Act1.hide(); Act2.init(); document.getElementById('act2').classList.remove('hidden'); break;
            case 3: document.getElementById('act2').classList.add('hidden'); Act3.init(); document.getElementById('act3').classList.remove('hidden'); break;
            case 4: document.getElementById('act3').classList.add('hidden'); Act4.show(); break;
            case 5: Act4.hide(); Act5.show(); break;
            case 6: Act5.hide(); Act6.show(); break;
        }
    }

    const musicBtn = document.getElementById("audio-toggle");
    if (musicBtn) {
        musicBtn.addEventListener("click", async () => {
            const on = await AudioEngine.toggleBgm();
            musicBtn.textContent = on ? "音乐：开" : "音乐：关";
        });
    }

    /* ---- Event listeners for act transitions ---- */
    window.addEventListener('loader:done', () => transitionTo(1));
    window.addEventListener('act1:done', () => transitionTo(2));
    window.addEventListener('act2:done', () => transitionTo(3));
    window.addEventListener('act3:done', () => transitionTo(4));
    window.addEventListener('act4:done', () => transitionTo(5));
    window.addEventListener('act5:done', () => transitionTo(6));

    /* ---- Easter Eggs (Keep them if they work) ---- */
    function checkSecretTime() {
        if (!BIRTHDAY_CONFIG.secretBirthTime) return false;
        const now = new Date();
        const [h, m] = BIRTHDAY_CONFIG.secretBirthTime;
        if (now.getHours() === h && now.getMinutes() === m) {
            triggerSecretOverlay('✨ 此刻，正是你来到这个世界的那一刻 ✨\n\n宇宙在这一秒停下呼吸，只为再次迎接你的诞生。\n\n生日快乐，最珍贵的你。');
            return true;
        }
        return false;
    }

    window.iloveyou = function () {
        triggerSecretOverlay('❤️ 你发现了这条隐藏的心意 ❤️\n\n在这个宇宙的某个角落，有人正在默默地爱着你。\n\n生日快乐。');
    };

    function triggerSecretOverlay(text) {
        let overlay = document.getElementById('secret-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'secret-overlay';
            overlay.innerHTML = `<div id="secret-text"></div><button class="gold-btn" id="secret-close">继续 →</button>`;
            overlay.style.cssText = "position:fixed;inset:0;background:rgba(4,4,15,0.95);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;text-align:center;padding:20px;opacity:0;transition:opacity 0.8s ease;pointer-events:none;";
            document.body.appendChild(overlay);
        }
        const textEl = document.getElementById('secret-text');
        if (textEl) textEl.innerHTML = text.replace(/\n/g, '<br/>');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        document.getElementById('secret-close').onclick = () => { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; };
    }

    checkSecretTime();
    Loader.start();
})();
