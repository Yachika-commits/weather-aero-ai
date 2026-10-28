import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroWeatherCard from './components/HeroWeatherCard';
import WeatherMetricsGrid from './components/WeatherMetricsGrid';
import HourlyForecastChart from './components/HourlyForecastChart';
import DailyForecastList from './components/DailyForecastList';
import WeatherCanvas from './components/WeatherCanvas';
import AeroAIChatbot from './components/AeroAIChatbot';
import SavedCitiesDrawer from './components/SavedCitiesDrawer';
import { fetchWeatherData } from './services/weatherApi';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Settings & Drawers State
  const [unit, setUnit] = useState(() => localStorage.getItem('aero_unit') || 'C');
  const [theme, setTheme] = useState(() => localStorage.getItem('aero_theme') || 'dark');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);

  // Saved Cities list
  const [savedCities, setSavedCities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aero_saved_cities')) || [
        { name: 'London, United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
        { name: 'New York, United States', lat: 40.7128, lon: -74.006 }
      ];
    } catch {
      return [];
    }
  });

  // Sync theme attribute to HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aero_theme', theme);
  }, [theme]);

  // Save cities persistence
  useEffect(() => {
    localStorage.setItem('aero_saved_cities', JSON.stringify(savedCities));
  }, [savedCities]);

  // Load Initial Weather Data (Default: London)
  useEffect(() => {
    loadWeather(51.5074, -0.1278, 'London, United Kingdom');
  }, []);

  const loadWeather = async (lat, lon, name) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(lat, lon, name);
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve weather forecast. Please check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Auto Geolocation
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await loadWeather(latitude, longitude, 'My Location');
        setLoadingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not access your location. Using default city.');
        setLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  // Toggle Save City
  const toggleSaveCity = () => {
    if (!weather) return;
    const exists = savedCities.some((c) => c.name === weather.location);
    if (exists) {
      setSavedCities((prev) => prev.filter((c) => c.name !== weather.location));
    } else {
      setSavedCities((prev) => [
        ...prev,
        { name: weather.location, lat: weather.lat, lon: weather.lon }
      ]);
    }
  };

  const removeSavedCity = (name) => {
    setSavedCities((prev) => prev.filter((c) => c.name !== name));
  };

  const isCurrentSaved = weather && savedCities.some((c) => c.name === weather.location);

  return (
    <div className={`app-container ${weather?.condition?.theme || ''}`}>
      
      {/* Dynamic Animated Particle Canvas Background */}
      <WeatherCanvas
        weatherType={weather?.condition?.type || 'clear'}
        isDay={weather?.isDay ?? 1}
      />

      {/* Navigation Header */}
      <Navbar
        onSelectLocation={loadWeather}
        onCurrentLocation={handleCurrentLocation}
        unit={unit}
        onToggleUnit={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        savedCount={savedCities.length}
        loadingLocation={loadingLocation}
      />

      {/* Main Dashboard Content */}
      {loading ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px',
            textAlign: 'center',
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Loader2 size={42} className="animate-spin-slow" color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem' }}>Fetching Atmospheric Data...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reading real-time satellite metrics and sensors</p>
        </div>
      ) : error ? (
        <div
          className="glass-panel"
          style={{
            padding: '40px',
            textAlign: 'center',
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <AlertCircle size={48} color="var(--accent-rose)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--accent-rose)' }}>
            Weather Data Unavailable
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <button
            onClick={() => loadWeather(51.5074, -0.1278, 'London, United Kingdom')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} />
            Retry Connection
          </button>
        </div>
      ) : (
        <main>
          {/* Hero Main Weather Card */}
          <HeroWeatherCard
            weather={weather}
            unit={unit}
            isSaved={isCurrentSaved}
            onToggleSave={toggleSaveCity}
          />

          {/* Metrics Grid (Humidity, Wind, UV, AQI, Pressure, Sun) */}
          <WeatherMetricsGrid weather={weather} />

          {/* Main Grid: 24h Hourly Graph + 7-Day Forecast */}
          <div className="main-dashboard-grid">
            <div>
              <HourlyForecastChart hourlyData={weather?.hourly} unit={unit} />
            </div>
            <div>
              <DailyForecastList dailyData={weather?.daily} unit={unit} />
            </div>
          </div>
        </main>
      )}

      {/* Slide-over Drawers */}
      <AeroAIChatbot
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        weatherContext={weather}
      />

      <SavedCitiesDrawer
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedCities={savedCities}
        onSelectCity={loadWeather}
        onRemoveCity={removeSavedCity}
      />

    </div>
  );
}
