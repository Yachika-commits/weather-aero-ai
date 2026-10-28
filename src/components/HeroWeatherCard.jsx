import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Bookmark,
  BookmarkCheck,
  ArrowUp,
  ArrowDown,
  Clock
} from 'lucide-react';

export default function HeroWeatherCard({
  weather,
  unit = 'C',
  isSaved = false,
  onToggleSave
}) {
  if (!weather) return null;

  // Temperature unit converter
  const formatTemp = (celsius) => {
    if (celsius == null) return '--';
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  // Icon Renderer
  const renderWeatherIcon = (iconName) => {
    const props = { size: 68, className: 'animate-float' };
    switch (iconName) {
      case 'Sun':
        return <Sun {...props} color="#fbbf24" />;
      case 'Moon':
        return <Moon {...props} color="#a5f3fc" />;
      case 'CloudSun':
        return <CloudSun {...props} color="#38bdf8" />;
      case 'CloudMoon':
        return <CloudMoon {...props} color="#818cf8" />;
      case 'Cloud':
        return <Cloud {...props} color="#94a3b8" />;
      case 'CloudRain':
        return <CloudRain {...props} color="#60a5fa" />;
      case 'CloudDrizzle':
        return <CloudDrizzle {...props} color="#93c5fd" />;
      case 'CloudSnow':
        return <CloudSnow {...props} color="#e0f2fe" />;
      case 'CloudLightning':
        return <CloudLightning {...props} color="#c084fc" />;
      case 'CloudFog':
        return <CloudFog {...props} color="#cbd5e1" />;
      default:
        return <CloudSun {...props} color="#38bdf8" />;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Accent Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--card-border-glow) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Left Side: Location & Temperature */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>
              {weather.location}
            </h2>
            <button
              onClick={onToggleSave}
              className="btn-glass"
              style={{ padding: '6px 12px', borderRadius: '999px' }}
              title={isSaved ? 'Remove from saved' : 'Save to favorites'}
            >
              {isSaved ? (
                <BookmarkCheck size={18} color="var(--accent-amber)" />
              ) : (
                <Bookmark size={18} color="var(--text-muted)" />
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '6px' }}>
            <Clock size={14} />
            <span>Updated at {weather.updatedAt}</span>
          </div>

          {/* Large Temperature Display */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginTop: '24px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '5rem',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.04em'
              }}
            >
              {formatTemp(weather.temp)}°
            </span>
            <div>
              <div className="glass-pill" style={{ textTransform: 'capitalize' }}>
                {weather.condition.text}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Feels like {formatTemp(weather.feelsLike)}°{unit}
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Animated Condition Icon & Range */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: '160px' }}>
          
          <div>{renderWeatherIcon(weather.condition.icon)}</div>

          {/* High / Low Range */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '20px' }}>
            <div className="glass-pill">
              <ArrowUp size={14} color="var(--accent-rose)" />
              <span>High: <strong>{formatTemp(weather.tempMax)}°</strong></span>
            </div>
            <div className="glass-pill">
              <ArrowDown size={14} color="var(--accent-blue)" />
              <span>Low: <strong>{formatTemp(weather.tempMin)}°</strong></span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Quick Weather Insight Banner */}
      <div
        style={{
          marginTop: '28px',
          padding: '12px 18px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>💡</span>
        <span>
          {weather.temp > 28
            ? 'Hot weather detected! Stay hydrated and protect yourself from peak UV radiation.'
            : weather.temp < 10
            ? 'Chilly conditions today! Remember to wear warm thermal layers.'
            : 'Pleasant weather in ' + weather.location + '. Excellent day to ask AeroAI for outdoor ideas!'}
        </span>
      </div>

    </div>
  );
}
