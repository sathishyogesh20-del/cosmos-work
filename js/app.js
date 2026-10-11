/**
 * Cosmos Work — app shell: station navigation, clock, greeting
 */
(function () {
  const stations = document.querySelectorAll(".station");
  const navItems = document.querySelectorAll(".nav-item");
  const tabItems = document.querySelectorAll(".tab-item");

  function setActive(stationId) {
    stations.forEach((s) => s.classList.toggle("active", s.id === "station-" + stationId));
    navItems.forEach((n) => n.classList.toggle("active", n.dataset.station === stationId));
    tabItems.forEach((n) => n.classList.toggle("active", n.dataset.station === stationId));
    try {
      localStorage.setItem("cosmos.lastStation", stationId);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("cosmos:station", { detail: { stationId } }));
  }

  navItems.forEach((btn) =>
    btn.addEventListener("click", () => setActive(btn.dataset.station))
  );
  tabItems.forEach((btn) =>
    btn.addEventListener("click", () => setActive(btn.dataset.station))
  );

  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById("topbar-clock");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  function setGreeting(user) {
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    const name = user && user.displayName ? user.displayName.split(" ")[0] : null;
    const el = document.getElementById("topbar-greeting-text");
    if (el) el.textContent = name ? `${greeting}, ${name}` : `${greeting}`;
    const dateEl = document.getElementById("topbar-date");
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  }

  window.addEventListener("cosmos:ready", (e) => {
    setGreeting(e.detail.user);
    const last = (() => {
      try {
        return localStorage.getItem("cosmos.lastStation");
      } catch (err) {
        return null;
      }
    })();
    setActive(last && document.getElementById("station-" + last) ? last : "dashboard");
  });

  setInterval(updateClock, 1000);
  updateClock();

  // Register service worker for installability + offline shell
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  // Install prompt handling
  let deferredPrompt = null;
  const installBtn = document.getElementById("btn-install");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = "inline-flex";
  });
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  }
  window.addEventListener("appinstalled", () => {
    if (installBtn) installBtn.style.display = "none";
  });
})();
