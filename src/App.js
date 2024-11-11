import React, { useState } from 'react';
import './App.css';

const api = {
  key: 'c2e68516ec2554f5851a73eccfddef00',  // Your OpenWeather API key
  base: 'https://api.openweathermap.org/data/2.5/'
};

function App() {
  const [search, setSearch] = useState("");  // Search query state
  const [weather, setWeather] = useState(null);  // Current weather data state
  const [forecast, setForecast] = useState([]);  // 5-day forecast data state
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState("");  // Error state

  // Fetch current weather data and 5-day forecast
  const searchPressed = async () => {
    if (!search) {
      setError("Please enter a city name.");
      return;
    }

    setError("");  // Clear previous errors
    setLoading(true);  // Start loading

    try {
      // Fetch current weather
      const weatherRes = await fetch(`${api.base}weather?q=${search}&units=metric&APPID=${api.key}`);
      const weatherData = await weatherRes.json();

      // Fetch 5-day forecast
      const forecastRes = await fetch(`${api.base}forecast?q=${search}&units=metric&APPID=${api.key}`);
      const forecastData = await forecastRes.json();

      if (weatherData.cod === '404' || forecastData.cod === '404') {
        setError("City not found.");
        setWeather(null);
        setForecast([]);
      } else {
        setWeather(weatherData);
        setForecast(forecastData.list);  // Store the forecast data
      }
    } catch (error) {
      setError("Error fetching weather data.");
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  // Format the date as DD/MM/YYYY
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    const day = ("0" + date.getDate()).slice(-2);  // Add leading zero if day < 10
    const month = ("0" + (date.getMonth() + 1)).slice(-2);  // Add leading zero if month < 10
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Group the forecast data by day
  const getDailyForecast = () => {
    const dailyData = [];

    forecast.forEach((forecastData, index) => {
      // We only want to take the first forecast of each day (there are 8 forecasts per day)
      if (index % 8 === 0) {
        dailyData.push({
          date: formatDate(forecastData.dt),  // Use the custom date format
          temp: forecastData.main.temp,
          description: forecastData.weather[0].description,
          icon: forecastData.weather[0].icon
        });
      }
    });

    return dailyData;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather App</h1>

        <div className='serachInput'>
          <input
            type="text"
            placeholder="Enter the city here..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={searchPressed} disabled={loading} >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Display Error Messages */}
        {error && <p className="error">{error}</p>}

        {/* Display Current Weather Information */}
        {weather && !loading && (
          <div className="weather-info">
            <h2>{weather.name}</h2>
            <p style={{fontWeight:'bold',fontSize:'2rem'}}>Temperature: <span>{weather.main.temp}°C</span> </p>
            <p style={{fontWeight:'bold',fontSize:'2rem'}}>Condition: <span>{weather.weather[0].main}</span> </p>
            <p style={{fontWeight:'bold',fontSize:'2rem'}}>Description: <span>{weather.weather[0].description}</span> </p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
              alt={weather.weather[0].description}
            />
          </div>
        )}

        {/* Display 5-Day Forecast */}
        {forecast.length > 0 && !loading && (
          <div className="forecast">
            <h3>5-Day Forecast Next</h3>
            <div className="forecast-cards">
              {getDailyForecast().map((day, index) => (
                <div key={index} className="forecast-card">
                  <p>{day.date}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.description}
                  />
                  <p>{day.description}</p>
                  <p>{day.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display loading message */}
        {loading && <p>Loading...</p>}
      </header>
    </div>
  );
}

export default App;
