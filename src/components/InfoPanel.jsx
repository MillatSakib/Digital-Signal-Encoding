import React, { useState } from 'react';
import { ENCODING_INFO } from '../utils/encodings';

const ENCODING_KEYS = ['NRZ-L', 'NRZ-I', 'Manchester', 'Diff-Manchester', 'AMI', 'Pseudoternary'];

const InfoPanel = () => {
  const [expandedKey, setExpandedKey] = useState(null);

  const toggle = (key) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  return (
    <div className="info-panel glass-card">
      <h2 className="info-panel__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Learn About Encodings
      </h2>

      <div className="info-panel__list">
        {ENCODING_KEYS.map(key => {
          const info = ENCODING_INFO[key];
          const isExpanded = expandedKey === key;
          return (
            <div
              key={key}
              className={`info-card ${isExpanded ? 'info-card--expanded' : ''}`}
              style={{ '--card-accent': info.color }}
            >
              <button className="info-card__header" onClick={() => toggle(key)}>
                <span className="info-card__color-bar" style={{ backgroundColor: info.color }} />
                <div className="info-card__name-group">
                  <span className="info-card__name">{info.name}</span>
                  <span className="info-card__fullname">{info.fullName}</span>
                </div>
                <svg
                  className={`info-card__chevron ${isExpanded ? 'info-card__chevron--open' : ''}`}
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isExpanded && (
                <div className="info-card__body">
                  <p className="info-card__desc">{info.description}</p>

                  <div className="info-card__proscons">
                    <div className="info-card__section">
                      <h4 className="info-card__section-title info-card__section-title--pro">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Advantages
                      </h4>
                      <ul>
                        {info.pros.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div className="info-card__section">
                      <h4 className="info-card__section-title info-card__section-title--con">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Disadvantages
                      </h4>
                      <ul>
                        {info.cons.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="info-card__usage">
                    <strong>Usage:</strong> {info.usage}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfoPanel;
