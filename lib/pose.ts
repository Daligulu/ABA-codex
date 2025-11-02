import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

let detector: poseDetection.PoseDetector | null = null;
let loadingPromise: Promise<poseDetection.PoseDetector> | null = null;

async function initDetector() {
  // 1. 选择一个可用的后端，优先 webgl，不行就 cpu
  const candidates: Array<'webgl' | 'cpu'> = ['webgl', 'cpu'];
  let ready = false;
  for (const b of candidates) {
    try {
      await tf.setBackend(b);
      await tf.ready();
      ready = true;
      break;
    } catch (err) {
      console.warn('[pose] backend init failed:', b, err);
    }
  }
  if (!ready) {
    throw new Error('No TFJS backend available');
  }

  // 2. 创建 MoveNet 检测器
  //   NOTE: pose-detection 的类型里不一定导出 movenet 命名空间，
  //   所以这里直接用 any 来绕过 TS，在运行期仍然是标准配置。
  const detector = (await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: 'singlepose.Lightning',
      enableSmoothing: true,
    } as any
  )) as poseDetection.PoseDetector;

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
