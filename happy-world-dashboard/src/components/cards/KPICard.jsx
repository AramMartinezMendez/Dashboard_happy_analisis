
import CountUp from 'react-countup';

export default function KPICard({ title, value, suffix, delta, deltaLabel, icon }) {
  const isPositive = delta > 0;
  const arrow = isPositive ? '▲' : delta < 0 ? '▼' : '●';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      padding: 'var(--spacing-lg)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '140px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          margin: 0,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {title}
        </p>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '2.2rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {value != null ? (
              <CountUp end={value} duration={1.5} />
            ) : '—'}
          </span>
          {suffix && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {suffix}
            </span>
          )}
        </div>

        {delta != null && (
          <p style={{
            fontSize: '0.8rem',
            margin: '6px 0 0 0',
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {arrow} {isPositive ? '+' : ''}{delta} {deltaLabel}
          </p>
        )}
      </div>
    </div>
  );
}

