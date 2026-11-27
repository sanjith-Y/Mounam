/**
 * MOUNAM ISL Alphabet Configuration (A–Z)
 * Derived from the Indian Sign Language (ISL) two-handed fingerspelling reference chart.
 * Distinguishes 1-hand vs 2-hand signs, static vs movement-based signs, and visual similarity groups.
 */

export type AlphabetLetter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export const ALPHABET_LETTERS: AlphabetLetter[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
];

export interface AlphabetClassConfig {
  letter: AlphabetLetter;
  label: AlphabetLetter;
  handsRequired: 1 | 2;
  isDynamic: boolean;
  chartReference: string;
  similarGroup?: string;
}

export const ISL_ALPHABET_CONFIG: Record<AlphabetLetter, AlphabetClassConfig> = {
  A: {
    letter: 'A',
    label: 'A',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Both fists closed with thumbs extended and touching tip-to-tip horizontally.',
    similarGroup: 'A/G',
  },
  B: {
    letter: 'B',
    label: 'B',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Both hands form thumb-and-index circles touching side-by-side (like eyeglasses).',
  },
  C: {
    letter: 'C',
    label: 'C',
    handsRequired: 1,
    isDynamic: false,
    chartReference: 'Single hand curved into a C-shape with thumb and fingers parted.',
    similarGroup: 'C/O',
  },
  D: {
    letter: 'D',
    label: 'D',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Upright index finger of one hand touched at top and base by curved thumb/index of other hand.',
    similarGroup: 'D/P/Q',
  },
  E: {
    letter: 'E',
    label: 'E',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Index finger tip of one hand touches the extended index fingertip of the other hand.',
  },
  F: {
    letter: 'F',
    label: 'F',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Index and middle fingers of one hand placed across index and middle fingers of the other.',
  },
  G: {
    letter: 'G',
    label: 'G',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Both fists closed, one stacked directly on top of the other.',
    similarGroup: 'A/G',
  },
  H: {
    letter: 'H',
    label: 'H',
    handsRequired: 2,
    isDynamic: true,
    chartReference: 'Flat palm slides forward across the opposite flat palm (movement sign).',
  },
  I: {
    letter: 'I',
    label: 'I',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Upright index finger of one hand touches the closed fist / thumb knuckle of the other.',
  },
  J: {
    letter: 'J',
    label: 'J',
    handsRequired: 2,
    isDynamic: true,
    chartReference: 'Index finger traces a J-curve across the opposite open palm and fingers (movement sign).',
  },
  K: {
    letter: 'K',
    label: 'K',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Hooked/bent index finger of one hand touches the upright index finger of the other.',
  },
  L: {
    letter: 'L',
    label: 'L',
    handsRequired: 1,
    isDynamic: false,
    chartReference: 'Single hand with thumb and index finger extended at a 90-degree L-angle.',
  },
  M: {
    letter: 'M',
    label: 'M',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Three fingers (index, middle, ring) placed onto the opposite open palm.',
    similarGroup: 'M/N',
  },
  N: {
    letter: 'N',
    label: 'N',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Two fingers (index, middle) placed onto the opposite open palm.',
    similarGroup: 'M/N',
  },
  O: {
    letter: 'O',
    label: 'O',
    handsRequired: 1,
    isDynamic: false,
    chartReference: 'Single hand with thumb and fingers curved to meet in a closed O-ring.',
    similarGroup: 'C/O',
  },
  P: {
    letter: 'P',
    label: 'P',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Thumb-index circle of one hand touches the top of the upright index finger of the other.',
    similarGroup: 'D/P/Q',
  },
  Q: {
    letter: 'Q',
    label: 'Q',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Hooked index finger of one hand hooks inside the C/O-ring of the other hand.',
    similarGroup: 'D/P/Q',
  },
  R: {
    letter: 'R',
    label: 'R',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Curved/hooked index finger rested against the opposite open palm.',
  },
  S: {
    letter: 'S',
    label: 'S',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Pinky/little fingers of both hands hooked/interlocked vertically.',
  },
  T: {
    letter: 'T',
    label: 'T',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Upright index finger tip touches the underside of the horizontal flat hand/index.',
  },
  U: {
    letter: 'U',
    label: 'U',
    handsRequired: 1,
    isDynamic: false,
    chartReference: 'Single hand with index and pinky (or two outer fingers) extended upward in a U-shape.',
    similarGroup: 'U/V',
  },
  V: {
    letter: 'V',
    label: 'V',
    handsRequired: 1,
    isDynamic: false,
    chartReference: 'Single hand with index and middle fingers extended apart in a V-shape.',
    similarGroup: 'U/V',
  },
  W: {
    letter: 'W',
    label: 'W',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Fingers of both hands interlocked together at an angle.',
  },
  X: {
    letter: 'X',
    label: 'X',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Index fingers of both hands crossed over each other in an X-shape.',
  },
  Y: {
    letter: 'Y',
    label: 'Y',
    handsRequired: 2,
    isDynamic: true,
    chartReference: 'Index finger slides into the web between thumb and index of the other hand (movement sign).',
  },
  Z: {
    letter: 'Z',
    label: 'Z',
    handsRequired: 2,
    isDynamic: false,
    chartReference: 'Flat hand held at an angle with fingertips touching the opposite flat upright palm.',
  },
};
