/**
 * Cosmos Work — floating "powered by Cosmos" banner
 * Appears shortly after load, then again every 5 minutes, on every
 * station. Clicking it (not the close button) opens the Cosmos portfolio.
 */
(function () {
  const AD_URL = "https://sathishyogesh20-del.github.io/MY_PORTFOLIO/";
  const REPEAT_MS = 5 * 60 * 1000; // every 5 minutes
  const FIRST_SHOW_DELAY_MS = 3000; // first appearance, shortly after load
  const VISIBLE_MS = 9000; // auto-dismiss after this long

  let adEl = null;
  let hideTimeoutId = null;

  function buildAd() {
    adEl = document.createElement("div");
    adEl.className = "floating-ad";
    adEl.setAttribute("role", "button");
    adEl.setAttribute("tabindex", "0");
    adEl.setAttribute(
      "aria-label",
      "Cosmos-Work is created and powered by Cosmos. Open the Cosmos portfolio."
    );

    const text = document.createElement("span");
    text.className = "floating-ad-text";
    text.append("Cosmos-Work is created and powered by ");
    const highlight = document.createElement("span");
    highlight.className = "brand-highlight";
    highlight.textContent = "Cosmos";
    text.appendChild(highlight);

    const closeBtn = document.createElement("button");
    closeBtn.className = "floating-ad-close";
    closeBtn.setAttribute("aria-label", "Dismiss");
    closeBtn.textContent = "\u00D7"; // ×

    adEl.append(text, closeBtn);
    document.body.appendChild(adEl);

    adEl.addEventListener("click", (e) => {
      if (e.target === closeBtn) {
        hideAd();
        return;
      }
      window.open(AD_URL, "_blank", "noopener");
    });

    adEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.open(AD_URL, "_blank", "noopener");
      }
    });
  }

  function showAd() {
    if (!adEl) buildAd();
    adEl.classList.add("show");
    clearTimeout(hideTimeoutId);
    hideTimeoutId = setTimeout(hideAd, VISIBLE_MS);
  }

  function hideAd() {
    if (adEl) adEl.classList.remove("show");
  }

  let started = false;
  window.addEventListener("cosmos:ready", () => {
    if (started) return;
    started = true;
    setTimeout(showAd, FIRST_SHOW_DELAY_MS);
    setInterval(showAd, REPEAT_MS);
  });
})();
