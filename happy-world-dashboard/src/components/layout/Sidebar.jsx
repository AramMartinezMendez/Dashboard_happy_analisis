
// ═══════════════════════════════════════════
// src/components/layout/Sidebar.jsx
// ═══════════════════════════════════════════
import { useFilters } from '../../context/FilterContext';
import { useHappinessData } from '../../hooks/useHappinessData';
import { FiRotateCcw, FiSliders, FiGlobe, FiCalendar, FiMapPin } from 'react-icons/fi';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const {
    country, setCountry,
    year, setYear,
    region, setRegion,
    categories, setCategories,
    lifeExpRange, setLifeExpRange,
    minCoverage, setMinCoverage,
    topN, setTopN,
    advancedEnabled,
    resetAllFilters,
    toggleAdvanced,
  } = useFilters();

  const { uniqueYears, uniqueRegions, uniqueCountries } = useHappinessData();

  const allCategories = ['Muy alto', 'Alto', 'Medio', 'Bajo', 'Muy bajo'];

  const handleCategoryToggle = (cat) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  return (
    <aside className={styles.sidebar}>
      {/* ── Logo ── */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🌍</span>
        <div>
          <h1 className={styles.logoTitle}>Happy World</h1>
          <span className={styles.logoSubtitle}>:D</span>
        </div>
      </div>

      {/* ── FILTROS PRINCIPALES ── */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <FiGlobe /> Filtros
        </h3>

        {/* País */}
        <label className={styles.label}>País</label>
        <select
          className={styles.select}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          {uniqueCountries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Año */}
        <label className={styles.label}>
          <FiCalendar /> Año
        </label>
        <select
          className={styles.select}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {uniqueYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Región */}
        <label className={styles.label}>
          <FiMapPin /> Región
        </label>
        <select
          className={styles.select}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="Todas">🌍 Todas las regiones</option>
          {uniqueRegions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* ── FILTROS AVANZADOS ── */}
      <div className={styles.section}>
        <div className={styles.advancedHeader}>
          <h3 className={styles.sectionTitle}>
            <FiSliders /> Avanzados
          </h3>
          <button
            className={`${styles.toggleBtn} ${advancedEnabled ? styles.active : ''}`}
            onClick={toggleAdvanced}
            title={advancedEnabled ? 'Desactivar filtros avanzados' : 'Activar filtros avanzados'}
          >
            {advancedEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {advancedEnabled && (
          <div className={styles.advancedBody}>
            {/* Categoría de Felicidad — Chips */}
            <label className={styles.label}>Categoría</label>
            <div className={styles.chips}>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.chip} ${categories.includes(cat) ? styles.chipActive : ''}`}
                  onClick={() => handleCategoryToggle(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Esperanza de Vida — Range Slider */}
            <label className={styles.label}>
              Esperanza de Vida: {lifeExpRange[0]} — {lifeExpRange[1]} años
            </label>
            <div className={styles.rangeGroup}>
              <input
                type="range" min={39} max={85}
                value={lifeExpRange[0]}
                onChange={(e) => setLifeExpRange([Number(e.target.value), lifeExpRange[1]])}
                className={styles.rangeInput}
              />
              <input
                type="range" min={39} max={85}
                value={lifeExpRange[1]}
                onChange={(e) => setLifeExpRange([lifeExpRange[0], Number(e.target.value)])}
                className={styles.rangeInput}
              />
            </div>

            {/* Cobertura Temporal */}
            <label className={styles.label}>
              Cobertura mínima: ≥{minCoverage} años
            </label>
            <input
              type="range" min={1} max={10}
              value={minCoverage}
              onChange={(e) => setMinCoverage(Number(e.target.value))}
              className={styles.rangeInput}
            />

            {/* Top N */}
            <label className={styles.label}>
              Mostrar: {topN ? `Top ${topN}` : 'Todos'}
            </label>
            <select
              className={styles.select}
              value={topN || 'all'}
              onChange={(e) => setTopN(e.target.value === 'all' ? null : Number(e.target.value))}
            >
              <option value="all">Todos los países</option>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="50">Top 50</option>
            </select>
          </div>
        )}
      </div>

      {/* ── BOTONES DE ACCIÓN ── */}
      <div className={styles.actions}>
        {/* 🔄 Resetear TODOS */}
        <button className={styles.resetBtn} onClick={resetAllFilters}>
          <FiRotateCcw />
          Resetear Filtros
        </button>

        {/* 🚫 Toggle avanzados */}
        <button
          className={`${styles.deactivateBtn} ${advancedEnabled ? styles.deactivateActive : ''}`}
          onClick={toggleAdvanced}
        >
          <FiSliders />
          {advancedEnabled ? 'Desactivar Avanzados' : 'Activar Avanzados'}
        </button>
      </div>

      {/* ── Footer del Sidebar ── */}
      <div className={styles.sidebarFooter}>
        <p>Datos simulados</p>
        <p>WHR 2015 — 2024</p>
      </div>
    </aside>
  );
}

