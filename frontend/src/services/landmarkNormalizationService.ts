/**
 * MOUNAM Landmark Normalization & Feature Extraction Pipeline
 * Transforms raw 21 MediaPipe 3D coordinates into translation-, scale-, and handedness-invariant features.
 */

export interface RawLandmark {
  x: number;
  y: number;
  z: number;
}

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandFrameFeatures {
  normalizedLandmarks: NormalizedLandmark[];
  wristCenteredLandmarks: NormalizedLandmark[];
  scaleFactor: number;
  handedness: 'Left' | 'Right' | 'Unknown';
  palmNormal: { x: number; y: number; z: number };
  fingerSpreads: number[];
  fingerExtensions: number[];
  isValid: boolean;
}

export class LandmarkNormalizationService {
  private static instance: LandmarkNormalizationService;

  private constructor() {}

  public static getInstance(): LandmarkNormalizationService {
    if (!LandmarkNormalizationService.instance) {
      LandmarkNormalizationService.instance = new LandmarkNormalizationService();
    }
    return LandmarkNormalizationService.instance;
  }

  /**
   * Normalizes raw 21 hand landmarks:
   * 1. Translates origin to wrist (landmark 0)
   * 2. Scales by palm size (Euclidean distance from wrist to MCP joint of middle finger)
   * 3. Mirrors X axis if left hand for canonical representation
   */
  public processHandLandmarks(
    landmarks: RawLandmark[],
    handedness: 'Left' | 'Right' | 'Unknown' = 'Right'
  ): HandFrameFeatures | null {
    if (!landmarks || landmarks.length !== 21) {
      return null;
    }

    // Validate that landmark values are finite numbers
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      if (
        !Number.isFinite(pt.x) ||
        !Number.isFinite(pt.y) ||
        !Number.isFinite(pt.z) ||
        pt.x < -0.5 || pt.x > 1.5 ||
        pt.y < -0.5 || pt.y > 1.5
      ) {
        return null;
      }
    }

    const wrist = landmarks[0];
    const middleMcp = landmarks[9];

    // Palm size scale: distance from wrist (0) to middle MCP (9)
    const palmDist = Math.hypot(
      middleMcp.x - wrist.x,
      middleMcp.y - wrist.y,
      middleMcp.z - wrist.z
    );

    // Fallback if palm size is degenerate (e.g. edge-case occlusion)
    const scaleFactor = palmDist > 0.01 ? palmDist : 0.15;

    const isLeftHand = handedness === 'Left';

    // 1. Wrist-centered & Scale-normalized coordinates
    const normalizedLandmarks: NormalizedLandmark[] = landmarks.map((pt) => {
      let dx = (pt.x - wrist.x) / scaleFactor;
      let dy = (pt.y - wrist.y) / scaleFactor;
      let dz = (pt.z - wrist.z) / scaleFactor;

      // Invert X for left hand so models train on canonical right-hand topology
      if (isLeftHand) {
        dx = -dx;
      }

      return { x: dx, y: dy, z: dz };
    });

    const wristCenteredLandmarks: NormalizedLandmark[] = landmarks.map((pt) => ({
      x: pt.x - wrist.x,
      y: pt.y - wrist.y,
      z: pt.z - wrist.z,
    }));

    // Calculate palm normal using cross product of (IndexMCP - Wrist) and (PinkyMCP - Wrist)
    const indexMcp = normalizedLandmarks[5];
    const pinkyMcp = normalizedLandmarks[17];
    const v1 = { x: indexMcp.x, y: indexMcp.y, z: indexMcp.z };
    const v2 = { x: pinkyMcp.x, y: pinkyMcp.y, z: pinkyMcp.z };

