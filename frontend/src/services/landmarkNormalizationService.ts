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
}

export const landmarkNormalizationService = LandmarkNormalizationService.getInstance();
