'use client';

export function ConfigPanel({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const entries = Object.entries(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {entries.map(([key, rule]) => (
        <div key={key} style={{ background: 'rgba(15,23,42,0.35)', borderRadius: '0.75rem', padding: '0.5rem 0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ textTransform: 'capitalize' }}>{key}</span>
            <span style={{ opacity: 0.6 }}>权重 {(rule as any).weight}</span>
          </div>
          <label style={{ fontSize: '0.7rem', opacity: 0.55 }}>目标角度 {(rule as any).target}°</label>
          <input
            type="range"
            min="20"
            max="120"
            value={(rule as any).target}
            onChange={e => onChange({ ...value, [key]: { ...(rule as any), target: Number(e.target.value) } })}
            style={{ width: '100%' }}
          />
          <label style={{ fontSize: '0.7rem', opacity: 0.55 }}>权重</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={(rule as any).weight}
            onChange={e => onChange({ ...value, [key]: { ...(rule as any), weight: Number(e.target.value) } })}
            style={{ width: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}
