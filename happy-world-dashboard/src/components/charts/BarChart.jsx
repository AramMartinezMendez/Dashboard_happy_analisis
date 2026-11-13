
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function BarChartComponent({ data }) {
  if (!data) return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin datos</p>;

  const barData = [
    { name: 'Apoyo Social', value: Math.round((data.social_support || 0) * 100) },
    { name: 'Libertad', value: Math.round((data.freedom || 0) * 100) },
    { name: 'Confianza', value: Math.round((1 - (data.corruption_perception || 0)) * 100) },
    { name: 'Generosidad', value: Math.round((data.generosity || 0) * 100) },
  ];

  const getBarColor = (value) => {
    if (value >= 70) return 'var(--color-primary)';
    if (value >= 40) return 'var(--color-primary-dark)';
    return 'var(--color-secondary)';
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
        <XAxis
          type="number" domain={[0, 100]}
          tick={{ fill: 'var(--chart-axis)', fontSize: 10 }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category" dataKey="name"
          tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
          width={80}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-tooltip)', border: 'none',
            borderRadius: '8px', color: 'var(--text-tooltip)', fontSize: '0.8rem',
          }}
          formatter={(value) => [`${value}%`, 'Valor']}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
          {barData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

