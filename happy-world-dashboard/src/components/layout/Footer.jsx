
export default function Footer() {
  return (
    <footer style={{
      padding: 'var(--spacing-md) var(--spacing-lg)',
      textAlign: 'center',
      borderTop: '1px solid var(--border-card)',
      background: 'var(--bg-card)',
      fontSize: '0.75rem',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-body)',
    }}>
      <p>
        Datos simulados inspirados en el World Happiness Report 2015 — 2024 | 
        Universidad del Caribe · Cancún, Q. Roo · 
        Diego Murguía &amp; Aram Martínez · 2026
      </p>
    </footer>
  );
}

