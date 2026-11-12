
import { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { useFilters } from "../context/FilterContext";

// ── Helper: convierte cualquier valor raro a número o null ──
function toNum(val) {
  if (val === null || val === undefined || val === "" || val === "NA") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export function useHappinessData() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters } = useFilters();

  // ── CARGAR CSV ──
  // ⚠️ CAMBIA EL NOMBRE AQUÍ si tu archivo se llama diferente
  const CSV_PATH = "/data/happiness_.csv";


  useEffect(() => {
    console.log("🌍 Intentando cargar:", CSV_PATH);

    fetch(CSV_PATH)
      .then(res => {
        if (!res.ok) {
          throw new Error(
            "No se encontro el archivo. Verifica que exista: public" + CSV_PATH
          );
        }
        return res.text();
      })
      .then(text => {
        const results = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });

        console.log("📊 CSV parseado:", results.data.length, "filas");
        console.log("📊 Columnas:", Object.keys(results.data[0] || {}));

        // ═══════════════════════════════════════════
        // 🔧 FIX PRINCIPAL: Limpiar y unificar datos
        // ═══════════════════════════════════════════
        const cleaned = results.data.map(row => {
          // Fusionar happiness_score con Ladder score
          // Usar || en vez de ?? para atrapar "", NaN, null, undefined, 0
          const score = toNum(row.happiness_score) || toNum(row["Ladder score"]);

          return {
            ...row,
            happiness_score: score,
            // Asegurar que todos los números sean números reales
            gdp_per_capita: toNum(row.gdp_per_capita),
            social_support: toNum(row.social_support),
            life_expectancy: toNum(row.life_expectancy),
            freedom: toNum(row.freedom),
            generosity: toNum(row.generosity),
            corruption_perception: toNum(row.corruption_perception),
            ranking: toNum(row.ranking),
            year: toNum(row.year),
            // Recalcular categoría si falta (2024 la tiene vacía)
            happiness_category: row.happiness_category || getCategory(score),
          };
        }).filter(row => row.year != null && row.country);

        // Log de verificación
        const mx24 = cleaned.find(r => r.country === "Mexico" && r.year === 2024);
        console.log("🇲🇽 Mexico 2024:", mx24);
        console.log("✅ Total filas limpias:", cleaned.length);

        setRawData(cleaned);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ── Listas únicas para dropdowns ──
  const uniqueYears = useMemo(() =>
    [...new Set(rawData.map(r => r.year))].filter(Boolean).sort(),
    [rawData]
  );

  const uniqueRegions = useMemo(() =>
    [...new Set(rawData.map(r => r.region))].filter(Boolean).sort(),
    [rawData]
  );

  const uniqueCountries = useMemo(() => {
    let f = rawData;
    if (filters.region && filters.region !== "Todas") {
      f = rawData.filter(r => r.region === filters.region);
    }
    return [...new Set(f.map(r => r.country))].filter(Boolean).sort();
  }, [rawData, filters.region]);

  // ── Datos filtrados por año + región ──
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    return rawData.filter(row => {
      if (row.year !== filters.year) return false;
      if (filters.region && filters.region !== "Todas" && row.region !== filters.region) return false;
      if (filters.categories && row.happiness_category) {
        if (!filters.categories.includes(row.happiness_category)) return false;
      }
      if (filters.lifeExpRange && row.life_expectancy != null) {
        if (row.life_expectancy < filters.lifeExpRange[0] ||
            row.life_expectancy > filters.lifeExpRange[1]) return false;
      }
      if (filters.minCoverage && row.years_with_data && row.years_with_data < filters.minCoverage) return false;
      return true;
    }).sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
      .slice(0, filters.topN || Infinity);
  }, [rawData, filters]);

  // ── País seleccionado (año actual) ──
  const countryData = useMemo(() =>
    rawData.find(r => r.country === filters.country && r.year === filters.year) || null,
    [rawData, filters.country, filters.year]
  );

  // ── País seleccionado (año anterior, para deltas) ──
  const countryDataPrev = useMemo(() =>
    rawData.find(r => r.country === filters.country && r.year === filters.year - 1) || null,
    [rawData, filters.country, filters.year]
  );

  // ── Serie temporal del país (para gráfico de líneas) ──
  const countryTimeSeries = useMemo(() =>
    rawData
      .filter(r => r.country === filters.country && r.happiness_score != null)
      .sort((a, b) => a.year - b.year),
    [rawData, filters.country]
  );

  // ── Top regional (para tabla) ──
  const regionalRanking = useMemo(() =>
    rawData
      .filter(r => r.year === filters.year && r.region === filters.region && r.happiness_score != null)
      .sort((a, b) => b.happiness_score - a.happiness_score)
      .slice(0, 10),
    [rawData, filters.year, filters.region]
  );

  // ── Datos para mapa ──
  const mapData = useMemo(() =>
    rawData.filter(r => r.year === filters.year),
    [rawData, filters.year]
  );

  // ── KPIs calculados ──
  const kpis = useMemo(() => {
    if (!countryData || countryData.happiness_score == null) return null;
    const prev = countryDataPrev;
    const total = rawData.filter(r => r.year === filters.year).length;

    return {
      happinessScore: countryData.happiness_score,
      happinessDelta: prev && prev.happiness_score != null
        ? countryData.happiness_score - prev.happiness_score : null,
      ranking: countryData.ranking,
      totalCountries: total,
      rankingDelta: prev && prev.ranking != null
        ? prev.ranking - countryData.ranking : null,
      freedomPct: countryData.freedom != null
        ? Math.round(countryData.freedom * 100) : null,
      freedomDelta: prev && prev.freedom != null && countryData.freedom != null
        ? Math.round((countryData.freedom - prev.freedom) * 100) : null,
    };
  }, [countryData, countryDataPrev, rawData, filters.year]);

  return {
    loading, error, rawData, filteredData, countryData,
    countryTimeSeries, regionalRanking, mapData, kpis,
    uniqueYears, uniqueRegions, uniqueCountries,
  };
}

// ── Función auxiliar: calcular categoría desde score ──
function getCategory(score) {
  if (score == null) return null;
  if (score >= 7) return "Muy alto";
  if (score >= 6) return "Alto";
  if (score >= 5) return "Medio";
  if (score >= 4) return "Bajo";
  return "Muy bajo";
}

