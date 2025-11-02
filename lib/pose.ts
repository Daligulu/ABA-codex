import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs';

let detector: posedetection.PoseDetector | null = null;

export async function loadDetector() {
  if (detector) return detector;
  await (await import('@tensorflow/tfjs')).setBackend('webgl');
  detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
    modelType: 'singlepose.Lightning',
  });
  return detector;
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
