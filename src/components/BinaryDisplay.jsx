import React from 'react';

/**
 * BinaryDisplay — Shows the binary representation of the current input.
 * Groups bits by 8 (bytes) and labels each byte with its ASCII character.
 */
const BinaryDisplay = ({ bits, inputMode, textInput }) => {
  if (!bits || bits.length === 0) return null;

  // Group bits into bytes
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    bytes.push(bits.slice(i, i + 8));
  }

  return (
    <div className="binary-display glass-card">
      <h2 className="binary-display__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <line x1="8" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="16" y2="21" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        Binary Representation
        <span className="binary-display__count">{bits.length} bits ({bytes.length} byte{bytes.length !== 1 ? 's' : ''})</span>
      </h2>

      <div className="binary-display__bytes">
        {bytes.map((byte, i) => {
          // Get the character label if in text mode
          let charLabel = '';
          if (inputMode === 'text' && textInput && i < textInput.length) {
            const ch = textInput[i];
            charLabel = ch === ' ' ? '␣' : ch;
          }
          return (
            <div key={i} className="byte-group">
              {inputMode === 'text' && charLabel && (
                <div className="byte-group__char">'{charLabel}'</div>
              )}
              <div className="byte-group__bits">
                {byte.map((bit, j) => (
                  <span key={j} className={`byte-group__bit ${bit === 1 ? 'byte-group__bit--one' : 'byte-group__bit--zero'}`}>
                    {bit}
                  </span>
                ))}
              </div>
              {inputMode === 'text' && charLabel && (
                <div className="byte-group__ascii">
                  ASCII {textInput.charCodeAt(i)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BinaryDisplay;
