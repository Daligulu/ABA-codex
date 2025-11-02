import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

let detector: posedetection.PoseDetector | null = null;
let loadingPromise: Promise<posedetection.PoseDetector> | null = null;

async function initDetector() {
  // 优先 webgl，失败则降级 cpu，确保不会一直卡加载
  const backends = ['webgl', 'cpu'];
  let ok = false;
  for (const b of backends) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      ok = true;
      break;
    } catch (err) {
      console.warn('backend init failed for', b, err);
    }
  }
  if (!ok) {
    await tf.setBackend('cpu');
    await tf.ready();
  }

  const d = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
    modelType: 'singlepose.Lightning',
  });
  detector = d;
  return d;
}

export async function loadDetector() {
  if (detector) return detector;
  if (!loadingPromise) {
    loadingPromise = initDetector();
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
