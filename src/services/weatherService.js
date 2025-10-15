// Weather service using OpenWeatherMap API (free tier)
// Alternative: WeatherAPI.com also has a generous free tier

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo'; // Add to .env file
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

// Backup: Open-Meteo (no API key required, completely free)
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

/**
 * Get user's current location using browser Geolocation API
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        // Fallback to default location (Vadodara, Gujarat)
        console.warn('Location access denied, using default location:', error);
        resolve({
          latitude: 22.3072,
          longitude: 73.1812,
          isDefault: true
        });
      }
    );
  });
};

/**
 * Get location name from coordinates using reverse geocoding
 */
const getLocationName = async (latitude, longitude) => {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await fetch(url);
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || 'Current Location';
  } catch (error) {
    console.warn('Geocoding failed:', error);
    return 'Current Location';
  }
};

/**
 * Get weather data using Open-Meteo (free, no API key required)
 */
export const getWeatherDataFree = async (latitude, longitude) => {
  try {
    console.log('Fetching weather for:', latitude, longitude);
    const url = `${OPEN_METEO_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather data fetch failed');
    
    const data = await response.json();
    console.log('Weather API response:', data);
    
    // Get location name
    const locationName = await getLocationName(latitude, longitude);
    
    // Map WMO weather codes to readable conditions
    const weatherCondition = mapWeatherCode(data.current.weather_code);
    
    return {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition: weatherCondition.condition,
      description: weatherCondition.description,
      icon: weatherCondition.icon,
      weatherCode: data.current.weather_code,
      location: locationName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching weather from Open-Meteo:', error);
    throw error;
  }
};

/**
 * Get weather data from OpenWeatherMap (requires API key)
 */
export const getWeatherDataWithKey = async (latitude, longitude) => {
  try {
    const url = `${WEATHER_API_BASE}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather data fetch failed');
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching weather from OpenWeatherMap:', error);
    throw error;
  }
};

/**
 * Main function to get weather data (tries free API first)
 */
export const getCurrentWeather = async () => {
  try {
    console.log('Getting user location...');
    const location = await getUserLocation();
    console.log('Location obtained:', location);
    
    // Try free API first (Open-Meteo)
    const weather = await getWeatherDataFree(location.latitude, location.longitude);
    weather.isDefault = location.isDefault;
    console.log('Weather data obtained:', weather);
    return weather;
  } catch (error) {
    console.error('Error getting weather:', error);
    // Return fallback weather data
    return getFallbackWeather();
  }
};

/**
 * Map WMO Weather codes to readable conditions
 * Reference: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */
