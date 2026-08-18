import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import EncodingSelector from './components/EncodingSelector';
import BinaryDisplay from './components/BinaryDisplay';
import WaveformCanvas from './components/WaveformCanvas';
import InfoPanel from './components/InfoPanel';
import {
  encodeNRZL,
  encodeNRZI,
  encodeManchester,
  encodeDifferentialManchester,
  encodeAMI,
  encodePseudoTernary,
  textToBits,
  parseBinaryString,
  ENCODING_INFO,
} from './utils/encodings';

const ENCODING_KEYS = ['NRZ-L', 'NRZ-I', 'Manchester', 'Diff-Manchester', 'AMI', 'Pseudoternary'];

const ENCODER_MAP = {
  'NRZ-L': encodeNRZL,
  'NRZ-I': encodeNRZI,
  'Manchester': encodeManchester,
  'Diff-Manchester': encodeDifferentialManchester,
  'AMI': encodeAMI,
  'Pseudoternary': encodePseudoTernary,
};

const MID_BIT_ENCODINGS = new Set(['Manchester', 'Diff-Manchester']);
const THREE_LEVEL_ENCODINGS = new Set(['AMI', 'Pseudoternary']);

function App() {
  const [inputMode, setInputMode] = useState('binary');
  const [binaryInput, setBinaryInput] = useState('10110001');
  const [textInput, setTextInput] = useState('');
  const [selectedEncodings, setSelectedEncodings] = useState([...ENCODING_KEYS]);

  // Per-encoding individual inputs: { [key]: { mode, binary, text } | null }
  // null or absent = use global input (linked)
  const [perEncodingInputs, setPerEncodingInputs] = useState({});

  // Derive global bits from current input
  const globalBits = useMemo(() => {
    if (inputMode === 'binary') {
      return parseBinaryString(binaryInput);
    } else {
      return textToBits(textInput);
    }
  }, [inputMode, binaryInput, textInput]);

  // Get bits for a specific encoding (global or individual)
  const getBitsForEncoding = useCallback((key) => {
    const indiv = perEncodingInputs[key];
    if (!indiv) return globalBits;
    if (indiv.mode === 'binary') {
      return parseBinaryString(indiv.binary);
    } else {
      return textToBits(indiv.text);
    }
  }, [perEncodingInputs, globalBits]);

  // Compute encoded data for each selected scheme
  const encodedData = useMemo(() => {
    const result = {};
    selectedEncodings.forEach(key => {
      const encoderFn = ENCODER_MAP[key];
      const bits = getBitsForEncoding(key);
      if (encoderFn && bits.length > 0) {
        result[key] = { encoded: encoderFn(bits), bits };
      }
    });
    return result;
  }, [selectedEncodings, getBitsForEncoding]);

  const toggleEncoding = (key) => {
    setSelectedEncodings(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      // Maintain consistent order
      return ENCODING_KEYS.filter(k => [...prev, key].includes(k));
    });
  };

  // Individual input handlers
  const toggleLink = useCallback((key) => {
    setPerEncodingInputs(prev => {
      const next = { ...prev };
      if (next[key]) {
        // Currently unlinked → link it (remove individual input)
        delete next[key];
      } else {
        // Currently linked → unlink it (create individual input with current global values)
        next[key] = {
          mode: inputMode,
          binary: binaryInput,
          text: textInput,
        };
      }
      return next;
    });
  }, [inputMode, binaryInput, textInput]);

  const updateEncodingInput = useCallback((key, field, value) => {
    setPerEncodingInputs(prev => {
      const next = { ...prev };
      if (!next[key]) return prev;
      next[key] = { ...next[key], [field]: value };
      return next;
    });
  }, []);

  return (
    <div className="app">
      <div className="bg-effects">
        <div className="bg-orb bg-orb--1" />
        <div className="bg-orb bg-orb--2" />
        <div className="bg-orb bg-orb--3" />
      </div>

      <Header />

      <main className="main-content">
        <div className="sidebar">
          <InputPanel
            inputMode={inputMode}
            setInputMode={setInputMode}
            binaryInput={binaryInput}
            setBinaryInput={setBinaryInput}
            textInput={textInput}
            setTextInput={setTextInput}
          />
          <EncodingSelector
            selectedEncodings={selectedEncodings}
            toggleEncoding={toggleEncoding}
          />
          <InfoPanel />
        </div>

        <div className="waveform-area">
          {globalBits.length > 0 && (
            <BinaryDisplay bits={globalBits} inputMode={inputMode} textInput={textInput} />
          )}

          {globalBits.length === 0 && (
            <div className="empty-state glass-card">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <h3>Enter data to visualize</h3>
              <p>Type a binary string or text in the input panel to see real-time waveform encoding.</p>
            </div>
          )}

          {selectedEncodings.map(key => {
            const data = encodedData[key];
            if (!data) return null;
            const isLinked = !perEncodingInputs[key];
            return (
              <WaveformCanvas
                key={key}
                bits={data.bits}
                encoded={data.encoded}
                encoding={ENCODING_INFO[key]}
                encodingKey={key}
                isMidBit={MID_BIT_ENCODINGS.has(key)}
                isLinked={isLinked}
                individualInput={perEncodingInputs[key] || null}
                onToggleLink={() => toggleLink(key)}
                onUpdateInput={(field, value) => updateEncodingInput(key, field, value)}
              />
            );
          })}

          {globalBits.length > 0 && selectedEncodings.length === 0 && (
            <div className="empty-state glass-card">
              <h3>No encoding selected</h3>
              <p>Select at least one encoding scheme from the sidebar to view waveforms.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Digital Signal Encoding Simulator &mdash; Data Communication Lab (CSE312) &mdash; Green University of Bangladesh</p>
      </footer>
    </div>
  );
}

export default App;
