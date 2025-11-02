'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { loadDetector } from '../lib/pose';
import { evaluateShot, getRadarData, defaultRules } from '../lib/scoring';
import { ConfigPanel } from '../ui/ConfigPanel';
import { ShotRadar } from '../ui/ShotRadar';
import { VideoPanel } from '../ui/VideoPanel';

const PoseOverlay = dynamic(() => import('../ui/PoseOverlay').then(m => m.PoseOverlay), { ssr: false });

export default function Page() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [poses, setPoses] = useState<any[]>([]);
  const [detector, setDetector] = useState<any>(null);
  const [score, setScore] = useState<number | null>(null);
  const [activeRules, setActiveRules] = useState(defaultRules);
  const [radar, setRadar] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await loadDetector();
        if (!cancelled) {
          setDetector(d);
        }
      } catch (err) {
        console.error('pose detector load failed', err);
        if (!cancelled) {
          setLoadError('模型加载失败，已切换到降级模式，请尝试重新抓取一帧或改用上传视频');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFrame = async () => {
    if (!detector || !videoRef.current) return;
    try {
      const estimationConfig = { flipHorizontal: false };
      const timestamp = performance.now();
      const ps = await detector.estimatePoses(videoRef.current, estimationConfig, timestamp);
      setPoses(ps);
      if (ps && ps[0]) {
        const s = evaluateShot(ps[0], activeRules);
        setScore(s.total);
        setRadar(getRadarData(s));
      }
    } catch (err) {
      console.error('estimate pose failed', err);
      setLoadError('当前视频帧无法识别，请换角度或上传视频重新分析');
    }
  };

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="badge">AI Basketball Analysis</div>
          <h1 style={{ margin: 0 }}>投篮姿态分析(前端版)</h1>
          <p style={{ margin: 0, opacity: 0.6 }}>浏览器端实时姿态识别 + 打分 + 雷达图 + 可配置评分标准</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={() => handleFrame()} disabled={loading || !detector}>
            {loading ? '模型加载中...' : '抓取一帧'}
          </button>
          <a className="btn" href="https://github.com/chonyy/AI-basketball-analysis" target="_blank" rel="noreferrer">参考项目</a>
        </div>
      </header>
      <div className="app-shell">
        <VideoPanel videoRef={videoRef} onFrame={handleFrame} loading={loading} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
          <div className="panel" style={{ padding: '1rem' }}>
            <h2 style={{ marginTop: 0 }}>姿态与评分</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px', minHeight: 220, position: 'relative' }}>
                <PoseOverlay poses={poses} />
              </div>
              <div style={{ flex: '1 1 220px' }}>
                <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>当前得分</p>
                <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
                  {score !== null ? score.toFixed(1) : '--'}
                </div>
                <p style={{ opacity: 0.6, marginTop: '0.25rem' }}>满分 100，可在右侧配置面板调整权重</p>
                {loadError && (
                  <p style={{ color: '#fda4af', fontSize: '0.75rem', marginTop: '0.5rem' }}>{loadError}</p>
                )}
              </div>
            </div>
          </div>
          <div className="panel" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 240px' }}>
              <h3 style={{ marginTop: 0 }}>雷达图</h3>
              <ShotRadar data={radar} />
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <h3 style={{ marginTop: 0 }}>评分标准配置</h3>
              <ConfigPanel value={activeRules} onChange={setActiveRules} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
