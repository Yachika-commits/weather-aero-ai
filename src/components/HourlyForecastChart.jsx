import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Droplets } from 'lucide-react';

export default function HourlyForecastChart({ hourlyData = [], unit = 'C' }) {
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'cards'

  if (!hourlyData || hourlyData.length === 0) return null;

  const formatTemp = (celsius) => {
    if (unit === 'F') return Math.round((celsius * 9) / 5 + 32);
    return celsius;
  };

  const chartData = hourlyData.map((item) => ({
    time: item.time,
    temp: formatTemp(item.temp),
    pop: item.pop,
    condition: item.condition.text
  }));

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Sun':
        return <Sun size={20} color="#fbbf24" />;
      case 'CloudSun':
        return <CloudSun size={20} color="#38bdf8" />;
      case 'Cloud':
        return <Cloud size={20} color="#94a3b8" />;
      case 'CloudRain':
        return <CloudRain size={20} color="#60a5fa" />;
      case 'CloudSnow':
        return <CloudSnow size={20} color="#e0f2fe" />;
      case 'CloudLightning':
        return <CloudLightning size={20} color="#c084fc" />;
      default:
        return <CloudSun size={20} color="#38bdf8" />;
    }
  };

  // Custom Tooltip for Chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="glass-panel"
          style={{
            padding: '10px 14px',
            fontSize: '0.85rem',
            background: 'rgba(15, 23, 42, 0.9)'
          }}
        >
          <div style={{ fontWeight: 600 }}>{data.time}</div>
          <div style={{ color: 'var(--accent-cyan)', marginTop: '4px' }}>
            Temp: <strong>{data.temp}°{unit}</strong>
          </div>
          <div style={{ color: 'var(--accent-blue)', marginTop: '2px' }}>
            Rain Chance: <strong>{data.pop}%</strong>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
            {data.condition}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      
      {/* Header & View Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            24-Hour Forecast
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Temperature & Rain Outlook</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '3px' }}>
          <button
            onClick={() => setViewMode('chart')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: viewMode === 'chart' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'chart' ? '#090d16' : 'var(--text-secondary)'
            }}
          >
            Graph
          </button>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: viewMode === 'cards' ? 'var(--accent-cyan)' : 'transparent',
              color: viewMode === 'cards' ? '#090d16' : 'var(--text-secondary)'
            }}
          >
            Hourly List
          </button>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' ? (
        <div style={{ width: '100%', height: 220, marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} unit={`°${unit}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="var(--accent-cyan)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Cards View (Horizontal Scroll) */
        <div
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            paddingBottom: '12px',
            paddingTop: '6px'
          }}
        >
          {hourlyData.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                minWidth: '95px',
                padding: '14px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</span>
              <div>{renderIcon(item.condition.icon)}</div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
                {formatTemp(item.temp)}°
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}>
                <Droplets size={12} />
                <span>{item.pop}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
