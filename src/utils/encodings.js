/**
 * Digital Signal Encoding Functions
 * 
 * Each encoding function takes a bit array (e.g. [1,0,1,1,0,0,0,1])
 * and returns an array of segments: { startLevel, endLevel }
 * 
 * Voltage levels:
 *   +1 = High (+V)
 *    0 = Zero (baseline)
 *   -1 = Low  (-V)
 * 
 * For Manchester / Differential Manchester, each bit produces TWO half-segments
 * (first-half and second-half), so the returned array contains objects with:
 *   { firstHalf, secondHalf }  where each half is a voltage level.
 */

/**
 * NRZ-L (Non-Return-to-Zero Level)
 * Rule:
 *   bit 1 → High (+V)
 *   bit 0 → Low  (-V)
 * No mid-bit transitions.
 */
export function encodeNRZL(bits) {
  return bits.map(bit => ({
    level: bit === 1 ? 1 : -1,
  }));
}

/**
 * NRZ-I (Non-Return-to-Zero Inverted)
 * Rule:
 *   bit 1 → Invert the current level
 *   bit 0 → Keep the current level
 * State-dependent. Initial level assumed = +1 (High).
 */
export function encodeNRZI(bits) {
  let currentLevel = 1; // start high
  return bits.map(bit => {
    if (bit === 1) {
      currentLevel = currentLevel === 1 ? -1 : 1; // invert
    }
    // bit 0 → no change
    return { level: currentLevel };
  });
}

/**
 * Manchester (IEEE 802.3)
 * Rule:
 *   bit 1 → High-to-Low transition at mid-bit  (first half = +V, second half = -V)
 *   bit 0 → Low-to-High transition at mid-bit  (first half = -V, second half = +V)
 * Every bit has a guaranteed mid-bit transition — excellent clock recovery.
 */
export function encodeManchester(bits) {
  return bits.map(bit => {
    if (bit === 1) {
      return { firstHalf: 1, secondHalf: -1 };
    } else {
      return { firstHalf: -1, secondHalf: 1 };
    }
  });
}

/**
 * Differential Manchester
 * Rule:
 *   - There is ALWAYS a transition at the MIDDLE of the bit period (for clocking).
 *   - bit 0 → Transition at the BEGINNING of the bit period (inversion)
 *   - bit 1 → NO transition at the beginning of the bit period
 * State-dependent. We track the level at the start of each bit.
 */
export function encodeDifferentialManchester(bits) {
  // We assume the level at the start of the first bit is +1
  let lastLevel = 1;
  return bits.map(bit => {
    let startLevel;
    if (bit === 0) {
      // Transition at beginning → invert
      startLevel = lastLevel === 1 ? -1 : 1;
    } else {
      // No transition at beginning → keep
      startLevel = lastLevel;
    }
    // Mid-bit transition: always invert at the middle
    const firstHalf = startLevel;
    const secondHalf = startLevel === 1 ? -1 : 1;
    // The level at the END of this bit is secondHalf
    // For the next bit, lastLevel = secondHalf
    lastLevel = secondHalf;
    return { firstHalf, secondHalf };
  });
}

/**
 * AMI (Alternate Mark Inversion)
 * Rule:
 *   bit 0 → Zero voltage (baseline, 0)
 *   bit 1 → Alternates between +V and -V for successive 1s
 * Three-level signal.
 */
export function encodeAMI(bits) {
  let lastPolarity = -1; // so first '1' will be +1
  return bits.map(bit => {
    if (bit === 0) {
      return { level: 0 };
    } else {
      lastPolarity = lastPolarity === 1 ? -1 : 1;
      return { level: lastPolarity };
    }
  });
}

/**
 * Pseudoternary
 * Rule:
 *   bit 1 → Zero voltage (baseline, 0)
 *   bit 0 → Alternates between +V and -V for successive 0s
 * Three-level signal. This is the inverse of AMI — spaces (0s) get alternating polarity.
 */
export function encodePseudoTernary(bits) {
  let lastPolarity = -1; // so first '0' will be +1
  return bits.map(bit => {
    if (bit === 1) {
      return { level: 0 };
    } else {
      lastPolarity = lastPolarity === 1 ? -1 : 1;
      return { level: lastPolarity };
    }
  });
}

/**
 * Convert plain text to an array of bits (8-bit ASCII per character).
 */
export function textToBits(text) {
  const bits = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) & 0xFF; // clamp to 8-bit
    for (let b = 7; b >= 0; b--) {
      bits.push((charCode >> b) & 1);
    }
  }
  return bits;
}

/**
 * Parse a binary string ("10110001") into a bit array [1,0,1,1,0,0,0,1].
 * Ignores non-0/1 characters.
 */
export function parseBinaryString(str) {
  return str.split('').filter(c => c === '0' || c === '1').map(Number);
}

