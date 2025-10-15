import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  ArrowPathIcon,
  SunIcon,
  CloudIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import { 
  getCurrentWeather, 
  getWeatherTheme, 
  getWeatherGreeting 
} from '../../services/weatherService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('WeatherCard: Fetching weather data...');
      const data = await getCurrentWeather();
      console.log('WeatherCard: Weather data received:', data);
      setWeather(data);
    } catch (err) {
      console.error('WeatherCard: Weather fetch error:', err);
      setError('Unable to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('WeatherCard: Component mounted, fetching weather...');
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-4 shadow-royal animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-6 bg-primary-200 rounded w-32"></div>
            <div className="h-8 bg-primary-200 rounded w-24"></div>
          </div>
          <div className="h-16 w-16 bg-primary-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 mb-4 shadow-royal border border-primary-200">
        <div className="text-center">
          <span className="text-4xl mb-2 block">🤗</span>
          <h2 className="text-xl font-bold text-primary-900 mb-1">
            {t('welcome')}
          </h2>
          <p className="text-sm text-primary-700">
            {getWeatherGreeting({ condition: 'Default' }, currentUser?.displayName)}
          </p>
        </div>
      </div>
    );
  }

  const theme = getWeatherTheme(weather.condition);
  const userName = currentUser?.displayName?.split(' ')[0] || '';

  return (
    <div 
      className={`${theme.bg} rounded-xl p-4 mb-3 shadow-md border ${theme.border} overflow-hidden relative`}
      style={{
        transition: 'all 0.5s ease-in-out'
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-10 text-6xl pointer-events-none">
        {weather.icon}
      </div>

      {/* Compact weather display */}
      <div className="flex items-center justify-between relative z-10">
        {/* Left: Temperature */}
        <div className="flex items-center gap-3">
          <div className={`text-5xl ${theme.animation}`}>
            {weather.icon}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${theme.text}`}>
                {weather.temperature}°
              </span>
              <span className={`text-lg ${theme.text} opacity-70`}>C</span>
            </div>
            <p className={`text-xs ${theme.text} opacity-70 capitalize`}>
              {weather.description}
            </p>
          </div>
        </div>

        {/* Right: Location and details */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 mb-1">
            <MapPinIcon className={`h-3 w-3 ${theme.text}`} />
            <span className={`text-xs font-medium ${theme.text}`}>
              {weather.location}
            </span>
            {weather.isDefault && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/50 ${theme.text}`}>
                Default
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 text-xs">
            <span className={theme.text}>💧 {weather.humidity}%</span>
            <span className={theme.text}>💨 {weather.windSpeed}km/h</span>
            <button
              onClick={fetchWeather}
              className={`p-1 rounded-full hover:bg-white/30 transition-colors ${theme.text}`}
              aria-label={t('refresh')}
              title={t('refresh')}
            >
              <ArrowPathIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Weather alerts - compact */}
      {weather.condition === 'Thunderstorm' && (
        <div className="mt-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg p-1.5 border border-yellow-500/30 relative z-10">
          <p className="text-xs text-yellow-900 font-medium flex items-center gap-1">
            <BoltIcon className="h-3 w-3" />
            Thunderstorm Alert
          </p>
        </div>
      )}

      {weather.condition === 'Rain' && (
        <div className="mt-2 bg-blue-500/20 backdrop-blur-sm rounded-lg p-1.5 border border-blue-500/30 relative z-10">
          <p className="text-xs text-blue-900 font-medium flex items-center gap-1">
            <CloudIcon className="h-3 w-3" />
            Carry an umbrella
          </p>
        </div>
      )}

      {weather.temperature > 35 && (
        <div className="mt-2 bg-red-500/20 backdrop-blur-sm rounded-lg p-1.5 border border-red-500/30 relative z-10">
          <p className="text-xs text-red-900 font-medium flex items-center gap-1">
            <SunIcon className="h-3 w-3" />
            Stay hydrated
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
