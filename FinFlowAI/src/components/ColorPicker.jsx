import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { PRESET_COLORS } from '../utils/theme';
import { Palette, Check } from 'lucide-react';

export default function ColorPicker({ compact = false }) {
  const { user, setUser } = useAppContext();
  const inputRef = useRef(null);

  const currentAccent = user.accentColor || '#c8f135';

  const handleSelect = (hex) => {
    setUser(prev => ({ ...prev, accentColor: hex }));
  };

  return (
    <div className={`flex flex-col gap-3 ${compact ? '' : ''}`}>
      {!compact && (
        <div>
          <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-0.5">Accent Color</p>
          <p className="text-[10px] text-muted/70">Pick a colour and FinFlow will generate a matching palette instantly.</p>
        </div>
      )}

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(({ name, hex }) => {
          const isActive = currentAccent.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={hex}
              title={name}
              onClick={() => handleSelect(hex)}
              className="relative w-8 h-8 rounded-xl transition-all hover:scale-110 active:scale-95 focus:outline-none"
              style={{ backgroundColor: hex, boxShadow: isActive ? `0 0 0 2px #fff, 0 0 0 4px ${hex}` : 'none' }}
            >
              {isActive && (
                <Check
                  className="w-4 h-4 absolute inset-0 m-auto drop-shadow"
                  style={{ color: '#0a0a0f' }}
                />
              )}
            </button>
          );
        })}

        {/* Custom colour button */}
        <button
          title="Custom colour"
          onClick={() => inputRef.current?.click()}
          className="w-8 h-8 rounded-xl flex items-center justify-center border-2 border-dashed transition-all hover:scale-110"
          style={{
            borderColor: 'var(--color-muted)',
            backgroundImage: `conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`,
          }}
        />
        <input
          ref={inputRef}
          type="color"
          className="invisible absolute w-0 h-0"
          value={currentAccent}
          onChange={e => handleSelect(e.target.value)}
        />
      </div>

      {/* Current colour preview */}
      {!compact && (
        <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: currentAccent }} />
          <div>
            <p className="text-xs font-bold text-text">{PRESET_COLORS.find(c => c.hex.toLowerCase() === currentAccent.toLowerCase())?.name || 'Custom Color'}</p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>{currentAccent.toUpperCase()}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)20', color: 'var(--color-accent)' }}>
            <Palette className="w-3 h-3" /> LIVE
          </div>
        </div>
      )}
    </div>
  );
}
