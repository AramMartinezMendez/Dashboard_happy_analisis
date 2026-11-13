
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis
} from 'recharts';

export default function ScatterChartComponent({ data, highlightCountry }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin datos</p>;

  const general = data
    .filter(d => d.country !== highlightCountry && d.happiness_score != null)
    .map(d => ({
      x: d.gdp_per_capita,
      y: d.happiness_score ?? d['Ladder score'],
      country: d.country,
    }));

  const highlighted = data
    .filter(d => d.country === highlightCountry)
    .map(d => ({
      x: d.gdp_per_capita,
      y: d.happiness_score ?? d['Ladder score'],
      country: d.country,
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{
          background: 'var(--bg-tooltip)', padding: '8px 12px',
          borderRadius: '8px', color: 'var(--text-tooltip)', fontSize: '0.75rem',
        }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{d.country}</p>
          <p style={{ margin: 0 }}>GDP: {d.x?.toFixed(2)}</p>
          <p style={{ margin: 0 }}>Felicidad: {d.y?.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis
          type="number" dataKey="x" name="GDP"
          tick={{ fill: 'var(--chart-axis)', fontSize: 10 }}
          label={{ value: 'GDP per cápita', position: 'insideBottom', offset: -3, fill: 'var(--chart-axis)', fontSize: 10 }}
        />
        <YAxis
          type="number" dataKey="y" name="Felicidad"
          tick={{ fill: 'var(--chart-axis)', fontSize: 10 }}
          width={35}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter name="Países" data={general} fill="var(--color-primary)" opacity={0.6} />
        <Scatter name="Seleccionado" data={highlighted} fill="var(--color-secondary)" opacity={1} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