/**
 * Generate step-by-step explanations for an encoding scheme.
 * Returns an array of step objects for each bit.
 */
export function generateStepExplanations(encodingKey, bits) {
  const steps = [];

  switch (encodingKey) {
    case 'NRZ-L': {
      bits.forEach((bit, i) => {
        const level = bit === 1 ? '+V' : '−V';
        steps.push({
          step: i + 1,
          bit,
          rule: bit === 1
            ? 'Bit is 1 → Signal level is set to High (+V)'
            : 'Bit is 0 → Signal level is set to Low (−V)',
          result: `Signal: ${level}`,
          stateChange: null,
        });
      });
      break;
    }

    case 'NRZ-I': {
      let currentLevel = 1; // start high
      bits.forEach((bit, i) => {
        const prevLevel = currentLevel;
        if (bit === 1) {
          currentLevel = currentLevel === 1 ? -1 : 1;
          const prevLabel = prevLevel === 1 ? '+V' : '−V';
          const newLabel = currentLevel === 1 ? '+V' : '−V';
          steps.push({
            step: i + 1,
            bit,
            rule: `Bit is 1 → Invert the current level (${prevLabel} → ${newLabel})`,
            result: `Signal: ${newLabel}`,
            stateChange: `Level changed from ${prevLabel} to ${newLabel}`,
          });
        } else {
          const label = currentLevel === 1 ? '+V' : '−V';
          steps.push({
            step: i + 1,
            bit,
            rule: `Bit is 0 → Keep the current level (${label})`,
            result: `Signal: ${label}`,
            stateChange: null,
          });
        }
      });
      break;
    }

    case 'Manchester': {
      bits.forEach((bit, i) => {
        if (bit === 1) {
          steps.push({
            step: i + 1,
            bit,
            rule: 'Bit is 1 → High-to-Low transition at mid-bit',
            result: 'First half: +V, Second half: −V',
            stateChange: 'Mid-bit transition: +V → −V',
          });
        } else {
          steps.push({
            step: i + 1,
            bit,
            rule: 'Bit is 0 → Low-to-High transition at mid-bit',
            result: 'First half: −V, Second half: +V',
            stateChange: 'Mid-bit transition: −V → +V',
          });
        }
      });
      break;
    }

    case 'Diff-Manchester': {
      let lastLevel = 1;
      bits.forEach((bit, i) => {
        const prevEnd = lastLevel === 1 ? '+V' : '−V';
        let startLevel;
        if (bit === 0) {
          startLevel = lastLevel === 1 ? -1 : 1;
          const startLabel = startLevel === 1 ? '+V' : '−V';
          const endLabel = startLevel === 1 ? '−V' : '+V';
          const secondHalf = startLevel === 1 ? -1 : 1;
          lastLevel = secondHalf;
          steps.push({
            step: i + 1,
            bit,
            rule: `Bit is 0 → Transition at start (invert from ${prevEnd} to ${startLabel}), then always transition at mid-bit`,
            result: `First half: ${startLabel}, Second half: ${endLabel}`,
            stateChange: `Start inversion: ${prevEnd} → ${startLabel}, Mid-bit: ${startLabel} → ${endLabel}`,
          });
        } else {
          startLevel = lastLevel;
          const startLabel = startLevel === 1 ? '+V' : '−V';
          const endLabel = startLevel === 1 ? '−V' : '+V';
          const secondHalf = startLevel === 1 ? -1 : 1;
          lastLevel = secondHalf;
          steps.push({
            step: i + 1,
            bit,
            rule: `Bit is 1 → No transition at start (stay at ${startLabel}), then always transition at mid-bit`,
            result: `First half: ${startLabel}, Second half: ${endLabel}`,
            stateChange: `No start change, Mid-bit: ${startLabel} → ${endLabel}`,
          });
        }
      });
      break;
    }

    case 'AMI': {
      let lastPolarity = -1;
      bits.forEach((bit, i) => {
        if (bit === 0) {
          steps.push({
            step: i + 1,
            bit,
            rule: 'Bit is 0 → Zero voltage (0V)',
            result: 'Signal: 0V',
            stateChange: null,
          });
        } else {
          const prevLabel = lastPolarity === 1 ? '+V' : '−V';
          lastPolarity = lastPolarity === 1 ? -1 : 1;
          const newLabel = lastPolarity === 1 ? '+V' : '−V';
          steps.push({
            step: i + 1,
            bit,
            rule: `Bit is 1 → Alternate polarity (last mark was ${prevLabel}, so this mark is ${newLabel})`,
            result: `Signal: ${newLabel}`,
            stateChange: `Polarity alternated: ${prevLabel} → ${newLabel}`,
          });
        }
      });
      break;
    }

    case 'Pseudoternary': {
      let lastPolarity = -1;
      bits.forEach((bit, i) => {
        if (bit === 1) {
          steps.push({
            step: i + 1,
            bit,
            rule: 'Bit is 1 → Zero voltage (0V)',
            result: 'Signal: 0V',
            stateChange: null,
          });
        } else {
          const prevLabel = lastPolarity === 1 ? '+V' : '−V';
          lastPolarity = lastPolarity === 1 ? -1 : 1;
          const newLabel = lastPolarity === 1 ? '+V' : '−V';
          steps.push({
            step: i + 1,
            bit,
            rule: `Bit is 0 → Alternate polarity (last space was ${prevLabel}, so this space is ${newLabel})`,
            result: `Signal: ${newLabel}`,
            stateChange: `Polarity alternated: ${prevLabel} → ${newLabel}`,
          });
        }
      });
      break;
    }

    default:
      break;
  }

  return steps;
}

