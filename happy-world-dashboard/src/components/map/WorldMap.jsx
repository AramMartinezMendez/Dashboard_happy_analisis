
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useState } from 'react';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const getColor = (score) => {
  if (score == null) return 'var(--map-land)';
  if (score >= 7) return '#0D5C4B';
  if (score >= 6) return '#2D8B7A';
  if (score >= 5) return '#6BC4B0';
  if (score >= 4) return '#B0DED3';
  return '#DCF0EB';
};

export default function WorldMap({ data, highlightCountry }) {
  const [tooltip, setTooltip] = useState('');

  const scoreMap = {};
  if (data) {
    data.forEach(d => {
      const score = d.happiness_score ?? d['Ladder score'];
      if (score != null) scoreMap[d.country] = score;
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      {tooltip && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 10,
          background: 'var(--bg-tooltip)', color: 'var(--text-tooltip)',
          padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem',
          pointerEvents: 'none',
        }}>
          {tooltip}
        </div>
      )}
      <ComposableMap
        projectionConfig={{ scale: 140, center: [0, 20] }}
        style={{ width: '100%', height: '300px' }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name;
                const score = scoreMap[name];
                const isHighlighted = name === highlightCountry;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setTooltip(score != null ? `${name}: ${score.toFixed(2)}` : name);
                    }}
                    onMouseLeave={() => setTooltip('')}
                    style={{
                      default: {
                        fill: isHighlighted ? 'var(--color-secondary)' : getColor(score),
                        stroke: 'var(--map-border)',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: isHighlighted ? 'var(--color-secondary)' : 'var(--map-hover)',
                        stroke: 'var(--color-primary)',
                        strokeWidth: 1,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

