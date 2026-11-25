/**
 * MOUNAM Gesture Recognition Engine
 * Analyzes geometric landmark relationships (finger extension, angles, thumb orientation)
 * Applies debouncing, multi-frame stability filtering, and gesture cooldown.
 */

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export type GestureType =
  | 'OPEN_PALM'
  | 'THUMBS_UP'
  | 'THUMBS_DOWN'
  | 'INDEX_POINTING'
  | 'VICTORY'
  | 'CLOSED_FIST'
  | 'UNKNOWN';

export interface GestureMapping {
  id: string;
  gestureType: GestureType;
  gestureName: string;
  assignedMessage: string;
  language: string;
  enabled: boolean;
  confidenceThreshold: number;
}

export interface RecognitionResult {
  gesture: GestureType;
  gestureName: string;
  confidence: number;
  handedness: 'Left' | 'Right' | 'Unknown';
  assignedMessage?: string;
  stable: boolean;
}

export const DEFAULT_GESTURE_MAPPINGS: GestureMapping[] = [
  {
    id: 'g_open_palm',
    gestureType: 'OPEN_PALM',
    gestureName: 'Open Palm',
    assignedMessage: 'Please stop. Wait a moment.',
    language: 'en',
    enabled: true,
    confidenceThreshold: 0.75,
  },
  {
    id: 'g_thumbs_up',
    gestureType: 'THUMBS_UP',
    gestureName: 'Thumbs Up',
    assignedMessage: 'Yes, I agree and understand.',
    language: 'en',
    enabled: true,
    confidenceThreshold: 0.75,
  },
  {
    id: 'g_thumbs_down',
    gestureType: 'THUMBS_DOWN',
    gestureName: 'Thumbs Down',
    assignedMessage: 'No, I need something else.',
    language: 'en',
    enabled: true,
    confidenceThreshold: 0.75,
  },
  {
    id: 'g_index_pointing',
    gestureType: 'INDEX_POINTING',
    gestureName: 'Raised Index Finger',
    assignedMessage: 'Please wait, I want to say something.',
    language: 'en',
    enabled: true,
    confidenceThreshold: 0.75,
  },
  {
    id: 'g_victory',
    gestureType: 'VICTORY',
    gestureName: 'Victory / Peace Sign',
    assignedMessage: 'Everything is peaceful and okay.',
    language: 'en',
    enabled: true,
    confidenceThreshold: 0.75,
  },
  {
    id: 'g_closed_fist',
    gestureType: 'CLOSED_FIST',
    gestureName: 'Closed Fist',
    assignedMessage: 'I need urgent help or assistance.',
    language: 'en',
    enabled: false, // Disabled by default for safety as required by spec
    confidenceThreshold: 0.85,
  },
];

export class GestureRecognitionService {
  private static instance: GestureRecognitionService;
  private mappings: GestureMapping[] = [];
  
  // Multi-frame stability tracking
  private recentDetections: GestureType[] = [];
  private readonly STABILITY_FRAME_COUNT = 6; // Must hold gesture across 6 consecutive frames (~200ms)
  public getCurrentStableGesture(): GestureType {
    return this.currentStableGesture;
  }
  private currentStableGesture: GestureType = 'UNKNOWN';
  private lastTriggerTime: number = 0;
  private readonly COOLDOWN_MS = 1500; // 1.5s cooldown to prevent repeated accidental triggers

  private constructor() {
    this.loadMappings();
  }

  public static getInstance(): GestureRecognitionService {
    if (!GestureRecognitionService.instance) {
      GestureRecognitionService.instance = new GestureRecognitionService();
    }
    return GestureRecognitionService.instance;
  }

  public loadMappings(): GestureMapping[] {
    const saved = localStorage.getItem('mounam_gesture_mappings');
    if (saved) {
      try {
        this.mappings = JSON.parse(saved);
        return this.mappings;
      } catch {
        // fallback
      }
    }
    this.mappings = [...DEFAULT_GESTURE_MAPPINGS];
    return this.mappings;
  }

  public saveMappings(mappings: GestureMapping[]): void {
    this.mappings = mappings;
    localStorage.setItem('mounam_gesture_mappings', JSON.stringify(mappings));
  }

  public getMappings(): GestureMapping[] {
    return this.mappings;
  }

