/**
 * Cosmos Work — Calendar module
 */
(function () {
  const STORAGE_KEY = "cosmos.events";
  const grid = document.getElementById("cal-grid");
  const monthLabel = document.getElementById("cal-month-label");
  const prevBtn = document.getElementById("cal-prev");
  const nextBtn = document.getElementById("cal-next");
  const todayBtn = document.getElementById("cal-today");
  const eventList = document.getElementById("event-list");
  const eventInput = document.getElementById("event-input");
  const eventAddBtn = document.getElementById("event-add-btn");
  const selectedLabel = document.getElementById("event-selected-label");
  const statNextEvent = document.getElementById("stat-next-event");

  let viewDate = new Date();
  let selected = new Date();

  function key(d) {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function renderGrid() {
    const events = load();
    grid.innerHTML = "";
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => {
      const el = document.createElement("div");
      el.className = "cal-dow";
      el.textContent = d;
      grid.appendChild(el);
    });

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      const filler = document.createElement("div");
      filler.className = "cal-cell empty";
      grid.appendChild(filler);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const cell = document.createElement("button");
      cell.className = "cal-cell";
      if (cellDate.toDateString() === today.toDateString()) cell.classList.add("today");
      if (cellDate.toDateString() === selected.toDateString()) cell.classList.add("selected");

      const num = document.createElement("span");
      num.textContent = day;
      cell.appendChild(num);

      if ((events[key(cellDate)] || []).length > 0) {
        const dot = document.createElement("span");
        dot.className = "dot";
        cell.appendChild(dot);
      }

      cell.addEventListener("click", () => {
        selected = cellDate;
        renderGrid();
        renderEvents();
      });

      grid.appendChild(cell);
    }

    monthLabel.textContent = viewDate.toLocaleDateString([], { month: "long", year: "numeric" });
  }

  function renderEvents() {
    const events = load();
    const dayEvents = events[key(selected)] || [];
    eventList.innerHTML = "";
    selectedLabel.textContent = selected.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    if (dayEvents.length === 0) {
      eventList.innerHTML = '<li class="empty-note">No events this day.</li>';
    }

    dayEvents.forEach((ev, idx) => {
      const li = document.createElement("li");
      li.className = "event-item";
      const span = document.createElement("span");
      span.textContent = ev;
      const del = document.createElement("button");
      del.className = "todo-del";
      del.textContent = "Remove";
      del.addEventListener("click", () => {
        const all = load();
        all[key(selected)].splice(idx, 1);
        if (all[key(selected)].length === 0) delete all[key(selected)];
        save(all);
        renderGrid();
        renderEvents();
        updateNextEventStat();
      });
      li.append(span, del);
      eventList.appendChild(li);
    });
  }

  function updateNextEventStat() {
    if (!statNextEvent) return;
    const events = load();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = Object.keys(events)
      .map((k) => {
        const [y, m, d] = k.split("-").map(Number);
        return { date: new Date(y, m - 1, d), items: events[k] };
      })
      .filter((e) => e.date >= today && e.items.length > 0)
      .sort((a, b) => a.date - b.date);
    statNextEvent.textContent = upcoming.length
      ? upcoming[0].date.toLocaleDateString([], { month: "short", day: "numeric" })
      : "—";
  }

  function addEvent() {
    const text = eventInput.value.trim();
    if (!text) return;
    const all = load();
    const k = key(selected);
    all[k] = all[k] || [];
    all[k].push(text);
    save(all);
    eventInput.value = "";
    renderGrid();
    renderEvents();
    updateNextEventStat();
  }

  prevBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderGrid();
  });
  nextBtn.addEventListener("click", () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderGrid();
  });
  todayBtn.addEventListener("click", () => {
    viewDate = new Date();
    selected = new Date();
    renderGrid();
    renderEvents();
  });
  eventAddBtn.addEventListener("click", addEvent);
  eventInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addEvent();
  });

  window.addEventListener("cosmos:ready", () => {
    renderGrid();
    renderEvents();
    updateNextEventStat();
  });
})();
