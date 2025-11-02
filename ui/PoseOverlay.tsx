'use client';

export function PoseOverlay({ poses }: { poses: any[] }) {
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 220 }}>
      <svg viewBox="0 0 640 480" style={{ width: '100%', height: '100%' }}>
        {poses?.[0]?.keypoints?.map((k: any, i: number) => (
          <circle key={i} cx={k.x} cy={k.y} r={4} fill="#f97316" opacity={k.score ?? 0.6} />
        ))}
      </svg>
      {!poses?.length && <p style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: 0.4 }}>暂无姿态，先抓一帧</p>}
    </div>
  );
}
