import { angleBetween } from './pose';

export const defaultRules = {
  releaseAngle: { target: 60, weight: 0.35 },
  elbowAngle: { target: 90, weight: 0.25 },
  shoulderStability: { target: 20, weight: 0.15 },
  hipBalance: { target: 10, weight: 0.1 },
  kneeFlex: { target: 45, weight: 0.15 },
};

function key(pose: any, name: string) {
  return pose.keypoints?.find((k: any) => k.name === name || k.part === name);
}

export function evaluateShot(pose: any, rules = defaultRules) {
  const leftWrist = key(pose, 'left_wrist') || key(pose, 'left_wrist');
  const leftElbow = key(pose, 'left_elbow');
  const leftShoulder = key(pose, 'left_shoulder');
  const rightWrist = key(pose, 'right_wrist');
  const rightElbow = key(pose, 'right_elbow');
  const rightShoulder = key(pose, 'right_shoulder');
  const leftHip = key(pose, 'left_hip');
  const rightHip = key(pose, 'right_hip');
  const leftKnee = key(pose, 'left_knee');
  const rightKnee = key(pose, 'right_knee');

  // 1. 出手角度 (腕-肘-肩)
  const release = angleBetween(leftWrist || rightWrist, leftElbow || rightElbow, leftShoulder || rightShoulder);
  const elbow = angleBetween(leftShoulder || rightShoulder, leftElbow || rightElbow, leftWrist || rightWrist);
  const shoulder = angleBetween(leftElbow || rightElbow, leftShoulder || rightShoulder, leftHip || rightHip);
  const hip = angleBetween(leftShoulder || rightShoulder, leftHip || rightHip, leftKnee || rightKnee);
  const knee = angleBetween(leftHip || rightHip, leftKnee || rightKnee, key(pose, 'left_ankle') || key(pose, 'right_ankle'));

  function scoreAngle(actual: number | null, target: number, weight: number) {
    if (actual == null) return 0;
    const diff = Math.abs(actual - target);
    const base = Math.max(0, 1 - diff / 35);
    return base * weight * 100;
  }

  const parts = {
    releaseAngle: scoreAngle(release, rules.releaseAngle.target, rules.releaseAngle.weight),
    elbowAngle: scoreAngle(elbow, rules.elbowAngle.target, rules.elbowAngle.weight),
    shoulderStability: scoreAngle(shoulder, rules.shoulderStability.target, rules.shoulderStability.weight),
    hipBalance: scoreAngle(hip, rules.hipBalance.target, rules.hipBalance.weight),
    kneeFlex: scoreAngle(knee, rules.kneeFlex.target, rules.kneeFlex.weight),
  };

  return {
    ...parts,
    total: Object.values(parts).reduce((a: any, b: any) => a + b, 0),
    advice: buildAdvice({ release, elbow, shoulder, hip, knee }, rules),
  };
}

function buildAdvice(meas: any, rules: any) {
  const out: string[] = [];
  if (meas.release && Math.abs(meas.release - rules.releaseAngle.target) > 15) {
    out.push('出手角度略有偏差，保持手肘稳定向上发力');
  }
  if (meas.elbow && Math.abs(meas.elbow - rules.elbowAngle.target) > 12) {
    out.push('手肘离身体太开/太近，可尝试肘尖朝篮筐');
  }
  if (meas.knee && meas.knee < 25) {
    out.push('下肢蹬地不足，适当多屈膝');
  }
  if (!out.length) out.push('动作整体较好，保持节奏');
  return out;
}

export function getRadarData(s: any) {
  if (!s) return null;
  return {
    labels: ['出手', '肘角', '肩部', '髋部', '膝盖'],
    datasets: [
      {
        label: '当前',
        data: [s.releaseAngle, s.elbowAngle, s.shoulderStability, s.hipBalance, s.kneeFlex].map(v => (v ?? 0).toFixed ? Number(v.toFixed(1)) : v),
      },
    ],
    advice: s.advice,
  };
}
