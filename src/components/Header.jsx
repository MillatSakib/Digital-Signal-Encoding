import React from 'react';

const Header = () => {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__logo">
          <div className="app-header__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#headerGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <h1 className="app-header__title">Digital Signal Encoding Simulator</h1>
            <p className="app-header__subtitle">Interactive Line Coding Visualization — Data Communication Lab (CSE312)</p>
          </div>
        </div>
        <div className="app-header__badge">
          <span className="badge badge--glow">6 Encoding Schemes</span>
          <span className="badge">Real-Time</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
