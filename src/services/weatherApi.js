// Weather condition mapping helper
export const getWeatherCondition = (code, isDay = 1) => {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 71, 73, 75: Snow fall
  // 77: Snow grains
  // 80, 81, 82: Rain showers
  // 85, 86: Snow showers
  // 95: Thunderstorm
  // 96, 99: Thunderstorm with hail

  if (code === 0) {
    return {
      text: isDay ? 'Clear Sky' : 'Clear Night',
      icon: isDay ? 'Sun' : 'Moon',
      theme: isDay ? 'weather-theme-sunny' : 'weather-theme-night',
      type: 'clear'
    };
  } else if ([1, 2].includes(code)) {
    return {
      text: isDay ? 'Partly Cloudy' : 'Partly Cloudy',
      icon: isDay ? 'CloudSun' : 'CloudMoon',
      theme: 'weather-theme-sunny',
      type: 'cloudy'
    };
  } else if (code === 3) {
    return {
      text: 'Overcast',
      icon: 'Cloud',
      theme: 'weather-theme-rainy',
      type: 'cloudy'
    };
  } else if ([45, 48].includes(code)) {
    return {
      text: 'Foggy & Mist',
      icon: 'CloudFog',
      theme: 'weather-theme-rainy',
      type: 'fog'
    };
  } else if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      text: 'Light Drizzle',
      icon: 'CloudDrizzle',
      theme: 'weather-theme-rainy',
      type: 'rain'
    };
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      text: 'Rain Showers',
      icon: 'CloudRain',
      theme: 'weather-theme-rainy',
      type: 'rain'
    };
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      text: 'Snowfall',
      icon: 'CloudSnow',
      theme: 'weather-theme-snowy',
      type: 'snow'
    };
  } else if ([95, 96, 99].includes(code)) {
    return {
      text: 'Thunderstorm',
      icon: 'CloudLightning',
      theme: 'weather-theme-thunder',
      type: 'thunder'
    };
  }

  return {
    text: 'Partly Cloudy',
    icon: 'CloudSun',
    theme: 'weather-theme-sunny',
    type: 'cloudy'
  };
};

/**
 * Search locations using Open-Meteo Geocoding API
 */
export const searchLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query.trim()
      )}&count=8&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding search failed');
    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((loc) => ({
      id: loc.id,
      name: loc.name,
      country: loc.country || '',
      admin1: loc.admin1 || '',
      lat: loc.latitude,
      lon: loc.longitude,
      timezone: loc.timezone || 'auto'
    }));
  } catch (err) {
    console.error('Location search error:', err);
    return [];
  }
};

/**
 * Fetch Weather Data (Current, Hourly 24h, Daily 7d)
 */
export const fetchWeatherData = async (lat, lon, locationName = 'Selected City') => {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,cloud_cover,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi`;

    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl).catch(() => null)
    ]);

    if (!weatherRes.ok) throw new Error('Weather API request failed');

    const data = await weatherRes.json();
    let airData = null;
    if (airRes && airRes.ok) {
      airData = await airRes.json();
    }

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const condition = getWeatherCondition(current.weather_code, current.is_day);

    // Format Hourly Forecast (Next 24 Hours)
    const now = new Date();
    const currentHourIndex = hourly.time.findIndex(t => new Date(t) >= now) || 0;
    const next24Hours = [];

    for (let i = currentHourIndex; i < Math.min(currentHourIndex + 24, hourly.time.length); i++) {
      const timeStr = hourly.time[i];
      const hourDate = new Date(timeStr);
      const hourFormatted = hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      next24Hours.push({
        time: hourFormatted,
        temp: Math.round(hourly.temperature_2m[i]),
        feelsLike: Math.round(hourly.apparent_temperature[i]),
        humidity: hourly.relative_humidity_2m[i],
        pop: hourly.precipitation_probability[i] || 0,
        rain: hourly.precipitation[i] || 0,
        uv: hourly.uv_index[i] || 0,
        condition: getWeatherCondition(hourly.weather_code[i], 1)
      });
    }

    // Format 7-Day Daily Forecast
    const daily7Days = [];
    if (daily && daily.time) {
      for (let i = 0; i < daily.time.length; i++) {
        const dateObj = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const fullDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        daily7Days.push({
          day: dayName,
          date: fullDate,
          maxTemp: Math.round(daily.temperature_2m_max[i]),
          minTemp: Math.round(daily.temperature_2m_min[i]),
          pop: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
          uvMax: daily.uv_index_max ? daily.uv_index_max[i] : 0,
          sunrise: daily.sunrise[i] ? new Date(daily.sunrise[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00 AM',
          sunset: daily.sunset[i] ? new Date(daily.sunset[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:30 PM',
          condition: getWeatherCondition(daily.weather_code[i], 1)
        });
      }
    }

    // Air Quality Data
    const usAqi = airData?.current?.us_aqi || 42;
    const pm25 = airData?.current?.pm2_5 || 12.4;
    const pm10 = airData?.current?.pm10 || 22.1;
    const o3 = airData?.current?.ozone || 35;
    const no2 = airData?.current?.nitrogen_dioxide || 15;

    let aqiText = 'Good';
    let aqiColor = '#34d399';
    if (usAqi > 50 && usAqi <= 100) {
      aqiText = 'Moderate';
      aqiColor = '#fbbf24';
    } else if (usAqi > 100 && usAqi <= 150) {
      aqiText = 'Unhealthy for Sensitive Groups';
      aqiColor = '#f97316';
    } else if (usAqi > 150) {
      aqiText = 'Unhealthy';
      aqiColor = '#f43f5e';
    }

    return {
      location: locationName,
      lat,
      lon,
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      tempMax: daily7Days[0]?.maxTemp || Math.round(current.temperature_2m + 3),
      tempMin: daily7Days[0]?.minTemp || Math.round(current.temperature_2m - 4),
      humidity: current.relative_humidity_2m,
      pressure: current.pressure_msl || 1013,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m || 0,
      cloudCover: current.cloud_cover || 0,
      isDay: current.is_day,
      condition,
      hourly: next24Hours,
      daily: daily7Days,
      airQuality: {
        aqi: usAqi,
        status: aqiText,
        color: aqiColor,
        pm25,
        pm10,
        o3,
        no2
      },
      uvIndex: daily7Days[0]?.uvMax || 5,
      sunrise: daily7Days[0]?.sunrise || '06:15 AM',
      sunset: daily7Days[0]?.sunset || '06:45 PM',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    console.error('Failed to fetch weather data:', err);
    throw err;
  }
};
