import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import '@mediapipe/pose';

let detector: poseDetection.PoseDetector | null = null;
let loadingPromise: Promise<poseDetection.PoseDetector> | null = null;

async function createTfjsDetector() {
  const candidates: Array<'webgl' | 'cpu'> = ['webgl', 'cpu'];
  let ok = false;
  for (const b of candidates) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      ok = true;
      break;
    } catch (err) {
      console.warn('[pose] tfjs backend failed:', b, err);
    }
  }
  if (!ok) {
    throw new Error('tfjs backends (webgl/cpu) not available');
  }
  const cfg: any = {
    modelType: 'singlepose.Lightning',
    enableSmoothing: true,
  };
  const d = (await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, cfg)) as poseDetection.PoseDetector;
  return d;
}

async function createMediapipeDetector() {
  const md = (await poseDetection.createDetector(
    poseDetection.SupportedModels.BlazePose,
    {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
      modelType: 'lite',
    } as any
  )) as poseDetection.PoseDetector;
  return md;
}

async function initDetector() {
  // 先尝试 tfjs (webgl/cpu)，失败再尝试 mediapipe，这样能兼容 iOS Safari
  try {
    return await createTfjsDetector();
  } catch (err) {
    console.warn('[pose] tfjs movenet failed, fallback to mediapipe', err);
    return await createMediapipeDetector();
  }
}

export async function loadDetector() {
  if (detector) return detector;
  if (!loadingPromise) {
    loadingPromise = initDetector().then(d => {
      detector = d;
      return d;
    });
  }
  return loadingPromise;
}

export function angleBetween(a: any, b: any, c: any) {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  const cos = dot / (magAB * magCB);
  return Math.acos(Math.min(Math.max(cos, -1), 1)) * (180 / Math.PI);
}
