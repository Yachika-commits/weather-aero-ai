import React from 'react';
import {
  Droplets,
  Wind,
  Sun,
  Gauge,
  Activity,
  Sunrise,
  Sunset,
  Navigation
} from 'lucide-react';

export default function WeatherMetricsGrid({ weather }) {
  if (!weather) return null;

  const { humidity, windSpeed, windDirection, pressure, uvIndex, airQuality, sunrise, sunset } = weather;

  // UV Safety Status
  const getUVStatus = (uv) => {
    if (uv <= 2) return { text: 'Low', color: '#34d399' };
    if (uv <= 5) return { text: 'Moderate', color: '#fbbf24' };
    if (uv <= 7) return { text: 'High', color: '#f97316' };
    if (uv <= 10) return { text: 'Very High', color: '#f43f5e' };
    return { text: 'Extreme', color: '#c084fc' };
  };

  const uvInfo = getUVStatus(uvIndex);

  return (
    <div className="metrics-grid">
      
      {/* 1. Humidity */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>HUMIDITY</span>
          <Droplets size={18} color="var(--accent-cyan)" />
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginTop: '12px' }}>
          {humidity}%
        </div>
        {/* Progress bar */}
        <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '999px', marginTop: '12px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${humidity}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))',
              borderRadius: '999px'
            }}
          />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          {humidity > 70 ? 'High moisture in air' : humidity < 30 ? 'Dry air conditions' : 'Normal comfort levels'}
        </div>
      </div>

      {/* 2. Wind & Compass */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>WIND SPEED</span>
          <Wind size={18} color="var(--accent-blue)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '12px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700 }}>
            {windSpeed}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>km/h</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Navigation
            size={14}
            color="var(--accent-cyan)"
            style={{ transform: `rotate(${windDirection}deg)`, transition: 'transform 0.5s ease' }}
          />
          <span>Direction: {windDirection}°</span>
        </div>
      </div>

      {/* 3. UV Index */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>UV INDEX</span>
          <Sun size={18} color="var(--accent-amber)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '12px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700 }}>
            {uvIndex}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: uvInfo.color }}>
            {uvInfo.text}
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '999px', marginTop: '12px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min((uvIndex / 12) * 100, 100)}%`,
              height: '100%',
              background: uvInfo.color,
              borderRadius: '999px'
            }}
          />
        </div>
      </div>

      {/* 4. Air Quality (AQI) */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AIR QUALITY (AQI)</span>
          <Activity size={18} color={airQuality.color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '12px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700 }}>
            {airQuality.aqi}
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: airQuality.color }}>
            {airQuality.status}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          PM2.5: {airQuality.pm25} | PM10: {airQuality.pm10}
        </div>
      </div>

      {/* 5. Pressure */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>PRESSURE</span>
          <Gauge size={18} color="var(--accent-indigo)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '12px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700 }}>
            {pressure}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>hPa</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          {pressure > 1013 ? 'High pressure system' : 'Low pressure system'}
        </div>
      </div>

      {/* 6. Sunrise & Sunset */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>SUN TIMINGS</span>
          <Sunrise size={18} color="var(--accent-amber)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <Sunrise size={16} color="var(--accent-amber)" />
            <span>Sunrise: <strong>{sunrise}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <Sunset size={16} color="var(--accent-rose)" />
            <span>Sunset: <strong>{sunset}</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
}
