import React from 'react';

const InputPanel = ({ inputMode, setInputMode, binaryInput, setBinaryInput, textInput, setTextInput }) => {
  return (
    <div className="input-panel glass-card">
      <h2 className="input-panel__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        Signal Input
      </h2>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-toggle__btn ${inputMode === 'binary' ? 'mode-toggle__btn--active' : ''}`}
          onClick={() => setInputMode('binary')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="18" rx="2" /><line x1="8" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="16" y2="21" /><line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          Binary
        </button>
        <button
          className={`mode-toggle__btn ${inputMode === 'text' ? 'mode-toggle__btn--active' : ''}`}
          onClick={() => setInputMode('text')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
          </svg>
          Text
        </button>
      </div>

      {/* Input fields */}
      {inputMode === 'binary' ? (
        <div className="input-field-group">
          <label className="input-label">Enter bit stream (0s and 1s)</label>
          <input
            type="text"
            className="input-field"
            value={binaryInput}
            onChange={(e) => setBinaryInput(e.target.value)}
            placeholder="e.g. 10110001"
            spellCheck="false"
            autoComplete="off"
          />
          <div className="input-hint">
            Type only <code>0</code> and <code>1</code> characters. Other characters are ignored.
          </div>
        </div>
      ) : (
        <div className="input-field-group">
          <label className="input-label">Enter text (ASCII)</label>
          <input
            type="text"
            className="input-field"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder='e.g. Hello'
            spellCheck="false"
            autoComplete="off"
          />
          <div className="input-hint">
            Each character is converted to its 8-bit ASCII binary representation.
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPanel;
