'use client';

import { useEffect } from 'react';

export function VideoPanel({ videoRef, onFrame, loading }: { videoRef: any; onFrame: () => void; loading: boolean }) {
  useEffect(() => {
    async function setup() {
      if (!videoRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setup();
  }, [videoRef]);

  return (
    <div className="panel" style={{ flex: '0 0 360px', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      <h2 style={{ marginTop: 0 }}>摄像头/视频</h2>
      <video ref={videoRef} style={{ width: '100%', borderRadius: '0.75rem', background: '#000', aspectRatio: '3 / 4' }} playsInline muted />
      <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>{loading ? '模型加载中...' : '点击上方“抓取一帧”以分析当前动作'}</p>
      <details style={{ background: 'rgba(15,23,42,0.35)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
        <summary>如何拍摄更准确?</summary>
        <ul style={{ margin: '0.25rem 0 0 1.25rem' }}>
          <li>保证上半身(臀部以上)都在画面内</li>
          <li>光线要足够，避免背光</li>
          <li>尽量正对摄像头或侧面，避免大角度偏转</li>
        </ul>
      </details>
    </div>
  );
}
