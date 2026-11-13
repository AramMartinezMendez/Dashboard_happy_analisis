import React from 'react';

export default function KPICard({ title, value, suffix, delta, deltaLabel, icon }) {
  const isPositive = delta > 0;
  const arrow = isPositive ? '▲' : delta < 0 ? '▼' : '●';

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      padding: '14px var(--spacing-lg)', // Mismo relleno vertical que KPIPrimary
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '6px',
    }}>
      {/* Fila superior: Título + Ícono */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          margin: 0,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {title}
        </p>
        {icon && <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{icon}</span>}
      </div>

      {/* Fila inferior: Valor + Delta alineados */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '1.9rem', // Mismo tamaño que KPIPrimary
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {value != null ? value : '—'}
          </span>
          {suffix && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {suffix}
            </span>
          )}
        </div>

        {delta != null && (
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 500,
            color: isPositive ? 'var(--color-success)' : 'var(--color-danger)',
          }}>
            {arrow} {isPositive ? '+' : ''}{delta} {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}