/* act1.js — 3D Gift Box (PBR) + Slide-to-Unlock */
const Act1 = (() => {
    const section = document.getElementById('act1');
    let scene, camera, renderer, animId;
    let giftGroup, bowGroup, ribbonH, ribbonV;
    let particleSys, sparkles = [];
    let shakeT = 0, isShaking = false;

    function initThree() {
        const canvas = document.getElementById('act1-canvas');
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x04040f, 0.04);
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(0, 0, 9);
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        buildLights();
        buildGiftBox();
        buildSparkleParticles();
        buildBackgroundStars();
        window.addEventListener('mousemove', e => {
            if (!giftGroup || isShaking) return;
            const nx = (e.clientX / window.innerWidth - 0.5) * 2;
            const ny = (e.clientY / window.innerHeight - 0.5) * 2;
            giftGroup.rotation.y = THREE.MathUtils.lerp(giftGroup.rotation.y, nx * 0.5, 0.06);
            giftGroup.rotation.x = THREE.MathUtils.lerp(giftGroup.rotation.x, ny * 0.3, 0.06);
        });
        window.addEventListener('resize', onResize);
        animateThree();
    }

    function buildLights() {
        scene.add(new THREE.AmbientLight(0x150830, 1.2));
        const key = new THREE.DirectionalLight(0xffd97d, 2.8);
        key.position.set(4, 6, 5);
        scene.add(key);
        const fill = new THREE.PointLight(0x9933ff, 3.5, 30);
        fill.position.set(-5, -2, 4);
        scene.add(fill);
    }

    function buildGiftBox() {
        giftGroup = new THREE.Group();
        scene.add(giftGroup);
        const boxGeo = new THREE.BoxGeometry(2.4, 2.4, 2.4);
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x1a003a, roughness: 0.25, metalness: 0.15 });
        giftGroup.add(new THREE.Mesh(boxGeo, boxMat));
        const ribMatH = new THREE.MeshStandardMaterial({ color: 0xf0c060, roughness: 0.1, metalness: 0.9 });
        giftGroup.add(new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.32, 2.44), ribMatH));
        giftGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.44, 2.44), ribMatH.clone()));
    }

    function buildSparkleParticles() {
        const count = 300;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 3 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.05, color: 0xffd700, transparent: true, opacity: 0.8 })));
    }

    function buildBackgroundStars() {
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - .5) * 100;
            pos[i * 3 + 1] = (Math.random() - .5) * 100;
            pos[i * 3 + 2] = -50;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 })));
    }

    function animateThree() {
        animId = requestAnimationFrame(animateThree);
        if (giftGroup) giftGroup.position.y = Math.sin(Date.now() * 0.002) * 0.15;
        renderer.render(scene, camera);
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function initSlider() {
        const thumb = document.getElementById('act1-thumb');
        const track = document.getElementById('act1-track');
        if (!thumb || !track) return;
        let dragging = false, currentX = 0;

        const startDragging = () => { dragging = true; AudioEngine.resume(); };
        const onMove = (clientX) => {
            if (!dragging) return;
            const rect = track.getBoundingClientRect();
            currentX = Math.max(0, Math.min(clientX - rect.left - 28, rect.width - 60));
            thumb.style.left = currentX + 'px';
            if (currentX / (rect.width - 60) > 0.95) {
                dragging = false;
                document.getElementById('act1-slider-wrap').style.opacity = '0';
                onSliderComplete();
            }
        };
        const stopDragging = () => { if (dragging) { dragging = false; thumb.style.left = '2px'; } };

        thumb.onmousedown = startDragging;
        window.onmousemove = e => onMove(e.clientX);
        window.onmouseup = stopDragging;

        thumb.ontouchstart = e => { startDragging(); e.preventDefault(); };
        window.ontouchmove = e => { if (e.touches[0]) onMove(e.touches[0].clientX); };
        window.ontouchend = stopDragging;
    }

    function onSliderComplete() {
        AudioEngine.unlockChime();
        setTimeout(showPasswordPanel, 500);
    }

    function showPasswordPanel() {
        document.getElementById('password-panel').classList.remove('hidden');
        document.getElementById('pw-hint').textContent = BIRTHDAY_CONFIG.passwordHint;
        const inputs = document.querySelectorAll('.pw-char');
        inputs.forEach((input, i) => {
            input.oninput = () => {
                AudioEngine.keyClick();
                if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
                if (i === inputs.length - 1 && input.value) checkPassword();
            };
        });
        inputs[0].focus();
    }

    function checkPassword() {
        const entered = Array.from(document.querySelectorAll('.pw-char')).map(i => i.value).join('');
        if (entered === BIRTHDAY_CONFIG.unlockPassword) {
            AudioEngine.unlockChime();
            setTimeout(() => window.dispatchEvent(new Event('act1:done')), 1000);
        } else {
            AudioEngine.errorBuzz();
            document.getElementById('pw-error').classList.remove('hidden');
            document.querySelectorAll('.pw-char').forEach(i => i.value = '');
            document.querySelectorAll('.pw-char')[0].focus();
        }
    }

    function show() {
        section.classList.remove('hidden');
        initThree();
        initSlider();
    }

    function hide() {
        cancelAnimationFrame(animId);
        section.classList.add('hidden');
    }

    return { show, hide };
})();
