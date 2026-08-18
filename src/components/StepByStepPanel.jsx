import React, { useMemo } from 'react';
import { generateStepExplanations } from '../utils/encodings';

/**
 * StepByStepPanel — Renders a per-bit step-by-step explanation
 * of how the selected encoding scheme processes the input bits.
 *
 * Props:
 *   encodingKey - String key (e.g. 'NRZ-L', 'AMI', etc.)
 *   bits        - Array of 0/1 integers
 *   color       - The encoding's accent color
 */
const StepByStepPanel = ({ encodingKey, bits, color }) => {
  const steps = useMemo(
    () => generateStepExplanations(encodingKey, bits),
    [encodingKey, bits]
  );

  if (!steps || steps.length === 0) return null;

  return (
    <div className="step-panel" style={{ '--step-accent': color }}>
      <div className="step-panel__header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="step-panel__label">Step-by-Step Encoding Process</span>
        <span className="step-panel__count">{steps.length} steps</span>
      </div>

      <div className="step-panel__steps">
        {steps.map((step, i) => (
          <div
            key={i}
            className="step-row"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="step-row__number" style={{ backgroundColor: color + '22', color: color }}>
              {step.step}
            </div>
            <div className="step-row__content">
              <div className="step-row__bit">
                Input Bit: <span className={`step-row__bit-value step-row__bit-value--${step.bit}`}>{step.bit}</span>
              </div>
              <div className="step-row__rule">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {step.rule}
              </div>
              <div className="step-row__result">
                {step.result}
              </div>
              {step.stateChange && (
                <div className="step-row__state">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  {step.stateChange}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepByStepPanel;
