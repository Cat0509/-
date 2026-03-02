const Act3 = (() => {
  const canvas = document.getElementById("act3-canvas");
  const ctx = canvas.getContext("2d");
  const area = document.getElementById("game-area");
  const basket = document.getElementById("basket");
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const targetEl = document.getElementById("target");
  const startBtn = document.getElementById("start-game");

  let running = false;
  let score = 0;
  let timeLeft = 20;
  let timerId = null, fallId = null;
  let x = 0;
  let speedMult = 1.0;
  const items = [];
  const emojis = ["🎁", "🍓", "🌟", "🍰", "🎈", "💌"];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawConfettiBg() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 40; i++) {
      const px = (Date.now() / 20 + i * 37) % canvas.width;
      const py = (i * 63 + Date.now() / 30) % canvas.height;
      ctx.fillStyle = ["#f8c96c", "#f06f9a", "#8ad7c8", "#fff"][i % 4];
      ctx.globalAlpha = 0.2;
      ctx.fillRect(px, py, 4, 4);
    }
    requestAnimationFrame(drawConfettiBg);
  }

  function setBasket(clientX) {
    const rect = area.getBoundingClientRect();
    x = Math.max(0, Math.min(rect.width - 60, clientX - rect.left - 30));
    basket.style.left = `${x}px`;
  }

  function spawnItem() {
    if (!running) return;
    const el = document.createElement("div");
    el.className = "fall-item";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const left = Math.random() * (area.clientWidth - 40);
    el.style.left = `${left}px`;
    el.style.top = "-40px";
    area.appendChild(el);
    // Base speed + random variation, then scaled by speedMult
    const baseV = (1.8 + Math.random() * 2.2) * speedMult;
    items.push({ el, x: left, y: -40, v: baseV });
  }

  function updateItems() {
    if (!running) return;
    const bRect = basket.getBoundingClientRect();
    // Use a slightly larger hitbox for the basket to feel more forgiving
    const hitBox = {
      left: bRect.left - 10,
      right: bRect.right + 10,
      top: bRect.top
    };

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y += it.v;
      it.el.style.top = it.y + "px";
      const r = it.el.getBoundingClientRect();

      // Collision detection improvements
      if (r.bottom >= hitBox.top && r.bottom <= hitBox.top + 30 && r.left < hitBox.right && r.right > hitBox.left) {
        it.el.remove(); items.splice(i, 1);
        score++; scoreEl.textContent = score;
        if (typeof AudioEngine !== "undefined" && AudioEngine.blip) AudioEngine.blip(720, 80);
      } else if (it.y > area.clientHeight) {
        it.el.remove(); items.splice(i, 1);
      }
    }
    fallId = requestAnimationFrame(updateItems);
  }

  function stopGame() {
    running = false;
    clearInterval(timerId);
    cancelAnimationFrame(fallId);
    if (score >= 20) {
      startBtn.textContent = "挑战成功！";
      setTimeout(() => window.dispatchEvent(new Event("act3:done")), 1000);
      if (typeof AudioEngine !== "undefined" && AudioEngine.success) AudioEngine.success();
    } else {
      startBtn.textContent = "再试一次";
      startBtn.onclick = startGame;
      if (typeof AudioEngine !== "undefined" && AudioEngine.fail) AudioEngine.fail();
    }
  }

  function startGame() {
    score = 0; timeLeft = 20; running = true; speedMult = 1.0;
    scoreEl.textContent = "0";
    timerEl.textContent = "20";
    startBtn.textContent = "接住礼物！";
    startBtn.onclick = null;

    // Clear old items if any
    document.querySelectorAll(".fall-item").forEach(i => i.remove());
    items.length = 0;

    const spawnTimer = setInterval(() => {
      if (running) spawnItem();
      else clearInterval(spawnTimer);
    }, 450);

    timerId = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      // Increase speed by 3% every second (was 8%)
      speedMult += 0.03;
      if (timeLeft <= 0) stopGame();
    }, 1000);
    updateItems();
  }

  function init() {
    resizeCanvas();
    drawConfettiBg();
    window.addEventListener("resize", resizeCanvas);
    area.onmousemove = e => setBasket(e.clientX);
    // Touch support
    area.ontouchmove = e => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        setBasket(touch.clientX);
        e.preventDefault();
      }
    }, { passive: false };
    startBtn.onclick = startGame;
  }

  return { init };
})();