    const palmNormal = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x,
    };
    const normLen = Math.hypot(palmNormal.x, palmNormal.y, palmNormal.z) || 1;
    palmNormal.x /= normLen;
    palmNormal.y /= normLen;
    palmNormal.z /= normLen;

    // Finger extensions: ratio of tip distance from wrist vs MCP distance
    const tipIndices = [4, 8, 12, 16, 20];
    const mcpIndices = [2, 5, 9, 13, 17];
    const fingerExtensions = tipIndices.map((tipIdx, i) => {
      const tip = normalizedLandmarks[tipIdx];
      const mcp = normalizedLandmarks[mcpIndices[i]];
      const tipDist = Math.hypot(tip.x, tip.y, tip.z);
      const mcpDist = Math.hypot(mcp.x, mcp.y, mcp.z);
      return mcpDist > 0 ? tipDist / mcpDist : 1.0;
    });

    // Inter-finger spread angles (distance between adjacent fingertips)
    const fingerSpreads = [
      Math.hypot(normalizedLandmarks[4].x - normalizedLandmarks[8].x, normalizedLandmarks[4].y - normalizedLandmarks[8].y),
      Math.hypot(normalizedLandmarks[8].x - normalizedLandmarks[12].x, normalizedLandmarks[8].y - normalizedLandmarks[12].y),
      Math.hypot(normalizedLandmarks[12].x - normalizedLandmarks[16].x, normalizedLandmarks[12].y - normalizedLandmarks[16].y),
      Math.hypot(normalizedLandmarks[16].x - normalizedLandmarks[20].x, normalizedLandmarks[16].y - normalizedLandmarks[20].y),
    ];

    return {
      normalizedLandmarks,
      wristCenteredLandmarks,
      scaleFactor,
      handedness,
      palmNormal,
      fingerSpreads,
      fingerExtensions,
      isValid: true,
    };
  }

  /**
   * Flatten normalized landmarks into 1D feature array (63 floats)
   */
  public toFlatVector(features: HandFrameFeatures): number[] {
    const flat: number[] = [];
    for (const pt of features.normalizedLandmarks) {
      flat.push(pt.x, pt.y, pt.z);
    }
    return flat;
  }

  /**
   * Extract a single-hand enriched feature vector (72 floats):
   * 63 normalized landmarks + 5 finger extensions + 4 finger spreads.
   */
  public toEnrichedHandVector(features: HandFrameFeatures): number[] {
    return [
      ...this.toFlatVector(features),
      ...features.fingerExtensions,
      ...features.fingerSpreads,
    ];
  }

  /**
   * Extract a fixed 157-dimensional feature vector for 1-hand and 2-hand ISL A–Z signs:
   * - [0..71]: Primary hand (Right if present, else first hand) enriched 72 floats
   * - [72..143]: Secondary hand enriched 72 floats (zeros if only 1 hand detected)
   * - [144..155]: 12 inter-hand relational geometric features (normalized by avg palm size)
   * - [156]: handCount indicator (0.5 for 1 hand, 1.0 for 2 hands)
   *
   * Returns null if no valid hand landmarks are detected.
   */
  public extractDualHandAlphabetFeatures(
    handsLandmarks: RawLandmark[][],
    handednesses: Array<'Left' | 'Right' | 'Unknown'> = []
  ): {
    featureVector: number[];
    handCount: 1 | 2;
    detectedHands: Array<'Left' | 'Right' | 'Unknown'>;
    primaryFeatures: HandFrameFeatures;
    secondaryFeatures: HandFrameFeatures | null;
  } | null {
    if (!handsLandmarks || handsLandmarks.length === 0) return null;

    const validHands: Array<{
      raw: RawLandmark[];
      features: HandFrameFeatures;
      handedness: 'Left' | 'Right' | 'Unknown';
    }> = [];

    for (let i = 0; i < Math.min(2, handsLandmarks.length); i++) {
      const handedness = handednesses[i] || 'Unknown';
      const processed = this.processHandLandmarks(handsLandmarks[i], handedness);
      if (processed && processed.isValid) {
        validHands.push({ raw: handsLandmarks[i], features: processed, handedness });
      }
    }

    if (validHands.length === 0) return null;

    // Canonical ordering: Right hand first if both present, else Left/first
    validHands.sort((a, b) => {
      if (a.handedness === b.handedness) return 0;
      if (a.handedness === 'Right') return -1;
      if (b.handedness === 'Right') return 1;
      return 0;
    });

    const primary = validHands[0];
    const secondary = validHands.length > 1 ? validHands[1] : null;

    const primaryVec = this.toEnrichedHandVector(primary.features);
    const secondaryVec = secondary
      ? this.toEnrichedHandVector(secondary.features)
      : new Array<number>(72).fill(0);

    // 12 inter-hand relational features (normalized by mean palm scale)
    let interHandVec = new Array<number>(12).fill(0);
    if (secondary) {
      const avgScale =
        (primary.features.scaleFactor + secondary.features.scaleFactor) / 2 || 0.15;
      const pRaw = primary.raw;
      const sRaw = secondary.raw;

      const wristDx = (sRaw[0].x - pRaw[0].x) / avgScale;
      const wristDy = (sRaw[0].y - pRaw[0].y) / avgScale;
      const wristDz = (sRaw[0].z - pRaw[0].z) / avgScale;
      const wristDist = Math.hypot(wristDx, wristDy, wristDz);

      const distNorm = (idxA: number, idxB: number) =>
        Math.hypot(sRaw[idxB].x - pRaw[idxA].x, sRaw[idxB].y - pRaw[idxA].y, sRaw[idxB].z - pRaw[idxA].z) /
        avgScale;

      const palmDot =
        primary.features.palmNormal.x * secondary.features.palmNormal.x +
        primary.features.palmNormal.y * secondary.features.palmNormal.y +
        primary.features.palmNormal.z * secondary.features.palmNormal.z;

      interHandVec = [
        wristDx,
        wristDy,
        wristDz,
        wristDist,
        distNorm(4, 4),   // Thumb-to-thumb distance
        distNorm(8, 8),   // Index-to-index distance
        distNorm(12, 12), // Middle-to-middle distance
        distNorm(20, 20), // Pinky-to-pinky distance
        distNorm(8, 0),   // Primary index to secondary wrist
        distNorm(0, 8),   // Primary wrist to secondary index
        distNorm(9, 9),   // Palm-center to palm-center distance
        palmDot,          // Palm orientation alignment (-1 to 1)
      ];
    }

    const handCount: 1 | 2 = secondary ? 2 : 1;
    const featureVector = [
      ...primaryVec,
      ...secondaryVec,
      ...interHandVec,
      handCount === 2 ? 1.0 : 0.5,
    ];

    return {
      featureVector,
      handCount,
      detectedHands: validHands.map((h) => h.handedness),
      primaryFeatures: primary.features,
      secondaryFeatures: secondary ? secondary.features : null,
    };
  }
}

export const landmarkNormalizationService = LandmarkNormalizationService.getInstance();
