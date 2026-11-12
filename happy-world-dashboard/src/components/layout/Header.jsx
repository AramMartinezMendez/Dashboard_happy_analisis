
import { useTheme } from '../../context/ThemeContext';
import { useFilters } from '../../context/FilterContext';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { country, year, region } = useFilters();

  return (
    <header style={{
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--spacing-lg)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-card)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Bienestar y Cohesión Social
        </h2>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          {country} · {year} · {region}
        </p>
      </div>

      <button
        onClick={toggleTheme}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid var(--border-card)',
          background: 'var(--bg-body)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-body)',
        }}
        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
        {theme === 'light' ? 'Oscuro' : 'Claro'}
      </button>
    </header>
  );
}

