import React from 'react';

export default function KPIPrimary({ title, value, max, delta, deltaLabel }) {
  const isPositive = delta > 0;
  const arrow = isPositive ? '▲' : delta < 0 ? '▼' : '●';

  return (
    <div style={{
      background: 'var(--kpi-primary-bg)',
      borderRadius: 'var(--radius-md)',
      padding: '14px var(--spacing-lg)', // Menos relleno arriba y abajo
      color: 'var(--kpi-primary-text)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: '6px', // Espacio controlado entre título y número
    }}>
      <p style={{
        fontSize: '0.75rem',
        opacity: 0.85,
        margin: 0,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title}
      </p>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {/* Número principal + máximo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '1.9rem', // Bajado de 2.5rem para reducir altura
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            lineHeight: 1,
          }}>
            {value != null ? Number(value).toFixed(2) : '—'}
          </span>
          <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>/ {max}</span>
        </div>

        {/* Delta alineado a la derecha del número para ahorrar una línea de altura */}
        {delta != null && (
          <span style={{
            fontSize: '0.78rem',
            opacity: 0.95,
            fontWeight: 500,
            color: isPositive ? '#A7F3D0' : '#FCA5A5',
          }}>
            {arrow} {isPositive ? '+' : ''}{Number(delta).toFixed(2)} {deltaLabel}
          </span>
        )}
      </div>
    </div>
  );
}