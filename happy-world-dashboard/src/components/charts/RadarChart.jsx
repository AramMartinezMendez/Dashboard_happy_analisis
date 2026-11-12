
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts';

export default function RadarChartComponent({ data }) {
  if (!data) return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin datos</p>;

  const radarData = [
    { dimension: 'Apoyo Social', value: (data.social_support || 0) * 100, fullMark: 100 },
    { dimension: 'Libertad', value: (data.freedom || 0) * 100, fullMark: 100 },
    { dimension: 'Generosidad', value: (data.generosity || 0) * 100, fullMark: 100 },
    { dimension: 'Confianza', value: (1 - (data.corruption_perception || 0)) * 100, fullMark: 100 },
    { dimension: 'Esperanza Vida', value: Math.min(((data.life_expectancy || 0) / 85) * 100, 100), fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="var(--chart-grid)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
        />
        <Radar
          name="Bienestar"
          dataKey="value"
          stroke="var(--color-primary)"
          fill="var(--color-primary)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-tooltip)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--text-tooltip)',
            fontSize: '0.8rem',
          }}
          formatter={(value) => [`${value.toFixed(1)}%`, 'Valor']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

