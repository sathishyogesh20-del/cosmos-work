/**
 * Cosmos Work — configuration
 * -----------------------------------------------------------------------
 * Fill these in with your own keys before deploying. See README.md for
 * where to get each one and important notes on key exposure.
 *
 * This is a static, client-only app (no backend), so anything placed
 * here is visible to anyone who views your deployed site's source.
 * That's normal for Firebase + OpenWeather, but read the README's note
 * about the Cosmos AI key before shipping this publicly.
 * -----------------------------------------------------------------------
 */

window.COSMOS_CONFIG = {
  // --- Firebase (Authentication) -----------------------------------
  // Firebase console → Project settings → General → Your apps → SDK setup
  firebase: {
     apiKey: "AIzaSyAnWXgFksED_KvH84DZumFUySTlS63N-6Q",
  authDomain: "cosmos-work.firebaseapp.com",
  projectId: "cosmos-work",
  storageBucket: "cosmos-work.firebasestorage.app",
  messagingSenderId: "617355397755",
  appId: "1:617355397755:web:6e24bca0ef273167a7f0de"
  },

  // --- OpenWeather ----------------------------------------------------
  // https://home.openweathermap.org/api_keys
  openWeatherApiKey: "4df59b7a0384fac5ecb0d559522b882e",
  // "metric" = °C, "imperial" = °F
  weatherUnits: "metric",

  // --- Cosmos AI (chat) --------------------------------------------------
  // Cosmos AI runs on Groq's API under the hood — grab a free key from
  // https://console.groq.com/keys
  cosmosApiKey: "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",
  cosmosModel: "openai/gpt-oss-120b",

  // Let people use the app without signing in with Google
  allowGuestMode: true,
};