/**
 * Metadata for each encoding scheme.
 */
export const ENCODING_INFO = {
  'NRZ-L': {
    name: 'NRZ-L',
    fullName: 'Non-Return-to-Zero Level',
    color: '#6366f1',       // indigo
    description: 'The voltage level directly represents the bit value. Bit 1 is represented by a high voltage (+V) and bit 0 by a low voltage (−V). There are no transitions at the middle of the bit interval.',
    pros: ['Simple to implement', 'Good bandwidth efficiency'],
    cons: ['No self-clocking capability', 'Baseline wandering (DC component)', 'Difficult synchronization for long runs of 0s or 1s'],
    usage: 'Used in TTL (Transistor-Transistor Logic) circuits and some serial interfaces.',
  },
  'NRZ-I': {
    name: 'NRZ-I',
    fullName: 'Non-Return-to-Zero Inverted',
    color: '#f59e0b',       // amber
    description: 'The signal level is inverted at the beginning of a bit period for bit 1; it remains unchanged for bit 0. This is a differential encoding scheme — the bit value is determined by the presence or absence of a transition.',
    pros: ['Better synchronization than NRZ-L for runs of 1s', 'Differential — immune to polarity reversal'],
    cons: ['Still has problems with long runs of 0s', 'DC component still present'],
    usage: 'Used in USB 2.0 and some optical fiber systems.',
  },
  'Manchester': {
    name: 'Manchester',
    fullName: 'Manchester (IEEE 802.3)',
    color: '#10b981',       // emerald
    description: 'Every bit has a guaranteed transition at the mid-point: bit 1 transitions from high to low, bit 0 transitions from low to high. This embeds the clock signal within the data.',
    pros: ['Self-clocking — excellent synchronization', 'No DC component', 'Easy error detection'],
    cons: ['Requires double the bandwidth of NRZ', 'Less bandwidth efficient'],
    usage: 'Standard encoding for 10 Mbps Ethernet (IEEE 802.3).',
  },
  'Diff-Manchester': {
    name: 'Diff-Manchester',
    fullName: 'Differential Manchester',
    color: '#ec4899',       // pink
    description: 'Always has a transition at the mid-bit (for clocking). Bit 0 causes an additional transition at the beginning of the bit period; bit 1 does not. Combines differential encoding with self-clocking.',
    pros: ['Self-clocking', 'Differential encoding — polarity independent', 'No DC component'],
    cons: ['Complex implementation', 'Requires double bandwidth like Manchester'],
    usage: 'Used in IEEE 802.5 Token Ring networks.',
  },
  'AMI': {
    name: 'AMI',
    fullName: 'Alternate Mark Inversion',
    color: '#ef4444',       // red
    description: 'Bit 0 is represented by zero voltage. Bit 1 alternates between positive (+V) and negative (−V) voltage for successive marks. This is a three-level (bipolar) encoding scheme.',
    pros: ['No DC component', 'Error detection (bipolar violation)', 'Good bandwidth efficiency'],
    cons: ['Long runs of 0s cause synchronization loss', 'Three voltage levels required'],
    usage: 'Used in T1/E1 lines and ISDN (often with B8ZS or HDB3 scrambling).',
  },
  'Pseudoternary': {
    name: 'Pseudoternary',
    fullName: 'Pseudoternary (Inverse AMI)',
    color: '#06b6d4',       // cyan
    description: 'Bit 1 is represented by zero voltage. Bit 0 alternates between positive (+V) and negative (−V) voltage for successive spaces. This is the inverse of AMI — a three-level (bipolar) encoding where spaces carry the alternating polarity instead of marks.',
    pros: ['No DC component', 'Error detection (bipolar violation)', 'Good bandwidth efficiency'],
    cons: ['Long runs of 1s cause synchronization loss', 'Three voltage levels required', 'Less common than AMI'],
    usage: 'Used in some ISDN implementations and as an alternative to AMI in certain telecom systems.',
  },
};
