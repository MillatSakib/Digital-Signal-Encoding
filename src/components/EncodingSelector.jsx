import React from 'react';
import { ENCODING_INFO } from '../utils/encodings';

const ENCODING_KEYS = ['NRZ-L', 'NRZ-I', 'Manchester', 'Diff-Manchester', 'AMI', 'Pseudoternary'];

const EncodingSelector = ({ selectedEncodings, toggleEncoding }) => {
  return (
    <div className="encoding-selector glass-card">
      <h2 className="encoding-selector__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        Encoding Schemes
      </h2>
      <div className="encoding-selector__grid">
        {ENCODING_KEYS.map(key => {
          const info = ENCODING_INFO[key];
          const isActive = selectedEncodings.includes(key);
          return (
            <button
              key={key}
              className={`encoding-chip ${isActive ? 'encoding-chip--active' : ''}`}
              style={{
                '--chip-color': info.color,
                borderColor: isActive ? info.color : 'transparent',
              }}
              onClick={() => toggleEncoding(key)}
            >
              <span
                className="encoding-chip__dot"
                style={{ backgroundColor: isActive ? info.color : 'rgba(255,255,255,0.2)' }}
              />
              <span className="encoding-chip__label">{info.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EncodingSelector;