  /**
   * Geometric classification of hand landmarks (21 points)
   */
  public classify(landmarks: HandLandmark[], handednessStr: string = 'Unknown'): RecognitionResult {
    if (!landmarks || landmarks.length < 21) {
      this.recentDetections = [];
      return {
        gesture: 'UNKNOWN',
        gestureName: 'No Hand Detected',
        confidence: 0,
        handedness: 'Unknown',
        stable: false,
      };
    }

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];

    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const indexMcp = landmarks[5];

    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const middleMcp = landmarks[9];

    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const ringMcp = landmarks[13];

    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];
    const pinkyMcp = landmarks[17];

    // Helper: is finger extended (tip is significantly farther from wrist than pip/mcp)
    const isFingerExtended = (tip: HandLandmark, pip: HandLandmark, mcp: HandLandmark): boolean => {
      const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const pipDist = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
      const mcpDist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
      return tipDist > pipDist * 1.05 && pipDist > mcpDist;
    };

    const indexExtended = isFingerExtended(indexTip, indexPip, indexMcp);
    const middleExtended = isFingerExtended(middleTip, middlePip, middleMcp);
    const ringExtended = isFingerExtended(ringTip, ringPip, ringMcp);
    const pinkyExtended = isFingerExtended(pinkyTip, pinkyPip, pinkyMcp);

    // Thumb extension check
    const thumbDist = Math.hypot(thumbTip.x - wrist.x, thumbTip.y - wrist.y);
    const thumbMcpDist = Math.hypot(thumbMcp.x - wrist.x, thumbMcp.y - wrist.y);
    const thumbExtended = thumbDist > thumbMcpDist * 1.15;

    let detectedGesture: GestureType = 'UNKNOWN';
    let rawConfidence = 0.6;

    // 1. OPEN PALM: All 5 fingers extended
    if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
      detectedGesture = 'OPEN_PALM';
      rawConfidence = 0.92;
    }
    // 2. CLOSED FIST: All 4 main fingers folded into palm
    else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      if (thumbTip.y < wrist.y - 0.15 && Math.abs(thumbTip.x - wrist.x) < 0.2) {
        detectedGesture = 'THUMBS_UP';
        rawConfidence = 0.88;
      } else if (thumbTip.y > wrist.y + 0.1) {
        detectedGesture = 'THUMBS_DOWN';
        rawConfidence = 0.85;
      } else {
        detectedGesture = 'CLOSED_FIST';
        rawConfidence = 0.88;
      }
    }
    // 3. VICTORY / PEACE: Index & Middle extended, Ring & Pinky folded
    else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      detectedGesture = 'VICTORY';
      rawConfidence = 0.90;
    }
    // 4. INDEX POINTING / WAIT: Only Index extended
    else if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      detectedGesture = 'INDEX_POINTING';
      rawConfidence = 0.89;
    }

    // Apply temporal stability window
    this.recentDetections.push(detectedGesture);
    if (this.recentDetections.length > this.STABILITY_FRAME_COUNT) {
      this.recentDetections.shift();
    }

    const matchesCount = this.recentDetections.filter((g) => g === detectedGesture && g !== 'UNKNOWN').length;
    const isStable = matchesCount >= this.STABILITY_FRAME_COUNT - 1;

    const matchedMapping = this.mappings.find((m) => m.gestureType === detectedGesture && m.enabled);

    const now = Date.now();
    const canTrigger = isStable && matchedMapping && now - this.lastTriggerTime > this.COOLDOWN_MS;

    if (canTrigger) {
      this.currentStableGesture = detectedGesture;
      this.lastTriggerTime = now;
    }

    const handednessClean: 'Left' | 'Right' | 'Unknown' =
      handednessStr.toLowerCase().includes('left') ? 'Left' :
      handednessStr.toLowerCase().includes('right') ? 'Right' : 'Unknown';

    return {
      gesture: detectedGesture,
      gestureName: matchedMapping ? matchedMapping.gestureName : detectedGesture.replace('_', ' '),
      confidence: rawConfidence,
      handedness: handednessClean,
      assignedMessage: matchedMapping?.assignedMessage,
      stable: isStable && !!matchedMapping,
    };
  }

  public reset(): void {
    this.recentDetections = [];
    this.currentStableGesture = 'UNKNOWN';
  }
}

export const gestureRecognitionService = GestureRecognitionService.getInstance();
