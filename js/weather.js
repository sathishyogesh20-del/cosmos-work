/**
 * Cosmos Work — Live Weather module (OpenWeather)
 */
(function () {
  const placeEl = document.getElementById("weather-place");
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  const feelsEl = document.getElementById("weather-feels");
  const humidityEl = document.getElementById("weather-humidity");
  const windEl = document.getElementById("weather-wind");
  const refreshBtn = document.getElementById("weather-refresh");
  const cityInput = document.getElementById("weather-city-input");
  const citySearchBtn = document.getElementById("weather-city-search");
  const noticeEl = document.getElementById("weather-notice");
  const topbarChip = document.getElementById("topbar-weather");
  const topbarTemp = document.getElementById("topbar-weather-temp");

  const CACHE_KEY = "cosmos.weather.lastCity";

  function unitsSuffix() {
    return window.COSMOS_CONFIG.weatherUnits === "imperial" ? "°F" : "°C";
  }

  function hasKey() {
    const k = window.COSMOS_CONFIG.openWeatherApiKey;
    return k && !k.startsWith("YOUR_");
  }

  function renderData(data) {
    if (!data) return;
    placeEl.textContent = `${data.name}${data.sys && data.sys.country ? ", " + data.sys.country : ""}`;
    tempEl.textContent = `${Math.round(data.main.temp)}${unitsSuffix()}`;
    descEl.textContent = data.weather[0].description;
    feelsEl.textContent = `${Math.round(data.main.feels_like)}${unitsSuffix()}`;
    humidityEl.textContent = `${data.main.humidity}%`;
    windEl.textContent = `${Math.round(data.wind.speed)} ${
      window.COSMOS_CONFIG.weatherUnits === "imperial" ? "mph" : "m/s"
    }`;

    if (topbarChip) {
      topbarChip.style.display = "flex";
      topbarTemp.textContent = `${Math.round(data.main.temp)}${unitsSuffix()} · ${data.name}`;
    }

    try {
      localStorage.setItem(CACHE_KEY, data.name);
    } catch (e) {}
  }

  async function fetchByCoords(lat, lon) {
    const key = window.COSMOS_CONFIG.openWeatherApiKey;
    const units = window.COSMOS_CONFIG.weatherUnits || "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather lookup failed (" + res.status + ")");
    return res.json();
  }

  async function fetchByCity(city) {
    const key = window.COSMOS_CONFIG.openWeatherApiKey;
    const units = window.COSMOS_CONFIG.weatherUnits || "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=${units}&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    return res.json();
  }

  async function loadWeather() {
    if (!hasKey()) {
      noticeEl.style.display = "flex";
      return;
    }
    noticeEl.style.display = "none";
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const data = await fetchByCoords(pos.coords.latitude, pos.coords.longitude);
              renderData(data);
            } catch (e) {
              fallbackToCachedCity();
            }
          },
          () => fallbackToCachedCity(),
          { timeout: 6000 }
        );
      } else {
        fallbackToCachedCity();
      }
    } catch (e) {
      fallbackToCachedCity();
    }
  }

  async function fallbackToCachedCity() {
    let city = "London";
    try {
      city = localStorage.getItem(CACHE_KEY) || city;
    } catch (e) {}
    try {
      const data = await fetchByCity(city);
      renderData(data);
    } catch (e) {
      descEl.textContent = "Couldn't load weather right now.";
    }
  }

  async function searchCity() {
    const city = cityInput.value.trim();
    if (!city || !hasKey()) return;
    try {
      const data = await fetchByCity(city);
      renderData(data);
    } catch (e) {
      alert("Couldn't find that city.");
    }
  }

  if (refreshBtn) refreshBtn.addEventListener("click", loadWeather);
  if (citySearchBtn) citySearchBtn.addEventListener("click", searchCity);
  if (cityInput)
    cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") searchCity();
    });

  window.addEventListener("cosmos:ready", loadWeather);
})();
