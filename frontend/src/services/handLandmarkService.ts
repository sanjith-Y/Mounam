/**
 * MOUNAM Hand Landmark Service
 * Loads MediaPipe HandLandmarker client-side in the browser via WebAssembly.
 * Detects landmarks, handedness, and draws hand skeleton connections on canvas.
 */

import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface HandLandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export class HandLandmarkService {
  private static instance: HandLandmarkService;
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;

  private constructor() {}

  public static getInstance(): HandLandmarkService {
    if (!HandLandmarkService.instance) {
      HandLandmarkService.instance = new HandLandmarkService();
    }
    return HandLandmarkService.instance;
  }

  public async initialize(): Promise<HandLandmarker> {
    if (this.handLandmarker) return this.handLandmarker;
    if (this.isInitializing) {
      // Wait until initialized
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (this.handLandmarker) return this.handLandmarker;
    }

    this.isInitializing = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      return this.handLandmarker;
    } finally {
      this.isInitializing = false;
    }
  }

  public detectForVideo(videoElement: HTMLVideoElement, timestampMs: number): HandLandmarkerResult | null {
    if (!this.handLandmarker) return null;
    try {
      return this.handLandmarker.detectForVideo(videoElement, timestampMs);
    } catch (e) {
      console.warn('MediaPipe detectForVideo error:', e);
      return null;
    }
  }

  public drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: HandLandmarkPoint[][],
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);

    // Standard 21 hand landmarks connections
    const HAND_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17], // Palm base
    ];

    for (const hand of landmarks) {
      // Draw connection lines
      ctx.strokeStyle = '#8B5CF6'; // Brand purple
      ctx.lineWidth = 3;
      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const start = hand[startIdx];
        const end = hand[endIdx];
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x * width, start.y * height);
          ctx.lineTo(end.x * width, end.y * height);
          ctx.stroke();
        }
      }

      // Draw landmark joint points
      for (let i = 0; i < hand.length; i++) {
        const pt = hand[i];
        const x = pt.x * width;
        const y = pt.y * height;

        ctx.beginPath();
        ctx.arc(x, y, i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? 6 : 4, 0, 2 * Math.PI);
        ctx.fillStyle = i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? '#3B82F6' : '#EC4899';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  public close(): void {
    if (this.handLandmarker) {
      try {
        this.handLandmarker.close();
      } catch (e) {
        // ignore
      }
      this.handLandmarker = null;
    }
  }
}

export const handLandmarkService = HandLandmarkService.getInstance();
