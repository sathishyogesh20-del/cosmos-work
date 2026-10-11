/**
 * Cosmos Work — Tasks module
 */
(function () {
  const STORAGE_KEY = "cosmos.todos";
  const input = document.getElementById("todo-input");
  const addBtn = document.getElementById("todo-add-btn");
  const list = document.getElementById("todo-list");
  const statOpen = document.getElementById("stat-open-tasks");
  const statDone = document.getElementById("stat-done-today");

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function render() {
    const items = load();
    list.innerHTML = "";

    if (items.length === 0) {
      list.innerHTML = '<li class="empty-note">No tasks yet — add your first one above.</li>';
    }

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (item.done ? " done" : "");

      const check = document.createElement("button");
      check.className = "todo-check" + (item.done ? " checked" : "");
      check.setAttribute("aria-label", item.done ? "Mark as not done" : "Mark as done");
      check.innerHTML = item.done
        ? '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : "";
      check.addEventListener("click", () => {
        item.done = !item.done;
        if (item.done) item.doneAt = Date.now();
        save(items);
        render();
      });

      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = item.text;

      const del = document.createElement("button");
      del.className = "todo-del";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        const next = load().filter((t) => t.id !== item.id);
        save(next);
        render();
      });

      li.append(check, text, del);
      list.appendChild(li);
    });

    const open = items.filter((i) => !i.done).length;
    const today = new Date().toDateString();
    const doneToday = items.filter(
      (i) => i.done && i.doneAt && new Date(i.doneAt).toDateString() === today
    ).length;
    if (statOpen) statOpen.textContent = open;
    if (statDone) statDone.textContent = doneToday;
  }

  function addTask() {
    const text = input.value.trim();
    if (!text) return;
    const items = load();
    items.unshift({ id: Date.now() + "-" + Math.random().toString(36).slice(2), text, done: false });
    save(items);
    input.value = "";
    render();
  }

  addBtn.addEventListener("click", addTask);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  window.addEventListener("cosmos:ready", render);
})();
