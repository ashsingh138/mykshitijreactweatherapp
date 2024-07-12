import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import CurrentLocation from './components/CurrentLocation';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import Overview from './components/OverviewHeader';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import './App.css';

const App = () => {
  const [currentWeatherData, setCurrentWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false); 

  const API_KEY = '5062429b52a548e498a91917240807';

  const fetchWeatherData = useCallback(async (location) => {
    try {
      const currentWeatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
        params: { key: API_KEY, q: location }
      });
      setCurrentWeatherData(currentWeatherResponse.data);

      const forecastResponse = await axios.get(`https://api.weatherapi.com/v1/forecast.json`, {
        params: { key: API_KEY, q: location, days: 7 }
      });
      setHourlyData(forecastResponse.data.forecast.forecastday[0].hour);
      setDailyData(forecastResponse.data.forecast.forecastday);

      const monthlyDataPromises = [];
      for (let i = 0; i < 12; i++) {
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - i);
        const pastDateString = pastDate.toISOString().split('T')[0];

        monthlyDataPromises.push(
          axios.get(`https://api.weatherapi.com/v1/history.json`, {
            params: { key: API_KEY, q: location, dt: pastDateString }
          })
        );
      }

      const monthlyResponses = await Promise.all(monthlyDataPromises);
      const monthlyForecast = monthlyResponses.map(response => response.data.forecast.forecastday[0]);
      setMonthlyData(monthlyForecast);

      setError('');
    } catch (error) {
      console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
      setError('Failed to fetch weather data. Please try again.');
    }
  }, [API_KEY]);

  const handleSearch = useCallback(async (location) => {
    if (!currentUser) {
      alert('Please sign in or sign up before searching for other locations.');
      return;
    }

    try {
      await fetchWeatherData(location);
    } catch (error) {
      console.error('Error fetching geolocation data:', error.response ? error.response.data : error.message);
      setError('Failed to fetch geolocation data. Please try again.');
    }
  }, [fetchWeatherData, currentUser]);

  const fetchCurrentLocationWeather = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const location = `${latitude},${longitude}`;
        await fetchWeatherData(location);
      }, (error) => {
        console.error('Error fetching current location:', error);
        fetchWeatherData('New York');
      });
    } else {
      fetchWeatherData('New York');
    }
  }, [fetchWeatherData]);

  useEffect(() => {
    fetchCurrentLocationWeather();
  }, [fetchCurrentLocationWeather]);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      setCurrentUser(savedUser);
      const savedUserLocations = JSON.parse(localStorage.getItem(`locations_${savedUser.username}`)) || [];
      setSavedLocations(savedUserLocations);
    }
  }, []);

  const handleSignIn = (user) => {
    setCurrentUser(user);
    const savedUserLocations = JSON.parse(localStorage.getItem(`locations_${user.username}`)) || [];
    setSavedLocations(savedUserLocations);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSavedLocations([]);
    localStorage.removeItem('currentUser');
    setIsProfileOpen(false);  
  };

  const handleSaveLocation = (location) => {
    if (!location) {
      setError('Please enter a valid location.');
      return;
    }
    const updatedLocations = [...savedLocations, { name: location }];
    setSavedLocations(updatedLocations);
    localStorage.setItem(`locations_${currentUser.username}`, JSON.stringify(updatedLocations));
    setError('');
  };

  const handleDelete = (index) => {
    const updatedLocations = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updatedLocations);
    localStorage.setItem(`locations_${currentUser.username}`, JSON.stringify(updatedLocations));
  };

  return (
    <Router>
      <div>
        <Header
          onSearch={handleSearch}
          currentUser={currentUser}
          onLogout={handleLogout}
          setIsProfileOpen={setIsProfileOpen}  
        />
        <Routes>
          <Route path="/" element={
            <>
              {error && <span style={{ color: 'red' }}>{error}</span>}
              <CurrentLocation weatherData={currentWeatherData} onSaveLocation={handleSaveLocation} />
              <HourlyForecast hourlyData={hourlyData} />
              <DailyForecast dailyData={dailyData} />
              <Overview monthlyData={monthlyData} />
              <div className="saved-locations">
                {savedLocations.map((loc, index) => (
                  <div key={index} className="saved-location">
                    <p>{loc.name}</p>
                    <button onClick={() => handleSearch(loc.name)}>Show Weather</button>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                  </div>
                ))}
              </div>
            </>
          } />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
        {isProfileOpen && <Profile currentUser={currentUser} onClose={() => setIsProfileOpen(false)} />}  
      </div>
    </Router>
  );
};

export default App;
