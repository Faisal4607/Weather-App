document.addEventListener("DOMContentLoaded", () => {
    const API_KEY = "2c8ac01b254ed2323ac1fb880aa20763";
    let forecastData = [];

    // Fetch forecast data for the specified city
    async function fetchForecast(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
            );
            const data = await response.json();
            if (data.cod === "200") {
                forecastData = data.list.map((entry) => ({
                    date: new Date(entry.dt_txt).toLocaleDateString(),
                    temp: entry.main.temp,
                    condition: entry.weather[0].main,
                }));
                renderTable(paginate(forecastData, 1));
                renderPagination(forecastData);
            } else {
                alert("City not found!");
            }
        } catch (error) {
            console.error("Error fetching forecast:", error);
        }
    }

    let currentPage = 1;
    const entriesPerPage = 10;

    // Render forecast table with paginated data
    function renderTable(data) {
        const tableBody = document.getElementById("forecast-table");
        tableBody.innerHTML = "";
        data.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td class="px-4 py-2 border">${entry.date}</td><td class="px-4 py-2 border">${entry.temp}</td><td class="px-4 py-2 border">${entry.condition}</td>`;
            tableBody.appendChild(row);
        });
    }

    // Paginate data for the table
    function paginate(data, page) {
        const start = (page - 1) * entriesPerPage;
        return data.slice(start, start + entriesPerPage);
    }

    // Render pagination controls
    function renderPagination(data) {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";
        const totalPages = Math.ceil(data.length / entriesPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.classList.add(
                "px-4",
                "py-2",
                "rounded-md",
                "hover:bg-gray-600",
                "transition"
            );
            button.addEventListener("click", () => {
                currentPage = i;
                renderTable(paginate(data, currentPage));
            });
            pagination.appendChild(button);
        }
    }

    // Sorting and Filtering Functions
    function sortAsc() {
        const sortedData = [...forecastData].sort((a, b) => a.temp - b.temp);
        renderTable(paginate(sortedData, 1));
        renderPagination(sortedData);
    }

    function sortDesc() {
        const sortedData = [...forecastData].sort((a, b) => b.temp - a.temp);
        renderTable(paginate(sortedData, 1));
        renderPagination(sortedData);
    }

    function filterRainyDays() {
        const filteredData = forecastData.filter(
            (entry) => entry.condition === "Rain"
        );
        renderTable(paginate(filteredData, 1));
        renderPagination(filteredData);
    }

    function showHottestDay() {
        const maxTemp = Math.max(...forecastData.map((entry) => entry.temp));
        const hottestDay = forecastData.filter((entry) => entry.temp === maxTemp);
        renderTable(hottestDay);
    }

    // Event listeners for buttons
    document.getElementById("get-weather-btn").addEventListener("click", () => {
        const city = document.getElementById("city-input").value;
        if (city) fetchForecast(city);
    });

    document.getElementById("sortAsc").addEventListener("click", sortAsc);
    document.getElementById("sortDesc").addEventListener("click", sortDesc);
    document.getElementById("filterRain").addEventListener("click", filterRainyDays);
    document.getElementById("maxTemp").addEventListener("click", showHottestDay);

    // Chatbot Integration
    async function runChat(userInput) {
        const cityMatch = userInput.match(/what is the weather in (.+)/i);
        
        if (cityMatch) {
            const city = cityMatch[1].trim();
            const weatherResponse = await getCurrentWeather(city);
            displayMessage(weatherResponse, "bot");
        } else {
            const defaultResponse = "I can only answer weather-related queries.";
            displayMessage(defaultResponse, "bot");
        }
    }

    async function getCurrentWeather(city) {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
            );
            const data = await response.json();
            
            if (data.cod === 200) {
                return `The current weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
            } else {
                return "City not found! Please check the city name.";
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
            return "An error occurred while fetching the weather data.";
        }
    }

    function displayMessage(text, sender) {
        const chatBox = document.getElementById("chatResponse");
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("p-2", sender === "user" ? "text-right" : "text-left");
        messageDiv.innerHTML = `<div class="${sender === "user" ? "bg-blue-600 text-white p-2 rounded-lg" : "bg-gray-200 text-black p-2 rounded-lg"}">${text}</div>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    document.getElementById("send-chat").addEventListener("click", () => {
        const userInput = document.getElementById("chat-input").value;
        console.log("Send button clicked with input: ", userInput);
        if (userInput) {
            displayMessage(userInput, "user");
            runChat(userInput);
            document.getElementById("chat-input").value = "";
        }
    });
});
