
import CountUp from 'react-countup';

export default function KPIPrimary({ title, value, max, delta, deltaLabel }) {
  const isPositive = delta > 0;
  const arrow = isPositive ? '▲' : delta < 0 ? '▼' : '●';

  return (
    <div style={{
      background: 'var(--kpi-primary-bg)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--spacing-lg)',
      color: 'var(--kpi-primary-text)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '140px',
    }}>
      <p style={{
        fontSize: '0.8rem',
        opacity: 0.8,
        margin: 0,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title}
      </p>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            lineHeight: 1,
          }}>
            {value != null ? (
              <CountUp end={value} decimals={2} duration={1.5} />
            ) : '—'}
          </span>
          <span style={{ fontSize: '1rem', opacity: 0.7 }}>/ {max}</span>
        </div>

        {delta != null && (
          <p style={{
            fontSize: '0.8rem',
            margin: '6px 0 0 0',
            opacity: 0.9,
            color: isPositive ? '#A7F3D0' : '#FCA5A5',
          }}>
            {arrow} {isPositive ? '+' : ''}{delta.toFixed(2)} {deltaLabel}
          </p>
        )}
      </div>
    </div>
  );
}

