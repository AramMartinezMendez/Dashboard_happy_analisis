
import { createContext, useState, useContext, useMemo, useCallback } from 'react';

const FilterContext = createContext();

// ── Valores por defecto ──
const DEFAULTS = {
  country: 'Mexico',
  year: 2024,
  region: 'Latin America and Caribbean',
  // Filtros avanzados
  categories: ['Muy alto', 'Alto', 'Medio', 'Bajo', 'Muy bajo'],
  lifeExpRange: [39, 85],
  minCoverage: 5,
  topN: null, // null = todos
  advancedEnabled: false,
};

export function FilterProvider({ children }) {
  // ── Filtros Principales ──
  const [country, setCountry] = useState(DEFAULTS.country);
  const [year, setYear] = useState(DEFAULTS.year);
  const [region, setRegion] = useState(DEFAULTS.region);

  // ── Filtros Avanzados ──
  const [categories, setCategories] = useState(DEFAULTS.categories);
  const [lifeExpRange, setLifeExpRange] = useState(DEFAULTS.lifeExpRange);
  const [minCoverage, setMinCoverage] = useState(DEFAULTS.minCoverage);
  const [topN, setTopN] = useState(DEFAULTS.topN);
  const [advancedEnabled, setAdvancedEnabled] = useState(DEFAULTS.advancedEnabled);

  // ── 🔄 Botón: RESETEAR TODOS los filtros ──
  const resetAllFilters = useCallback(() => {
    setCountry(DEFAULTS.country);
    setYear(DEFAULTS.year);
    setRegion(DEFAULTS.region);
    setCategories(DEFAULTS.categories);
    setLifeExpRange(DEFAULTS.lifeExpRange);
    setMinCoverage(DEFAULTS.minCoverage);
    setTopN(DEFAULTS.topN);
    setAdvancedEnabled(DEFAULTS.advancedEnabled);
  }, []);

  // ── 🚫 Botón: DESACTIVAR filtros avanzados (sin borrar valores) ──
  const toggleAdvanced = useCallback(() => {
    setAdvancedEnabled(prev => !prev);
  }, []);

  // ── Estado compacto para pasar a los hooks de datos ──
  const filters = useMemo(() => ({
    country,
    year,
    region,
    categories: advancedEnabled ? categories : DEFAULTS.categories,
    lifeExpRange: advancedEnabled ? lifeExpRange : DEFAULTS.lifeExpRange,
    minCoverage: advancedEnabled ? minCoverage : DEFAULTS.minCoverage,
    topN: advancedEnabled ? topN : null,
  }), [country, year, region, categories, lifeExpRange, minCoverage, topN, advancedEnabled]);

  const value = {
    // Estado
    country, year, region,
    categories, lifeExpRange, minCoverage, topN,
    advancedEnabled,
    filters,
    // Setters principales
    setCountry, setYear, setRegion,
    // Setters avanzados
    setCategories, setLifeExpRange, setMinCoverage, setTopN,
    // Acciones de botones
    resetAllFilters,
    toggleAdvanced,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);
export default FilterContext;

