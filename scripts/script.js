const apiKey = "YOUR_API_KEY";
const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=`;
const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=`;

const weatherIcon = document.querySelector(".weather-icon");
const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?limit=50&appid=${apiKey}`;

const cityInput = document.querySelector("#city");
const suggestionsBox = document.querySelector("#suggestions");

// Fetch city names as user types 
cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();

    if (query.length > 0) { // Start showing results on any input
        const matches = await fetchCities(query);
        renderSuggestions(matches);
    } else {
        suggestionsBox.innerHTML = ""; // Clear suggestions
    }
});

// Fetch city data from API
async function fetchCities(query) {
    try {
        const response = await fetch(`${geoApiUrl}&q=${query}`);
        if (!response.ok) throw new Error("Failed to fetch cities.");
        const data = await response.json();

        // Return up to 50 suggestions with their country
        return data.map(city => `${city.name}, ${city.country}`);
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Render suggestions in dropdown
function renderSuggestions(matches) {
    suggestionsBox.innerHTML = ""; // Clear previous results

    if (matches.length > 0) {
        matches.slice(0, 50).forEach(match => { // Show up to 50 suggestions
            const li = document.createElement("li");
            li.textContent = match;

            // Click event to select a city
            li.addEventListener("click", () => {
                cityInput.value = match.split(",")[0]; // Fill input with the city name
                suggestionsBox.innerHTML = ""; // Clear suggestions
            });

            suggestionsBox.appendChild(li);
        });

        // Ensure dropdown appears below the input field
        const inputRect = cityInput.getBoundingClientRect();
        suggestionsBox.style.top = `${inputRect.bottom + window.scrollY}px`;
        suggestionsBox.style.left = `${inputRect.left + window.scrollX}px`;
    }
}
// Display the current weather
async function displayCurrentWeather(city) {
    const response = await fetch(currentWeatherUrl + city + `&appid=${apiKey}`);
    if (response.status === 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        const data = await response.json();
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + `°C`;
        document.querySelector(".humidity").innerHTML = data.main.humidity + `%`;
        document.querySelector(".wind").innerHTML = data.wind.speed + ` km/h`;

        // Update weather icon
        updateWeatherIcon(data.weather[0].main, weatherIcon);
        document.querySelector(".error").style.display = "none";
        document.querySelector(".weather").style.display = "block";
    }
}

// Display the weather forecast for the next 3 days
async function displayForecast(city) {
    const response = await fetch(forecastWeatherUrl + city + `&appid=${apiKey}`);
    if (response.ok) {
        const data = await response.json();
        const forecastContainer = document.querySelector(".forecast");
        forecastContainer.innerHTML = ""; // Clear previous forecast

        const dailyForecasts = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = [];
            }
            dailyForecasts[date].push(item);
        });

        Object.keys(dailyForecasts).slice(1, 4).forEach(date => {
            const dayData = dailyForecasts[date];
            const avgTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
            const mainWeather = dayData[0].weather[0].main;

            // Create forecast card
            const forecastCard = document.createElement("div");
            forecastCard.classList.add("forecast-card");
            forecastCard.innerHTML = `
                <h3>${new Date(date).toLocaleDateString("en-US", { weekday: "long" })}</h3>
                <img src="images/${getWeatherIcon(mainWeather)}" alt="${mainWeather}">
                <p>Temp: ${Math.round(avgTemp)}°C</p>
                <p>${mainWeather}</p>
            `;
            forecastContainer.appendChild(forecastCard);
        });
    }
}

// Get appropriate weather icon filename
function getWeatherIcon(condition) {
    if (condition === "Clouds") return "clouds.png";
    if (condition === "Rain") return "rain.png";
    if (condition === "Clear") return "clear.png";
    if (condition === "Drizzle") return "drizzle.png";
    if (condition === "Snow") return "snow.png";
    if (condition === "Mist") return "mist.png";
    return "default.png";
}

// Update weather icon
function updateWeatherIcon(condition, iconElement) {
    iconElement.src = `images/${getWeatherIcon(condition)}`;
}

// Event listener for search button
const searchInp = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
searchBtn.addEventListener("click", () => {
    const city = searchInp.value;
    displayCurrentWeather(city);
    displayForecast(city);
    searchInp.value = '';
});
