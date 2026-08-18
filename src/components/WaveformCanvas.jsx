import React, { useRef, useEffect, useState } from 'react';
import StepByStepPanel from './StepByStepPanel';
import IndividualInput from './IndividualInput';

/**
 * WaveformCanvas — Renders a single encoding waveform on an HTML5 Canvas.
 *
 * Props:
 *   bits            - Array of 0/1 integers (effective bits for this encoding)
 *   encoded         - Array of encoded segments (from encoding functions)
 *   encoding        - Encoding metadata object (name, color, fullName)
 *   encodingKey     - The encoding key string (e.g. 'NRZ-L')
 *   isMidBit        - Boolean, true for Manchester / Differential Manchester
 *   isLinked        - Boolean, true if using global input
 *   individualInput - { mode, binary, text } or null
 *   onToggleLink    - () => void — toggle between linked/unlinked
 *   onUpdateInput   - (field, value) => void — update individual input
 */
const WaveformCanvas = ({
  bits,
  encoded,
  encoding,
  encodingKey,
  isMidBit = false,
  isLinked = true,
  individualInput = null,
  onToggleLink,
  onUpdateInput,
}) => {
  const canvasRef = useRef(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !encoded || encoded.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Sizing
    const padding = { top: 52, bottom: 28, left: 70, right: 30 };
    const bitWidth = 72;
    const totalBits = encoded.length;
    const canvasLogicalWidth = Math.max(
      padding.left + totalBits * bitWidth + padding.right,
      canvas.parentElement.clientWidth
    );
    const canvasLogicalHeight = 200;

    canvas.width = canvasLogicalWidth * dpr;
    canvas.height = canvasLogicalHeight * dpr;
    canvas.style.width = canvasLogicalWidth + 'px';
    canvas.style.height = canvasLogicalHeight + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, canvasLogicalWidth, canvasLogicalHeight);

    // Drawing area
    const drawLeft = padding.left;
    const drawWidth = totalBits * bitWidth;
    const drawTop = padding.top;
    const drawBottom = canvasLogicalHeight - padding.bottom;
    const drawHeight = drawBottom - drawTop;

    // Voltage-to-Y mapping
    // For AMI/Pseudoternary/3-level: +1 = top, 0 = middle, -1 = bottom
    // For 2-level: +1 = top, -1 = bottom
    const isThreeLevel = encoding.name === 'AMI' || encoding.name === 'Pseudoternary';
    const levelToY = (level) => {
      if (isThreeLevel) {
        // +1 → drawTop, 0 → mid, -1 → drawBottom
        return drawTop + ((1 - level) / 2) * drawHeight;
      }
      // +1 → drawTop, -1 → drawBottom
      return drawTop + ((1 - level) / 2) * drawHeight;
    };

    // --- Draw grid lines (subtle) ---
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const levels = isThreeLevel ? [1, 0, -1] : [1, -1];
    levels.forEach(l => {
      const y = levelToY(l);
      ctx.beginPath();
      ctx.moveTo(drawLeft, y);
      ctx.lineTo(drawLeft + drawWidth, y);
      ctx.stroke();
    });

    // Zero line for 3-level
    if (!isThreeLevel) {
      const midY = levelToY(0);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(drawLeft, midY);
      ctx.lineTo(drawLeft + drawWidth, midY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // --- Voltage labels ---
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    if (isThreeLevel) {
      ctx.fillText('+V', drawLeft - 8, levelToY(1));
      ctx.fillText('0', drawLeft - 8, levelToY(0));
      ctx.fillText('−V', drawLeft - 8, levelToY(-1));
    } else {
      ctx.fillText('+V', drawLeft - 8, levelToY(1));
      ctx.fillText('−V', drawLeft - 8, levelToY(-1));
    }

    // --- Byte boundaries (every 8 bits) ---
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= totalBits; i += 8) {
      if (i === 0) continue;
      const x = drawLeft + i * bitWidth;
      ctx.beginPath();
      ctx.moveTo(x, drawTop - 10);
      ctx.lineTo(x, drawBottom + 10);
      ctx.stroke();

      // Byte label
      const byteIndex = i / 8;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Byte ${byteIndex}`, x - (4 * bitWidth), drawBottom + 22);
    }
    // Handle last partial byte label
    if (totalBits % 8 !== 0) {
      const lastByteStart = Math.floor(totalBits / 8) * 8;
      const byteMid = drawLeft + (lastByteStart + totalBits) / 2 * bitWidth;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Partial`, byteMid, drawBottom + 22);
    }
    ctx.setLineDash([]);

    // --- Bit labels above ---
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 13px "JetBrains Mono", "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    bits.forEach((bit, i) => {
      const x = drawLeft + i * bitWidth + bitWidth / 2;
      ctx.fillText(bit.toString(), x, drawTop - 8);
    });

    // --- Bit-slot separators (thin vertical lines at bit boundaries) ---
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < totalBits; i++) {
      // Skip if this is also a byte boundary
      if (i % 8 === 0) continue;
      const x = drawLeft + i * bitWidth;
      ctx.beginPath();
      ctx.moveTo(x, drawTop);
      ctx.lineTo(x, drawBottom);
      ctx.stroke();
    }

    // --- Draw the waveform ---
    ctx.strokeStyle = encoding.color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    ctx.shadowColor = encoding.color;
    ctx.shadowBlur = 6;

    ctx.beginPath();
    let prevY = null;

    encoded.forEach((seg, i) => {
      const xStart = drawLeft + i * bitWidth;
      const xEnd = xStart + bitWidth;
      const xMid = xStart + bitWidth / 2;

      if (isMidBit) {
        // Manchester / Differential Manchester: two half-segments
        const y1 = levelToY(seg.firstHalf);
        const y2 = levelToY(seg.secondHalf);

        // Vertical transition from previous segment to this one
        if (prevY !== null && prevY !== y1) {
          ctx.lineTo(xStart, y1);
        }
        if (prevY === null) {
          ctx.moveTo(xStart, y1);
        }

        // First half
        ctx.lineTo(xMid, y1);
        // Mid-bit transition
        ctx.lineTo(xMid, y2);
        // Second half
        ctx.lineTo(xEnd, y2);

        prevY = y2;
      } else {
        // NRZ-L, NRZ-I, AMI, Pseudoternary: single level per bit
        const y = levelToY(seg.level);

        if (prevY === null) {
          ctx.moveTo(xStart, y);
        } else if (prevY !== y) {
          // Vertical transition at boundary
          ctx.lineTo(xStart, y);
        }
        ctx.lineTo(xEnd, y);

        prevY = y;
      }
    });

    ctx.stroke();
    ctx.shadowBlur = 0;

    // --- Encoding name label ---
    ctx.fillStyle = encoding.color;
    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(encoding.name, 12, 12);

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(encoding.fullName, 12, 30);

  }, [bits, encoded, encoding, isMidBit]);

  return (
    <div className="waveform-container">
      {/* Toolbar above canvas */}
      <div className="waveform-toolbar">
        <div className="waveform-toolbar__left">
          <button
            className={`waveform-toolbar__btn ${showSteps ? 'waveform-toolbar__btn--active' : ''}`}
            onClick={() => setShowSteps(prev => !prev)}
            title="Show step-by-step encoding process"
            style={showSteps ? { color: encoding.color, borderColor: encoding.color + '55' } : {}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            {showSteps ? 'Hide Steps' : 'Show Steps'}
          </button>
        </div>

        <div className="waveform-toolbar__right">
          {onToggleLink && (
            <button
              className={`waveform-toolbar__btn waveform-toolbar__link-btn ${!isLinked ? 'waveform-toolbar__link-btn--unlinked' : ''}`}
              onClick={onToggleLink}
              title={isLinked ? 'Use independent input for this encoding' : 'Use global shared input'}
              style={!isLinked ? { color: encoding.color, borderColor: encoding.color + '55' } : {}}
            >
              {isLinked ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
                  <path d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
              {isLinked ? 'Linked' : 'Independent'}
            </button>
          )}
        </div>
      </div>

      {/* Individual input (when unlinked) */}
      {!isLinked && individualInput && onUpdateInput && (
        <IndividualInput
          inputData={individualInput}
          onUpdate={onUpdateInput}
          color={encoding.color}
        />
      )}

      {/* Canvas */}
      <div className="waveform-scroll">
        <canvas ref={canvasRef} />
      </div>

      {/* Step-by-step panel */}
      {showSteps && bits.length > 0 && (
        <StepByStepPanel
          encodingKey={encodingKey}
          bits={bits}
          color={encoding.color}
        />
      )}
    </div>
  );
};

export default WaveformCanvas;
