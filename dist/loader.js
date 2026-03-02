/* loader.js — Loading screen with animated star canvas */
const Loader = (() => {
    const canvas = document.getElementById('loader-canvas');
    const bar = document.getElementById('loader-bar');
    const pct = document.getElementById('loader-percent');
    let raf, stars = [], progress = 0;

    function initStars() {
        const w = canvas.width = window.innerWidth;
        const h = canvas.height = window.innerHeight;
        stars = Array.from({ length: 200 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 1.8 + .3,
            a: Math.random(), da: (Math.random() - .5) * .012,
            speed: Math.random() * .4 + .1
        }));
    }

    function draw() {
        const w = canvas.width, h = canvas.height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        stars.forEach(s => {
            s.a += s.da;
            if (s.a <= 0 || s.a >= 1) s.da *= -1;
            s.y -= s.speed;
            if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.a.toFixed(2)})`;
            ctx.fill();
        });
        raf = requestAnimationFrame(draw);
    }

    function setProgress(v) {
        progress = Math.min(v, 100);
        if (bar) bar.style.width = progress + '%';
        if (pct) pct.textContent = Math.round(progress) + '%';
    }

    function start() {
        initStars();
        draw();
        window.addEventListener('resize', () => { initStars(); });

        // Simulate asset loading
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 8 + 3;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setProgress(100);
                setTimeout(finish, 400);
            }
        }, 80);
    }

    function finish() {
        cancelAnimationFrame(raf);
        const el = document.getElementById('loader');
        if (el) {
            el.style.transition = 'opacity .8s ease';
            el.style.opacity = '0';
            setTimeout(() => {
                el.classList.add('hidden');
                window.dispatchEvent(new Event('loader:done'));
            }, 850);
        }
    }

    return { start };
})();