const mapWeatherCode = (code) => {
  const weatherMap = {
    0: { condition: 'Clear', description: 'Clear sky', icon: '☀️' },
    1: { condition: 'Clear', description: 'Mainly clear', icon: '🌤️' },
    2: { condition: 'Clouds', description: 'Partly cloudy', icon: '⛅' },
    3: { condition: 'Clouds', description: 'Overcast', icon: '☁️' },
    45: { condition: 'Fog', description: 'Foggy', icon: '🌫️' },
    48: { condition: 'Fog', description: 'Depositing rime fog', icon: '🌫️' },
    51: { condition: 'Drizzle', description: 'Light drizzle', icon: '🌦️' },
    53: { condition: 'Drizzle', description: 'Moderate drizzle', icon: '🌦️' },
    55: { condition: 'Drizzle', description: 'Dense drizzle', icon: '🌧️' },
    61: { condition: 'Rain', description: 'Slight rain', icon: '🌧️' },
    63: { condition: 'Rain', description: 'Moderate rain', icon: '🌧️' },
    65: { condition: 'Rain', description: 'Heavy rain', icon: '⛈️' },
    71: { condition: 'Snow', description: 'Slight snow', icon: '🌨️' },
    73: { condition: 'Snow', description: 'Moderate snow', icon: '🌨️' },
    75: { condition: 'Snow', description: 'Heavy snow', icon: '❄️' },
    77: { condition: 'Snow', description: 'Snow grains', icon: '🌨️' },
    80: { condition: 'Rain', description: 'Slight rain showers', icon: '🌦️' },
    81: { condition: 'Rain', description: 'Moderate rain showers', icon: '🌧️' },
    82: { condition: 'Rain', description: 'Violent rain showers', icon: '⛈️' },
    85: { condition: 'Snow', description: 'Slight snow showers', icon: '🌨️' },
    86: { condition: 'Snow', description: 'Heavy snow showers', icon: '❄️' },
    95: { condition: 'Thunderstorm', description: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm', description: 'Thunderstorm with hail', icon: '⛈️' },
    99: { condition: 'Thunderstorm', description: 'Thunderstorm with heavy hail', icon: '⛈️' }
  };

  return weatherMap[code] || { condition: 'Unknown', description: 'Weather data unavailable', icon: '🌡️' };
};

/**
 * Get weather-based theme colors and styling
 */
export const getWeatherTheme = (condition) => {
  const themes = {
    Clear: {
      gradient: 'from-yellow-300 via-orange-300 to-yellow-400',
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      text: 'text-orange-900',
      border: 'border-yellow-300',
      icon: '☀️',
      emoji: '☀️',
      animation: 'animate-pulse'
    },
    Clouds: {
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: '☁️',
      emoji: '☁️',
      animation: ''
    },
    Rain: {
      gradient: 'from-blue-400 via-blue-500 to-indigo-500',
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      text: 'text-blue-900',
      border: 'border-blue-300',
      icon: '🌧️',
      emoji: '🌧️',
      animation: 'animate-bounce'
    },
    Drizzle: {
      gradient: 'from-blue-300 via-blue-400 to-cyan-400',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: '🌦️',
      emoji: '🌦️',
      animation: ''
    },
    Thunderstorm: {
      gradient: 'from-purple-600 via-indigo-700 to-gray-700',
      bg: 'bg-gradient-to-br from-purple-100 to-gray-200',
      text: 'text-purple-900',
      border: 'border-purple-400',
      icon: '⛈️',
      emoji: '⚡',
      animation: 'animate-pulse'
    },
    Snow: {
      gradient: 'from-blue-100 via-white to-blue-200',
      bg: 'bg-gradient-to-br from-blue-50 to-white',
      text: 'text-blue-900',
      border: 'border-blue-200',
      icon: '❄️',
      emoji: '❄️',
      animation: 'animate-spin'
    },
    Fog: {
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
      text: 'text-gray-700',
      border: 'border-gray-300',
      icon: '🌫️',
      emoji: '🌫️',
      animation: ''
    },
    Default: {
      gradient: 'from-primary-300 via-primary-400 to-primary-500',
      bg: 'bg-gradient-to-br from-primary-50 to-secondary-50',
      text: 'text-primary-900',
      border: 'border-primary-300',
      icon: '🌡️',
      emoji: '🤗',
      animation: ''
    }
  };

  return themes[condition] || themes.Default;
};

/**
 * Get fallback weather when API fails
 */
const getFallbackWeather = () => {
  return {
    temperature: 28,
    feelsLike: 30,
    humidity: 65,
    windSpeed: 12,
    condition: 'Clear',
    description: 'Pleasant weather',
    icon: '☀️',
    location: 'Vadodara',
    timestamp: new Date().toISOString(),
    isFallback: true
  };
};

/**
 * Format weather greeting based on conditions
 */
export const getWeatherGreeting = (weather, userName = '') => {
  const hour = new Date().getHours();
  let timeGreeting = '';
  
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour < 21) {
    timeGreeting = 'Good evening';
  } else {
    timeGreeting = 'Good night';
  }

  const name = userName ? `, ${userName}` : '';
  
  // Weather-specific greetings
  const weatherGreetings = {
    Clear: `${timeGreeting}${name}! ☀️ It's a beautiful sunny day`,
    Rain: `${timeGreeting}${name}! 🌧️ Don't forget your umbrella`,
    Thunderstorm: `${timeGreeting}${name}! ⛈️ Stay safe during the storm`,
    Snow: `${timeGreeting}${name}! ❄️ Bundle up, it's snowing`,
    Clouds: `${timeGreeting}${name}! ☁️ It's a bit cloudy today`,
    Drizzle: `${timeGreeting}${name}! 🌦️ Light drizzle outside`,
    Fog: `${timeGreeting}${name}! 🌫️ Drive carefully in the fog`,
    Default: `${timeGreeting}${name}! Welcome to Gazra Mitra`
  };

  return weatherGreetings[weather.condition] || weatherGreetings.Default;
};
