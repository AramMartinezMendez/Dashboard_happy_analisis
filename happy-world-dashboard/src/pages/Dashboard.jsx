
import { useHappinessData } from "../hooks/useHappinessData";
import { useFilters } from "../context/FilterContext";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import KPIPrimary from "../components/cards/KPIPrimary";
import KPICard from "../components/cards/KPICard";
import RadarChartComponent from "../components/charts/RadarChart";
import LineChartComponent from "../components/charts/LineChart";
import ScatterChartComponent from "../components/charts/ScatterChart";
import BarChartComponent from "../components/charts/BarChart";
import WorldMap from "../components/map/WorldMap";
import RegionalRanking from "../components/tables/RegionalRanking";

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border-card)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-card)",
  padding: "var(--spacing-lg)",
};
const cardTitle = {
  fontFamily: "var(--font-display)",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: "16px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

export default function Dashboard() {
  const {
    loading,
    error,
    kpis,
    countryData,
    countryTimeSeries,
    filteredData,
    regionalRanking,
    mapData,
  } = useHappinessData();
  const { country, year } = useFilters();

  /* ── DEBUG: muestra en consola qué llega ── */
  console.log("🖥️ Dashboard render:", {
    loading,
    error,
    hasKpis: !!kpis,
    hasCountryData: !!countryData,
    timeSeriesLen: countryTimeSeries?.length,
    filteredLen: filteredData?.length,
    regionalLen: regionalRanking?.length,
    mapLen: mapData?.length,
    country,
    year,
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          color: "var(--text-secondary)",
        }}
      >
        <p style={{ fontSize: "3rem" }}>🌍</p>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.2rem",
          }}
        >
          Cargando datos del World Happiness Report...
        </p>
        <p style={{ fontSize: "0.75rem", marginTop: "8px", opacity: 0.6 }}>
          Si tarda mas de 5 seg, abre F12 → Console para ver errores
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
          color: "var(--color-danger)",
        }}
      >
        <p style={{ fontSize: "3rem" }}>❌</p>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem" }}>
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-width)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />

        <main
          style={{
            padding: "var(--spacing-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-lg)",
            flex: 1,
          }}
        >
          {/* ═══ FILA 1: KPI CARDS ═══ */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "var(--spacing-lg)",
            }}
          >
            <KPIPrimary
              title="Indice de Felicidad"
              value={kpis?.happinessScore}
              max={10}
              delta={kpis?.happinessDelta}
              deltaLabel="vs. año anterior"
            />
            <KPICard
              title="Posicion Global"
              value={kpis?.ranking}
              suffix={" / " + (kpis?.totalCountries || "—")}
              delta={kpis?.rankingDelta}
              deltaLabel="posiciones"
              icon="🏆"
            />
            <KPICard
              title="Libertad de Eleccion"
              value={kpis?.freedomPct}
              suffix="%"
              delta={kpis?.freedomDelta}
              deltaLabel="pp vs. anterior"
              icon="🗽"
            />
          </section>

          {/* ═══ ZONA DE GRÁFICOS (BENTO GRID 3x3) ═══ */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gridTemplateRows: "auto auto auto", // 👈 Cambia 1fr 1fr por auto auto
              gap: "var(--spacing-lg)",
              alignItems: "stretch",
              gridTemplateAreas: `
                "radar   line    scatter"
                "bar     map     map"
                "ranking map     map"
              `,
            }}
          >
            {/* Fila 1: 3 gráficos superiores */}
            <div style={{ ...card, gridArea: "radar" }}>
              <h3 style={cardTitle}>Perfil de Bienestar</h3>
              <RadarChartComponent data={countryData} />
            </div>

            <div style={{ ...card, gridArea: "line" }}>
              <h3 style={cardTitle}>Evolucion de la Felicidad</h3>
              <LineChartComponent
                data={countryTimeSeries}
                currentYear={year}
              />
            </div>

            <div style={{ ...card, gridArea: "scatter" }}>
              <h3 style={cardTitle}>Prosperidad y Felicidad</h3>
              <ScatterChartComponent
                data={filteredData}
                highlightCountry={country}
              />
            </div>

            {/* Columna izquierda abajo: 2 bloques apilados */}
            <div style={{ ...card, gridArea: "bar" }}>
              <h3 style={cardTitle}>Factores de Cohesion</h3>
              <BarChartComponent data={countryData} />
            </div>

            <div
              style={{
                ...card,
                gridArea: "ranking",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 style={cardTitle}>Clasificación Regional</h3>
              {/* Contenedor compacto con scroll interno */}
              <div style={{ maxHeight: "210px", overflowY: "auto", paddingRight: "4px" }}>
                <RegionalRanking
                  data={regionalRanking}
                  currentCountry={country}
                />
              </div>
            </div>

            {/* Bloque grande 2x2 abajo a la derecha */}
            <div
              style={{
                ...card,
                gridArea: "map",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3 style={cardTitle}>Mapa Geografico del Bienestar</h3>
              <div style={{ flex: 1 }}>
                <WorldMap data={mapData} highlightCountry={country} />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

