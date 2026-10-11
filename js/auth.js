/**
 * Cosmos Work — Google sign-in via Firebase Authentication
 */
(function () {
  const cfg = window.COSMOS_CONFIG.firebase;
  const hasRealConfig = cfg && cfg.apiKey && !cfg.apiKey.startsWith("YOUR_");

  const gate = document.getElementById("auth-gate");
  const shell = document.getElementById("shell");
  const btnGoogle = document.getElementById("btn-google");
  const btnSkip = document.getElementById("btn-skip");
  const btnSignOut = document.getElementById("btn-sign-out");
  const sidebarAvatar = document.getElementById("sidebar-avatar");
  const sidebarName = document.getElementById("sidebar-name");

  let auth = null;

  function enterApp(user) {
    gate.style.display = "none";
    shell.classList.add("active");
    if (user) {
      sidebarAvatar.src = user.photoURL || "icons/icon-192.png";
      sidebarName.textContent = user.displayName || user.email || "Signed in";
      sidebarName.title = user.email || "";
    } else {
      sidebarAvatar.src = "icons/icon-192.png";
      sidebarName.textContent = "Guest";
    }
    window.dispatchEvent(new CustomEvent("cosmos:ready", { detail: { user } }));
  }

  if (hasRealConfig && window.firebase) {
    firebase.initializeApp(cfg);
    auth = firebase.auth();

    auth.onAuthStateChanged((user) => {
      if (user) enterApp(user);
    });

    btnGoogle.addEventListener("click", async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      btnGoogle.disabled = true;
      btnGoogle.textContent = "Signing in…";
      try {
        await auth.signInWithPopup(provider);
      } catch (err) {
        console.error(err);
        alert("Sign-in failed: " + (err.message || err.code || "unknown error"));
        btnGoogle.disabled = false;
        btnGoogle.textContent = "Continue with Google";
      }
    });

    btnSignOut.addEventListener("click", () => {
      auth.signOut().then(() => {
        shell.classList.remove("active");
        gate.style.display = "flex";
        btnGoogle.disabled = false;
        btnGoogle.textContent = "Continue with Google";
      });
    });
  } else {
    // No Firebase config set yet — fall back straight to guest mode so the
    // rest of the app is still usable while you wire up your keys.
    btnGoogle.addEventListener("click", () => {
      alert(
        "Add your Firebase config in js/config.js to enable Google sign-in. Continuing as guest for now."
      );
      enterApp(null);
    });
    btnSignOut.addEventListener("click", () => {
      shell.classList.remove("active");
      gate.style.display = "flex";
    });
  }

  if (btnSkip) {
    btnSkip.style.display = window.COSMOS_CONFIG.allowGuestMode ? "inline" : "none";
    btnSkip.addEventListener("click", () => enterApp(null));
  }
})();
