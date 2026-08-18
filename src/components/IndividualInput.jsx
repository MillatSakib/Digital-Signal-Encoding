import React from 'react';

/**
 * IndividualInput — A compact inline input component rendered inside a
 * waveform card when the encoding is "unlinked" from the global input.
 *
 * Props:
 *   inputData    - { mode: 'binary'|'text', binary: string, text: string }
 *   onUpdate     - (field, value) => void — updates the per-encoding input
 *   color        - The encoding's accent color
 */
const IndividualInput = ({ inputData, onUpdate, color }) => {
  const { mode, binary, text } = inputData;

  return (
    <div className="individual-input" style={{ '--ii-accent': color }}>
      <div className="individual-input__row">
        <div className="individual-input__toggle">
          <button
            className={`individual-input__mode-btn ${mode === 'binary' ? 'individual-input__mode-btn--active' : ''}`}
            onClick={() => onUpdate('mode', 'binary')}
            style={mode === 'binary' ? { background: color + '33', color: color, borderColor: color + '55' } : {}}
          >
            01
          </button>
          <button
            className={`individual-input__mode-btn ${mode === 'text' ? 'individual-input__mode-btn--active' : ''}`}
            onClick={() => onUpdate('mode', 'text')}
            style={mode === 'text' ? { background: color + '33', color: color, borderColor: color + '55' } : {}}
          >
            Aa
          </button>
        </div>

        <input
          type="text"
          className="individual-input__field"
          value={mode === 'binary' ? binary : text}
          onChange={(e) => onUpdate(mode === 'binary' ? 'binary' : 'text', e.target.value)}
          placeholder={mode === 'binary' ? 'e.g. 10110001' : 'e.g. Hello'}
          spellCheck="false"
          autoComplete="off"
          style={{ borderColor: color + '44' }}
        />
      </div>

      <div className="individual-input__hint">
        {mode === 'binary'
          ? 'Independent binary input for this encoding'
          : 'Independent text input (converted to 8-bit ASCII)'
        }
      </div>
    </div>
  );
};

export default IndividualInput;
