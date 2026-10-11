/**
 * Cosmos Work — Focus Timer (Pomodoro) module
 */
(function () {
  const RADIUS = 100;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const ringProgress = document.getElementById("ring-progress");
  const timeEl = document.getElementById("timer-time");
  const modeEl = document.getElementById("timer-mode");
  const startBtn = document.getElementById("timer-start");
  const resetBtn = document.getElementById("timer-reset");
  const skipBtn = document.getElementById("timer-skip");
  const workInput = document.getElementById("timer-work-min");
  const breakInput = document.getElementById("timer-break-min");
  const longBreakInput = document.getElementById("timer-long-break-min");
  const cyclesEl = document.getElementById("timer-cycles");

  if (ringProgress) {
    ringProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
  }

  let mode = "work"; // work | break | longBreak
  let secondsLeft = 25 * 60;
  let totalSeconds = 25 * 60;
  let running = false;
  let intervalId = null;
  let completedCycles = 0;

  function minutesFor(m) {
    if (m === "work") return parseInt(workInput.value, 10) || 25;
    if (m === "break") return parseInt(breakInput.value, 10) || 5;
    return parseInt(longBreakInput.value, 10) || 15;
  }

  function label(m) {
    if (m === "work") return "Focus session";
    if (m === "break") return "Short break";
    return "Long break";
  }

  function render() {
    const mins = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (secondsLeft % 60).toString().padStart(2, "0");
    timeEl.textContent = `${mins}:${secs}`;
    modeEl.textContent = label(mode);
    const progress = 1 - secondsLeft / totalSeconds;
    const offset = CIRCUMFERENCE * (1 - progress);
    if (ringProgress) ringProgress.style.strokeDashoffset = offset;
    cyclesEl.textContent = `Focus sessions completed today: ${completedCycles}`;
    startBtn.textContent = running ? "Pause" : secondsLeft === totalSeconds ? "Start" : "Resume";
  }

  function notify(title, body) {
    try {
      if (Notification && Notification.permission === "granted") {
        new Notification(title, { body, icon: "icons/icon-192.png" });
      }
    } catch (e) {}
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  function switchMode() {
    if (mode === "work") {
      completedCycles += 1;
      mode = completedCycles % 4 === 0 ? "longBreak" : "break";
      notify("Focus session complete", "Time for a break.");
    } else {
      mode = "work";
      notify("Break's over", "Back to focus.");
    }
    totalSeconds = minutesFor(mode) * 60;
    secondsLeft = totalSeconds;
    render();
  }

  function tick() {
    secondsLeft -= 1;
    if (secondsLeft <= 0) {
      switchMode();
      return;
    }
    render();
  }

  function start() {
    if (running) {
      running = false;
      clearInterval(intervalId);
      render();
      return;
    }
    if (Notification && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    running = true;
    intervalId = setInterval(tick, 1000);
    render();
  }

  function reset() {
    running = false;
    clearInterval(intervalId);
    totalSeconds = minutesFor(mode) * 60;
    secondsLeft = totalSeconds;
    render();
  }

  function skip() {
    running = false;
    clearInterval(intervalId);
    switchMode();
  }

  [workInput, breakInput, longBreakInput].forEach((inp) => {
    inp.addEventListener("change", () => {
      if (!running) reset();
    });
  });

  startBtn.addEventListener("click", start);
  resetBtn.addEventListener("click", reset);
  skipBtn.addEventListener("click", skip);

  window.addEventListener("cosmos:ready", () => {
    totalSeconds = minutesFor(mode) * 60;
    secondsLeft = totalSeconds;
    render();
  });
})();
