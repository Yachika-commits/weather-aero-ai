import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, Bookmark, Sun, Moon, Thermometer, Loader2 } from 'lucide-react';
import { searchLocations } from '../services/weatherApi';

export default function Navbar({
  onSelectLocation,
  onCurrentLocation,
  unit,
  onToggleUnit,
  theme,
  onToggleTheme,
  onOpenAI,
  onOpenSaved,
  savedCount = 0,
  loadingLocation = false
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced Search API call
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(query);
      setSuggestions(results);
      setIsSearching(false);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc) => {
    onSelectLocation(loc.lat, loc.lon, `${loc.name}, ${loc.country || ''}`);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <header className="glass-panel" style={{ padding: '14px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="animate-glow"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)'
            }}
          >
            <Sparkles size={22} color="#0b0f19" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
              AeroWeather <span className="gradient-text">AI</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Smart Atmosphere & Forecast</p>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div ref={dropdownRef} style={{ position: 'relative', flex: 1, maxWidth: '420px', minWidth: '260px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '8px 16px',
              gap: '10px',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={18} color="var(--text-secondary)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city, region, or location..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                width: '100%'
              }}
            />
            {isSearching && <Loader2 size={18} className="animate-spin-slow" color="var(--accent-cyan)" />}
          </div>

          {/* Search Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                zIndex: 100,
                padding: '8px',
                maxHeight: '280px',
                overflowY: 'auto',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
              }}
            >
              {suggestions.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <MapPin size={16} color="var(--accent-cyan)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{loc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions & Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Geolocation Button */}
          <button
            onClick={onCurrentLocation}
            className="btn-glass"
            title="Use current location"
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <Loader2 size={18} className="animate-spin-slow" color="var(--accent-cyan)" />
            ) : (
              <MapPin size={18} color="var(--accent-cyan)" />
            )}
            <span style={{ display: 'none', '@media (minWidth: 640px)': { display: 'inline' } }}>Location</span>
          </button>

          {/* Saved Cities Button */}
          <button onClick={onOpenSaved} className="btn-glass" title="Saved Cities" style={{ position: 'relative' }}>
            <Bookmark size={18} color="var(--accent-amber)" />
            {savedCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {savedCount}
              </span>
            )}
          </button>

          {/* Unit Toggle */}
          <button onClick={onToggleUnit} className="btn-glass" title="Toggle °C / °F">
            <Thermometer size={18} color="var(--accent-indigo)" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>°{unit}</span>
          </button>

          {/* Theme Toggle */}
          <button onClick={onToggleTheme} className="btn-glass" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={18} color="var(--accent-amber)" /> : <Moon size={18} color="var(--accent-indigo)" />}
          </button>

          {/* AeroAI Chat Launcher */}
          <button
            onClick={onOpenAI}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            <span>Ask AeroAI</span>
          </button>

        </div>
      </div>
    </header>
  );
}
