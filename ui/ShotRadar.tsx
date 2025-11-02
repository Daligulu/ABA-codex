'use client';

import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function ShotRadar({ data }: { data: any }) {
  if (!data) return <p style={{ opacity: 0.5 }}>暂无数据，先抓取一帧吧</p>;
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((d: any) => ({
      ...d,
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
      borderColor: 'rgba(249, 115, 22, 1)',
      pointBackgroundColor: 'rgba(249, 115, 22, 1)',
    })),
  };
  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.15)' },
        pointLabels: { color: '#fff' },
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
    maintainAspectRatio: false,
  } as any;
  return (
    <div style={{ height: 260 }}>
      <Radar data={chartData} options={options} />
      <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
        {data.advice?.map((a: string, i: number) => (
          <li key={i} style={{ opacity: 0.9, fontSize: '0.8rem' }}>{a}</li>
        ))}
      </ul>
    </div>
  );
}
