/**
 * Cosmos Work — Calculator module
 */
(function () {
  const mainEl = document.getElementById("calc-main");
  const subEl = document.getElementById("calc-sub");
  const keys = document.querySelectorAll(".calc-key");

  let expression = "";
  let lastResult = null;

  function formatForDisplay(expr) {
    return expr.replace(/\*/g, "×").replace(/\//g, "÷");
  }

  function render() {
    mainEl.textContent = expression ? formatForDisplay(expression) : "0";
    subEl.textContent = lastResult !== null ? `= ${lastResult}` : "";
  }

  function safeEval(expr) {
    // Only allow digits, operators, decimal points, parentheses and whitespace.
    if (!/^[0-9+\-*/().%\s]+$/.test(expr)) throw new Error("Invalid input");
    // eslint-disable-next-line no-new-func
    const fn = new Function(`"use strict"; return (${expr.replace(/%/g, "/100")});`);
    const result = fn();
    if (typeof result !== "number" || !isFinite(result)) throw new Error("Invalid result");
    return result;
  }

  function press(key) {
    if (key === "C") {
      expression = "";
      lastResult = null;
    } else if (key === "DEL") {
      expression = expression.slice(0, -1);
    } else if (key === "=") {
      if (!expression) return;
      try {
        const result = safeEval(expression);
        lastResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
        expression = String(lastResult);
      } catch (e) {
        lastResult = "Error";
      }
    } else {
      expression += key;
    }
    render();
  }

  keys.forEach((btn) => {
    btn.addEventListener("click", () => press(btn.dataset.key));
  });

  window.addEventListener("keydown", (e) => {
    const calcStation = document.getElementById("station-calculator");
    if (!calcStation || !calcStation.classList.contains("active")) return;
    if (/^[0-9+\-*/.%()]$/.test(e.key)) press(e.key);
    else if (e.key === "Enter") press("=");
    else if (e.key === "Backspace") press("DEL");
    else if (e.key === "Escape") press("C");
  });

  window.addEventListener("cosmos:ready", render);
})();
