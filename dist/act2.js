const Act2 = (() => {
  let inited = false;

  function renderMemories() {
    const box = document.getElementById("memory-timeline");
    if (!box) return;
    box.innerHTML = "";
    BIRTHDAY_CONFIG.memories.forEach((m) => {
      const el = document.createElement("article");
      el.className = "memory-item";
      el.innerHTML = `
        <div class="memory-head">
          <span class="memory-date">${m.date}</span>
          <span>点击展开</span>
        </div>
        <h3 class="memory-title">${m.title}</h3>
        <div class="memory-body">${m.text}</div>
      `;
      el.addEventListener("click", () => {
        el.classList.toggle("open");
        if (typeof AudioEngine !== "undefined" && AudioEngine.blip) {
          AudioEngine.blip(640, 100);
        }
      });
      box.appendChild(el);
    });
  }

  function init() {
    if (inited) return;
    inited = true;
    renderMemories();
    const btn = document.getElementById("to-act3");
    if (btn) {
      btn.addEventListener("click", () => {
        if (typeof AudioEngine !== "undefined" && AudioEngine.success) {
          AudioEngine.success();
        }
        window.dispatchEvent(new Event("act2:done"));
      });
    }
  }

  return { init };
})();

