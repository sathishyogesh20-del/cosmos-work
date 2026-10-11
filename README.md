# Cosmos Work

An installable PWA and website — tasks, a focus timer, a calendar, a QR
scanner, live weather, a calculator and an AI assistant, all in one app.
Plain HTML/CSS/JS, no build step, no backend server.

## What's inside

```
cosmos-work/
├── index.html          the whole app shell + all stations
├── manifest.json        PWA manifest (install prompt, icons, theme)
├── sw.js                 service worker (offline shell + installability)
├── css/style.css         design system + layout
├── js/
│   ├── config.js          ← put your API keys here
│   ├── auth.js             Google sign-in via Firebase
│   ├── app.js              navigation, clock, install prompt
│   ├── todo.js              Tasks (localStorage)
│   ├── pomodoro.js          Focus Timer
│   ├── calendar.js          Calendar (localStorage)
│   ├── scanner.js           QR Scanner (camera + jsQR)
│   ├── weather.js           Live Weather (OpenWeather)
│   ├── calculator.js        Calculator
│   ├── chat.js                AI Assistant (Cosmos AI)
│   └── ad.js                  floating "powered by Cosmos" banner
└── icons/                app icons
```

Tasks, calendar events and chat history are saved in the browser's
`localStorage`, per device — there's no cloud database in this build.
Signing in with Google just personalizes the greeting and avatar; wiring
up per-account cloud sync (e.g. Firestore) is a natural next step if you
want tasks to follow you across devices.

## 1. Get your API keys

Open `js/config.js` and fill in:

**Firebase (Google sign-in)**
1. Go to the [Firebase console](https://console.firebase.google.com/) → *Add project*.
2. In the project, go to *Build → Authentication → Sign-in method* and enable **Google**.
3. Go to *Project settings → General → Your apps*, add a **Web app**, and copy the `firebaseConfig` object into `js/config.js`.
4. Still under Authentication, add your deployed domain (e.g. `your-app.vercel.app`) under **Authorized domains** — otherwise sign-in will fail once it's live.

**OpenWeather (live weather)**
1. Create a free account at [openweathermap.org](https://home.openweathermap.org/users/sign_up).
2. Grab your key from [API keys](https://home.openweathermap.org/api_keys).
3. New keys can take up to a couple of hours to activate.

**Cosmos AI (assistant)**
1. Cosmos AI runs on Groq's API under the hood — create a free key at [console.groq.com/keys](https://console.groq.com/keys).
2. Paste it into `cosmosApiKey` in `js/config.js`.
3. `js/config.js` defaults to `llama-3.3-70b-versatile` — swap `cosmosModel` for any model your account has access to.

> **Heads-up on the Cosmos AI key.** This app calls the underlying API
> directly from the browser, which means the key is visible in your
> site's source once deployed (`view-source` or devtools → Network tab).
> That's fine for a private/personal deployment, but if you plan to share
> the link publicly, anyone could read and reuse your key. For a public
> site, the safer route is a tiny serverless function (e.g. a Vercel Edge
> Function) that holds the key server-side and the app calls instead of
> hitting the API directly — ask me and I can add one. Firebase and
> OpenWeather keys are normally fine to expose client-side (Firebase is
> protected by its own security rules; OpenWeather free-tier keys are
> meant for client use).

## 2. Run it locally

No build tools needed — any static file server works:

```bash
cd cosmos-work
python3 -m http.server 8080
# then open http://localhost:8080
```

(PWA install and camera access require either `localhost` or `https://` —
they won't work over plain `http://` on another device.)

## 3. Deploy via GitHub + Vercel

1. Create a new GitHub repo and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Cosmos Work"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cosmos-work.git
   git push -u origin main
   ```
2. In [Vercel](https://vercel.com), click **Add New → Project**, import the repo.
3. Framework preset: **Other** (it's static — no build command, no output directory needed; or set output directory to `.`).
4. Deploy. Vercel gives you an `https://…vercel.app` URL automatically.
5. Add that URL to Firebase's **Authorized domains** (step above) so Google sign-in works on the live site.

## 4. Install it as an app

Once deployed over HTTPS:
- **Android/desktop Chrome/Edge:** visit the site → an "Install app" button appears in the top bar (or use the browser's install icon in the address bar).
- **iOS Safari:** open the site → Share → *Add to Home Screen*.

## Notes & easy extensions

- **Calculator, Tasks, Timer, Calendar** work fully offline with no keys.
- **Scanner** needs camera permission; it also accepts an uploaded image if you'd rather not use the camera.
- **Weather** falls back to your last-searched city if location access is denied.
- **Floating ad** — every 5 minutes (and once shortly after load) a small "Cosmos-Work is created and powered by **Cosmos**" banner floats up from the bottom and auto-dismisses after a few seconds; clicking it (not the × ) opens your portfolio link in a new tab. Tweak the URL, timing or copy in `js/ad.js`.
- Want cloud sync across devices, push notifications for the timer, or a server-side proxy for the Cosmos AI key? Those are the natural next steps — just ask.
