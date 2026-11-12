
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, ReferenceDot
} from 'recharts';

export default function LineChartComponent({ data, currentYear }) {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin datos</p>;

  const chartData = data.map(d => ({
    year: d.year,
    score: d.happiness_score ?? d['Ladder score'] ?? null,
  })).filter(d => d.score != null);

  const currentPoint = chartData.find(d => d.year === currentYear);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis
          dataKey="year"
          tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
          tickLine={false}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
          tickLine={false}
          width={35}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-tooltip)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--text-tooltip)',
            fontSize: '0.8rem',
          }}
          formatter={(value) => [value.toFixed(3), 'Score']}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="score"
          stroke="none"
          fill="url(#scoreGradient)"
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'var(--color-primary)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        {currentPoint && (
          <ReferenceDot
            x={currentPoint.year}
            y={currentPoint.score}
            r={8}
            fill="var(--color-secondary)"
            stroke="var(--bg-card)"
            strokeWidth={3}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

