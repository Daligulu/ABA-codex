'use client';

import { useEffect, useState } from 'react';

export function VideoPanel({ videoRef, onFrame, loading }: { videoRef: any; onFrame: () => void; loading: boolean }) {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'camera') return;
    let stream: MediaStream | null = null;
    async function setup() {
      try {
        if (!videoRef.current) return;
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setError(null);
      } catch (err) {
        console.warn('camera open failed', err);
        setError('无法打开摄像头，请使用“上传视频”模式');
      }
    }
    setup();
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [mode, videoRef]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !videoRef.current) return;
    const url = URL.createObjectURL(file);
    videoRef.current.srcObject = null;
    videoRef.current.src = url;
    videoRef.current.onloadedmetadata = () => {
      videoRef.current?.play();
      // 上传后自动分析一帧，避免用户不知道要点哪里
      onFrame();
    };
  };

  return (
    <div className="panel" style={{ flex: '0 0 360px', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>摄像头/视频</h2>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setMode('camera')}
            style={mode === 'camera' ? { background: 'rgba(248,250,252,0.08)' } : {}}
          >
            摄像头
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setMode('upload')}
            style={mode === 'upload' ? { background: 'rgba(248,250,252,0.08)' } : {}}
          >
            上传视频
          </button>
        </div>
      </div>
      {mode === 'upload' && (
        <input type="file" accept="video/*" onChange={handleFile} style={{ width: '100%' }} />
      )}
      <video ref={videoRef} style={{ width: '100%', borderRadius: '0.75rem', background: '#000', aspectRatio: '3 / 4' }} playsInline muted />
      <button type="button" className="btn" onClick={onFrame} disabled={loading} style={{ alignSelf: 'flex-start' }}>
        {loading ? '模型加载中...' : '开始分析'}
      </button>
      <p style={{ opacity: 0.5, fontSize: '0.8rem', margin: 0 }}>点击“开始分析”或上传视频后自动识别</p>
      {error && <p style={{ color: '#fda4af', fontSize: '0.7rem', margin: 0 }}>{error}</p>}
      <details style={{ background: 'rgba(15,23,42,0.35)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
        <summary>如何拍摄更准确?</summary>
        <ul style={{ margin: '0.25rem 0 0 1.25rem' }}>
          <li>保证上半身(臀部以上)都在画面内</li>
          <li>光线要足够，避免背光</li>
          <li>尽量正对摄像头或侧面，避免大角度偏转</li>
          <li>上传视频时建议使用竖屏或 3:4 比例</li>
        </ul>
      </details>
    </div>
  );
}
