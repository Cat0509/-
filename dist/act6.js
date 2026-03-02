/* act6.js — Blessing Wall (Adapted from Proj 1 Act 4) */
const Act6 = (() => {
    const section = document.getElementById('act6');
    let animId = null;

    function initCanvas() {
        const canvas = document.getElementById('act6-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const pieces = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            vy: 0.5 + Math.random(), c: '#ffffff33'
        }));
        function draw() {
            animId = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.vy; if (p.y > canvas.height) p.y = -10;
                ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
            });
        }
        draw();
    }

    function buildWall() {
        const wall = document.getElementById('blessing-wall');
        if (!wall) return;
        wall.innerHTML = '';
        if (typeof BIRTHDAY_CONFIG !== 'undefined' && BIRTHDAY_CONFIG.blessings) {
            BIRTHDAY_CONFIG.blessings.forEach(msg => {
                const card = document.createElement('div');
                card.className = 'flip';
                card.innerHTML = `
                    <div class="flip-inner">
                        <div class="flip-face flip-front">${msg.front}</div>
                        <div class="flip-face flip-back">
                            <div class="bless-text">${msg.back}</div>
                            <div class="bless-from">— ${msg.from}</div>
                        </div>
                    </div>
                `;
                card.addEventListener('click', () => {
                    card.classList.toggle('open');
                });
                wall.appendChild(card);
            });
        }
    }

    function show() {
        section.classList.remove('hidden');
        initCanvas(); buildWall();
        const hintEl = document.getElementById('final-hint');
        if (hintEl) hintEl.textContent = BIRTHDAY_CONFIG.finalHint;
        const openBtn = document.getElementById('open-letter');
        if (openBtn) {
            openBtn.onclick = () => {
                if (document.getElementById('final-keyword').value === BIRTHDAY_CONFIG.finalKeyword) {
                    document.getElementById('letter-name').textContent = BIRTHDAY_CONFIG.birthdayName;
                    document.getElementById('letter-content').textContent = BIRTHDAY_CONFIG.letter;
                    document.getElementById('letter-modal').classList.remove('hidden');
                } else {
                    document.getElementById('final-error').classList.remove('hidden');
                }
            };
        }
        const closeBtn = document.getElementById('close-letter');
        if (closeBtn) closeBtn.onclick = () => document.getElementById('letter-modal').classList.add('hidden');
    }

    function hide() { cancelAnimationFrame(animId); section.classList.add('hidden'); }

    return { show, hide };
})();
