// OpenWeather API Key
const apiKey = '2c8ac01b254ed2323ac1fb880aa20763';  

// Elements
const cityInput = document.getElementById('city-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const descEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const dateEl = document.getElementById('date');
let barChartCtx, doughnutChartCtx, lineChartCtx;

// Initialize chart variables globally
let myBarChart, myDoughnutChart, myLineChart;

// Wait for the page to fully load before getting chart contexts
document.addEventListener("DOMContentLoaded", () => {
    barChartCtx = document.getElementById('barChart').getContext('2d');
    doughnutChartCtx = document.getElementById('doughnutChart').getContext('2d');
    lineChartCtx = document.getElementById('lineChart').getContext('2d');
});

// Fetch weather data
getWeatherBtn.addEventListener('click', () => {
    const city = cityInput.value;
    getWeatherData(city);
});

function getWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`City not found or API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateWeatherWidget(data);
            getForecastData(city);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('City not found.');
        });
}

function getFormattedDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    return today.toLocaleDateString(undefined, options);
}

// Update weather widget with current data
function updateWeatherWidget(data) {
    cityNameEl.textContent = data.name;
    tempEl.textContent = `Temperature: ${data.main.temp}°C`;
    descEl.textContent = `Weather: ${data.weather[0].description}`;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windSpeedEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    dateEl.textContent = `Date: ${getFormattedDate()}`;
}

function getForecastData(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(forecastUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching forecast data: ${response.status}`);
            }
            return response.json();
        })
        .then(forecastData => {
            console.log('Forecast Data:', forecastData); // Debugging
            const filteredForecast = forecastData.list.filter((_, index) => index % 8 === 0); // Taking daily forecasts every 8 intervals (3-hourly forecasts)
            renderCharts(filteredForecast); // Render charts
            updateForecastBlocks(filteredForecast); // Update forecast blocks
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Error fetching forecast data. Please try again.');
        });
}


// Render dynamic charts based on forecast data
function renderCharts(forecast) {
    const labels = forecast.map(day => new Date(day.dt_txt).toLocaleDateString());
    const temps = forecast.map(day => day.main.temp);
    const weatherConditions = forecast.map(day => day.weather[0].main); // Main weather condition (Clear, Rain, etc.)

    // Destroy existing charts to avoid memory leaks when redrawing
    if (myBarChart) myBarChart.destroy();
    if (myDoughnutChart) myDoughnutChart.destroy();
    if (myLineChart) myLineChart.destroy();

    // Create Bar Chart (Temperature)
    myBarChart = new Chart(barChartCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }]
        }
    });

    // Create Doughnut Chart (Weather Conditions Distribution)
    const conditionCounts = countWeatherConditions(weatherConditions);
    myDoughnutChart = new Chart(doughnutChartCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: ['red', 'blue', 'yellow', 'green', 'orange']
            }]
        }
    });

    // Create Line Chart (Temperature Trend)
    myLineChart = new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: 'rgba(153, 102, 255, 0.6)',
                fill: false,
            }]
        }
    });
}

function updateForecastBlocks(forecast) {
    // Format each day with date and temperature
    for (let i = 0; i < 5; i++) {
        const dateEl = document.getElementById(`day${i + 1}-date`);
        const tempEl = document.getElementById(`day${i + 1}-temp`);
        const iconEl = document.querySelector(`#day${i + 1}-icon`);

        const date = new Date(forecast[i].dt_txt).toLocaleDateString();
        const temp = forecast[i].main.temp;
        const weatherCondition = forecast[i].weather[0].main;

        dateEl.textContent = date;
        tempEl.textContent = `${temp}°C`;

        // Set the weather icon based on the weather condition
        let iconClass = "fas fa-cloud"; // default icon
        switch (weatherCondition.toLowerCase()) {
            case "clear":
                iconClass = "fas fa-sun";
                break;
            case "clouds":
                iconClass = "fas fa-cloud";
                break;
            case "rain":
                iconClass = "fas fa-cloud-showers-heavy";
                break;
            case "snow":
                iconClass = "fas fa-snowflake";
                break;
        }
        iconEl.className = iconClass;
    }
}


// Count occurrences of different weather conditions
function countWeatherConditions(conditions) {
    const conditionCounts = {};
    conditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });
    return conditionCounts;
}




