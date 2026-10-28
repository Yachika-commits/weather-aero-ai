import React from 'react';
import { X, MapPin, Trash2, ArrowRight } from 'lucide-react';

export default function SavedCitiesDrawer({
  isOpen,
  onClose,
  savedCities = [],
  onSelectCity,
  onRemoveCity
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100%',
          borderRadius: 0,
          borderLeft: '1px solid var(--card-border-glow)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(13, 19, 34, 0.95)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Saved Favorite Cities
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {savedCities.length} locations bookmarked
            </p>
          </div>
          <button onClick={onClose} className="btn-glass" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Cities List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {savedCities.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px', fontSize: '0.9rem' }}>
              No saved cities yet. Click the bookmark icon on any city card to pin it here for fast access!
            </div>
          ) : (
            savedCities.map((city, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.06)'
                }}
              >
                <div
                  onClick={() => {
                    onSelectCity(city.lat, city.lon, city.name);
                    onClose();
                  }}
                  style={{ cursor: 'pointer', flex: 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1rem' }}>
                    <MapPin size={16} color="var(--accent-cyan)" />
                    <span>{city.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Click to switch forecast
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onSelectCity(city.lat, city.lon, city.name);
                      onClose();
                    }}
                    className="btn-glass"
                    style={{ padding: '6px 10px' }}
                    title="Load Weather"
                  >
                    <ArrowRight size={16} color="var(--accent-cyan)" />
                  </button>

                  <button
                    onClick={() => onRemoveCity(city.name)}
                    className="btn-glass"
                    style={{ padding: '6px 10px' }}
                    title="Remove"
                  >
                    <Trash2 size={16} color="var(--accent-rose)" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
