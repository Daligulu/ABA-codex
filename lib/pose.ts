import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

let detector: poseDetection.PoseDetector | null = null;
let loadingPromise: Promise<poseDetection.PoseDetector> | null = null;

async function initDetector() {
  // iOS / Safari / 部分安卓会禁掉 webgl，需要兜底到 cpu
  const candidateBackends: Array<'webgl' | 'cpu'> = ['webgl', 'cpu'];
  let set = false;
  for (const b of candidateBackends) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      set = true;
      break;
    } catch (err) {
      console.warn('backend init failed:', b, err);
    }
  }
  if (!set) {
    throw new Error('No available tfjs backend (webgl/cpu)');
  }

  // ⚠️ 注意：pose-detection 的 MoveNet 要用枚举，不要写字符串
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    } as poseDetection.movenet.MovenetModelConfig
  );

  return detector;
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
