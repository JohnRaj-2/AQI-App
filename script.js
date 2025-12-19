// ✅ YOUR API KEY 
const API_KEY = "db5016a6b0cfa2d922a63d9737a37f2e";

/* =====================================================
   CPCB AQI CALCULATION HELPERS (INDIAN STANDARD)
===================================================== */

const pm25Breakpoints = [
  { cLow: 0, cHigh: 30, aLow: 0, aHigh: 50 },
  { cLow: 31, cHigh: 60, aLow: 51, aHigh: 100 },
  { cLow: 61, cHigh: 90, aLow: 101, aHigh: 200 },
  { cLow: 91, cHigh: 120, aLow: 201, aHigh: 300 },
  { cLow: 121, cHigh: 250, aLow: 301, aHigh: 400 },
  { cLow: 251, cHigh: 500, aLow: 401, aHigh: 500 }
];

const pm10Breakpoints = [
  { cLow: 0, cHigh: 50, aLow: 0, aHigh: 50 },
  { cLow: 51, cHigh: 100, aLow: 51, aHigh: 100 },
  { cLow: 101, cHigh: 250, aLow: 101, aHigh: 200 },
  { cLow: 251, cHigh: 350, aLow: 201, aHigh: 300 },
  { cLow: 351, cHigh: 430, aLow: 301, aHigh: 400 },
  { cLow: 431, cHigh: 600, aLow: 401, aHigh: 500 }
];

function calculateCPCBAQI(pm, breakpoints) {
  for (let bp of breakpoints) {
    if (pm >= bp.cLow && pm <= bp.cHigh) {
      return Math.round(
        ((bp.aHigh - bp.aLow) / (bp.cHigh - bp.cLow)) *
          (pm - bp.cLow) +
          bp.aLow
      );
    }
  }
  return 500;
}

/* =====================================================
   CITY SEARCH
===================================================== */

async function getCityAQI() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Please enter a city name");
    return;
  }

  try {
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
    fetchAQI(lat, lon, name);

  } catch (error) {
    console.error(error);
    alert("Error fetching city AQI");
  }
}

/* =====================================================
   LIVE LOCATION
===================================================== */

function getLiveLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const locationName = await getLocationName(lat, lon);
      fetchAQI(lat, lon, locationName);
    },
    () => alert("Location permission denied")
  );
}


/* =====================================================
   AQI FETCH + INDIAN AQI LOGIC
===================================================== */

async function fetchAQI(lat, lon, locationName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error("AQI API failed");

    const data = await response.json();
    const c = data.list[0].components;

    // Calculate Indian AQI
    const aqiPM25 = calculateCPCBAQI(c.pm2_5, pm25Breakpoints);
    const aqiPM10 = calculateCPCBAQI(c.pm10, pm10Breakpoints);
    const indianAQI = Math.max(aqiPM25, aqiPM10);

    // Show UI
    document.getElementById("result").classList.remove("hidden");
    document.getElementById("cityName").innerText = locationName;
    document.getElementById("aqiValue").innerText = indianAQI;

    setIndianAQIStyle(indianAQI);

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

/* =====================================================
   INDIAN AQI COLORS + EMOJIS
===================================================== */

function setIndianAQIStyle(aqi) {
  const circle = document.getElementById("aqiCircle");
  const status = document.getElementById("aqiStatus");

  if (aqi <= 50) {
    circle.style.background = "#009966";
    status.innerText = "Good 😊";
  } else if (aqi <= 100) {
    circle.style.background = "#ffde33";
    status.innerText = "Satisfactory 🙂";
  } else if (aqi <= 200) {
    circle.style.background = "#ff9933";
    status.innerText = "Moderate 😐";
  } else if (aqi <= 300) {
    circle.style.background = "#cc0033";
    status.innerText = "Poor 😷";
  } else if (aqi <= 400) {
    circle.style.background = "#660099";
    status.innerText = "Very Poor 🤒";
  } else {
    circle.style.background = "#7e0023";
    status.innerText = "Severe ☠️";
  }
}

async function getLocationName(lat, lon) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );

    if (!res.ok) throw new Error("Reverse geo failed");

    const data = await res.json();

    if (data && data.length > 0) {
      const place = data[0];
      return `${place.name}, ${place.state || ""}`;
    }

    return "Your Location";
  } catch (err) {
    console.error(err);
    return "Your Location";
  }
}
