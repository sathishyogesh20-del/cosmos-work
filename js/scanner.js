/**
 * Cosmos Work — QR Scanner module (camera + jsQR, no server round trip)
 */
(function () {
  const video = document.getElementById("scan-video");
  const canvas = document.getElementById("scan-canvas");
  const startBtn = document.getElementById("scan-start");
  const stopBtn = document.getElementById("scan-stop");
  const resultBox = document.getElementById("scan-result");
  const resultText = document.getElementById("scan-result-text");
  const openBtn = document.getElementById("scan-open");
  const copyBtn = document.getElementById("scan-copy");
  const fileInput = document.getElementById("scan-file-input");

  let stream = null;
  let rafId = null;
  const ctx = canvas ? canvas.getContext("2d", { willReadFrequently: true }) : null;

  function isUrl(str) {
    try {
      new URL(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  function showResult(text) {
    resultText.textContent = text;
    resultBox.classList.add("show");
    openBtn.style.display = isUrl(text) ? "inline-flex" : "none";
    openBtn.onclick = () => window.open(text, "_blank", "noopener");
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
      } catch (e) {}
    };
    stopScan();
  }

  function scanFrame() {
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafId = requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (window.jsQR) {
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code && code.data) {
        showResult(code.data);
        return;
      }
    }
    rafId = requestAnimationFrame(scanFrame);
  }

  async function startScan() {
    resultBox.classList.remove("show");
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      video.srcObject = stream;
      await video.play();
      startBtn.style.display = "none";
      stopBtn.style.display = "inline-flex";
      rafId = requestAnimationFrame(scanFrame);
    } catch (err) {
      alert("Couldn't access the camera: " + (err.message || err.name));
    }
  }

  function stopScan() {
    if (rafId) cancelAnimationFrame(rafId);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    startBtn.style.display = "inline-flex";
    stopBtn.style.display = "none";
  }

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file || !window.jsQR) return;
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          showResult(code.data);
        } else {
          alert("No QR code found in that image.");
        }
      };
      img.src = URL.createObjectURL(file);
    });
  }

  startBtn.addEventListener("click", startScan);
  stopBtn.addEventListener("click", stopScan);

  window.addEventListener("cosmos:station", (e) => {
    if (e.detail.stationId !== "scanner") stopScan();
  });
})();
