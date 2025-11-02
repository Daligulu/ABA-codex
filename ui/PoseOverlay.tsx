'use client';

const MOVENET_EDGES: Array<[string, string]> = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

const BLAZEPOSE_EDGES: Array<[string, string]> = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  ['left_eye', 'right_eye'],
  ['left_ear', 'left_eye'],
  ['right_ear', 'right_eye'],
];

function getName(k: any) {
  return k.name || k.part || k.id || k.key || '';
}

export function PoseOverlay({ poses }: { poses: any[] }) {
  const pose = poses && poses[0];
  if (!pose || !pose.keypoints || !pose.keypoints.length) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(248,250,252,.35)', fontSize: '0.8rem' }}>
        暂无姿态，先抓一帧
      </div>
    );
  }

  const keypoints = pose.keypoints.filter((k: any) => (k.score ?? k.confidence ?? 1) > 0.2);
  const xs = keypoints.map((k: any) => k.x);
  const ys = keypoints.map((k: any) => k.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;

  const isBlaze = pose.keypoints.length > 25;
  const edges = isBlaze ? BLAZEPOSE_EDGES : MOVENET_EDGES;

  const kpMap: Record<string, any> = {};
  pose.keypoints.forEach((k: any) => {
    kpMap[getName(k)] = k;
  });

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}>
      {edges.map(([a, b]) => {
        const ka = kpMap[a];
        const kb = kpMap[b];
        if (!ka || !kb) return null;
        const ax = ((ka.x - minX) / width) * 100;
        const ay = ((ka.y - minY) / height) * 100;
        const bx = ((kb.x - minX) / width) * 100;
        const by = ((kb.y - minY) / height) * 100;
        return (
          <line
            key={a + b}
            x1={ax}
            y1={ay}
            x2={bx}
            y2={by}
            stroke="rgba(251,146,60,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
      {keypoints.map((k: any, idx: number) => {
        const x = ((k.x - minX) / width) * 100;
        const y = ((k.y - minY) / height) * 100;
        return <circle key={idx} cx={x} cy={y} r={1.8} fill="#fb923c" />;
      })}
    </svg>
  );
}
