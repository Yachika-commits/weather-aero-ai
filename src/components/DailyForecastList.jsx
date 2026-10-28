import React from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Droplets } from 'lucide-react';

export default function DailyForecastList({ dailyData = [], unit = 'C' }) {
  if (!dailyData || dailyData.length === 0) return null;

  const formatTemp = (celsius) => {
    if (unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Sun':
        return <Sun size={22} color="#fbbf24" />;
      case 'CloudSun':
        return <CloudSun size={22} color="#38bdf8" />;
      case 'Cloud':
        return <Cloud size={22} color="#94a3b8" />;
      case 'CloudRain':
        return <CloudRain size={22} color="#60a5fa" />;
      case 'CloudSnow':
        return <CloudSnow size={22} color="#e0f2fe" />;
      case 'CloudLightning':
        return <CloudLightning size={22} color="#c084fc" />;
      default:
        return <CloudSun size={22} color="#38bdf8" />;
    }
  };

  // Find min/max for scale bar calculation
  const allMins = dailyData.map((d) => d.minTemp);
  const allMaxs = dailyData.map((d) => d.maxTemp);
  const minScale = Math.min(...allMins);
  const maxScale = Math.max(...allMaxs);
  const range = maxScale - minScale || 1;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
        7-Day Forecast
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {dailyData.map((item, index) => {
          const leftPercent = ((item.minTemp - minScale) / range) * 100;
          const widthPercent = Math.max(((item.maxTemp - item.minTemp) / range) * 100, 15);

          return (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 40px 1fr 110px',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '16px',
                background: index === 0 ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                border: index === 0 ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(255,255,255,0.06)'
              }}
            >
              {/* Day & Date */}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.day}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</div>
              </div>

              {/* Icon */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {renderIcon(item.condition.icon)}
              </div>

              {/* Temp Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '30px', textAlign: 'right' }}>
                  {formatTemp(item.minTemp)}°
                </span>
                
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '999px', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-amber))',
                      borderRadius: '999px'
                    }}
                  />
                </div>

                <span style={{ fontSize: '0.85rem', fontWeight: 700, width: '30px' }}>
                  {formatTemp(item.maxTemp)}°
                </span>
              </div>

              {/* Rain Probability */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.8rem', color: 'var(--accent-blue)' }}>
                <Droplets size={14} />
                <span>{item.pop}% rain</span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
