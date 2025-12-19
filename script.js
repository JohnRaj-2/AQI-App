// ✅ YOUR API KEY (already added)
const API_KEY = "90ea847d3ee5733d1dd879f703b5ff6b";

// ================= CITY SEARCH =================
async function getCityAQI() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Please enter a city name");
    return;
  }

  try {
    // 1️⃣ Get latitude & longitude from city name
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if (!geoResponse.ok) throw new Error("Geo API failed");

    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      alert("City not found");
      return;
    }

    const { lat, lon, name } = geoData[0];

    // 2️⃣ Fetch AQI
    fetchAQI(lat, lon, name);

  } catch (error) {
    console.error(error);
    alert("Error fetching city AQI");
  }
}

// ================= LIVE LOCATION =================
function getLiveLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchAQI(lat, lon, "Your Location");
    },
    () => {
      alert("Location permission denied");
    }
  );
}

// ================= AQI FETCH =================
async function fetchAQI(lat, lon, locationName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("AQI API failed");

    const data = await response.json();

    const aqi = data.list[0].main.aqi;
    const c = data.list[0].components;

    // Show UI
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("cityName").innerText = locationName;
    document.getElementById("aqiValue").innerText = aqi;

    setAQIStyle(aqi);

    // Pollutants
    document.getElementById("pm25").innerText = c.pm2_5;
    document.getElementById("pm10").innerText = c.pm10;
    document.getElementById("co").innerText = c.co;
    document.getElementById("no2").innerText = c.no2;
    document.getElementById("so2").innerText = c.so2;
    document.getElementById("o3").innerText = c.o3;

  } catch (error) {
    console.error(error);
    alert("Failed to fetch AQI data");
  }
}

// ================= AQI COLORS & STATUS =================
function setAQIStyle(aqi) {
  const circle = document.getElementById("aqiCircle");
  const status = document.getElementById("aqiStatus");

  if (aqi === 1) {
    circle.style.background = "#00e676";
    status.innerText = "Good (Clean Air)";
  } else if (aqi === 2) {
    circle.style.background = "#ffee58";
    status.innerText = "Fair";
  } else if (aqi === 3) {
    circle.style.background = "#ff9800";
    status.innerText = "Moderate";
  } else if (aqi === 4) {
    circle.style.background = "#f44336";
    status.innerText = "Poor";
  } else if (aqi === 5) {
    circle.style.background = "#6a1b9a";
    status.innerText = "Very Poor";
  }
}
