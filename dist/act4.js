/* act4.js — Birthday Cake Reveal Scene (Adapted from Proj 1 Act 2) */
const Act4 = (() => {
    const section = document.getElementById('act4');
    let confettiInterval = null, animId = null;

    function initCanvas() {
        const canvas = document.getElementById('act4-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = Array.from({ length: 90 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: 8 + Math.random() * 8,
            h: 4 + Math.random() * 4,
            color: ['#f0c060', '#ff6eb4', '#a855f7', '#60a5fa', '#2dd4bf'][Math.floor(Math.random() * 5)],
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - .5) * .12,
            vx: (Math.random() - .5) * 1.2,
            vy: 1.2 + Math.random() * 2.2,
            wave: Math.random() * Math.PI * 2,
        }));

        function draw() {
            animId = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.wave += 0.04;
                p.x += p.vx + Math.sin(p.wave) * 0.5;
                p.y += p.vy;
                p.rot += p.rotV;
                if (p.y > canvas.height + 20) { p.y = -12; p.x = Math.random() * canvas.width; }
                ctx.save();
                ctx.translate(p.x, p.y); ctx.rotate(p.rot);
                ctx.fillStyle = p.color; ctx.globalAlpha = 0.85;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
        }
        draw();
    }

    function buildCake() {
        const stage = document.getElementById('cake-stage');
        if (!stage) return;
        stage.innerHTML = '';
        const layers = [
            { w: 200, h: 56, bg: 'linear-gradient(135deg,#b26ae0,#7c3aed)', deco: '✦ ✦ ✦' },
            { w: 260, h: 62, bg: 'linear-gradient(135deg,#e07aaa,#c2185b)', deco: '❤ ❤ ❤' },
            { w: 320, h: 70, bg: 'linear-gradient(135deg,#f0a050,#e65c00)', deco: '★ ★ ★' },
        ];
        const candleRow = document.createElement('div');
        candleRow.id = 'cake-candle-row';
        stage.appendChild(candleRow);
        for (let i = 0; i < 6; i++) {
            const c = document.createElement('div');
            c.className = 'cake-candle';
            c.innerHTML = `<div class="ck-flame-wrap"><div class="ck-fl-out"></div><div class="ck-fl-in"></div></div><div class="ck-body"></div>`;
            c.style.setProperty('--delay', (i * 0.15) + 's');
            candleRow.appendChild(c);
        }
        layers.forEach((l, i) => {
            const tier = document.createElement('div');
            tier.className = 'cake-tier';
            tier.style.cssText = `width:${l.w}px; height:${l.h}px; background:${l.bg}; animation: cakeTierIn .6s ${i * .18}s cubic-bezier(.34,1.56,.64,1) both;`;
            stage.appendChild(tier);
        });
        const plate = document.createElement('div'); plate.id = 'cake-plate'; stage.appendChild(plate);
        setTimeout(() => { document.getElementById('act4-next-btn')?.classList.remove('hidden'); }, 1800);
    }

    function show() {
        section.classList.remove('hidden');
        initCanvas(); buildCake();
        document.getElementById('act4-next-btn').onclick = () => window.dispatchEvent(new Event('act4:done'));
    }

    function hide() {
        cancelAnimationFrame(animId);
        section.classList.add('hidden');
    }

    return { show, hide };
})();
