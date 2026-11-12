
export default function RegionalRanking({ data, currentCountry }) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Sin datos regionales</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.8rem',
        fontFamily: 'var(--font-body)',
      }}>
        <thead>
          <tr>
            <th style={thStyle}>#</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>País</th>
            <th style={thStyle}>Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const isSelected = row.country === currentCountry;
            return (
              <tr
                key={row.country}
                style={{
                  background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <td style={tdStyle}>{idx + 1}</td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>
                  {isSelected && '● '}{row.country}
                </td>
                <td style={tdStyle}>
                  {(row.happiness_score ?? row['Ladder score'])?.toFixed(3) ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '8px 6px',
  textAlign: 'center',
  borderBottom: '2px solid var(--border-card)',
  color: 'var(--text-secondary)',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tdStyle = {
  padding: '8px 6px',
  textAlign: 'center',
  borderBottom: '1px solid var(--border-card)',
  color: 'var(--text-primary)',
};

