/**
 * Cosmos Work — AI Assistant module (Cosmos AI chat completions)
 */
(function () {
  const log = document.getElementById("chat-log");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");
  const clearBtn = document.getElementById("chat-clear");
  const noticeEl = document.getElementById("chat-notice");

  const HISTORY_KEY = "cosmos.chat.history";
  const SYSTEM_PROMPT =
    "You are the assistant built into Cosmos Work, a personal productivity app. " +
    "Be concise, practical, and friendly. You can help with tasks, planning, focus " +
    "strategies, quick calculations, and general questions.";

  function hasKey() {
    const k = window.COSMOS_CONFIG.cosmosApiKey;
    return k && !k.startsWith("YOUR_");
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(h) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(-40)));
  }

  function appendBubble(role, text) {
    const div = document.createElement("div");
    div.className = "chat-msg " + role;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function renderHistory() {
    log.innerHTML = "";
    const history = loadHistory();
    if (history.length === 0) {
      appendBubble("sys", "Ask me anything — I can help you plan your day, brainstorm, or just chat.");
    }
    history.forEach((m) => appendBubble(m.role === "assistant" ? "ai" : "user", m.content));
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;

    if (!hasKey()) {
      noticeEl.style.display = "flex";
      return;
    }

    input.value = "";
    const history = loadHistory();
    history.push({ role: "user", content: text });
    saveHistory(history);
    appendBubble("user", text);

    const thinking = appendBubble("ai", "Thinking…");
    sendBtn.disabled = true;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${window.COSMOS_CONFIG.cosmosApiKey}`,
        },
        body: JSON.stringify({
          model: window.COSMOS_CONFIG.cosmosModel || "openai/gpt-oss-120b",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.slice(-20)],
          temperature: 0.6,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Cosmos AI error (${res.status}): ${errBody.slice(0, 200)}`);
      }

      const data = await res.json();
      const reply = data.choices && data.choices[0] && data.choices[0].message.content
        ? data.choices[0].message.content
        : "Sorry, I didn't get a response.";

      thinking.textContent = reply;
      const h2 = loadHistory();
      h2.push({ role: "assistant", content: reply });
      saveHistory(h2);
    } catch (err) {
      thinking.textContent = "Something went wrong: " + err.message;
    } finally {
      sendBtn.disabled = false;
      log.scrollTop = log.scrollHeight;
    }
  }

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  clearBtn.addEventListener("click", () => {
    saveHistory([]);
    renderHistory();
  });

  window.addEventListener("cosmos:ready", () => {
    if (!hasKey()) noticeEl.style.display = "flex";
    renderHistory();
  });
})();
