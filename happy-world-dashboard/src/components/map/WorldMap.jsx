import { useState, useEffect, useMemo, useRef } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COUNTRY_NAME_MAP = {
  'United States': 'United States of America',
  'Russia': 'Russian Federation',
  'South Korea': 'Korea',
  'Czech Republic': 'Czechia',
  'Taiwan Province of China': 'Taiwan',
  'Congo (Brazzaville)': 'Congo',
  'Congo (Kinshasa)': 'Dem. Rep. Congo',
  'Ivory Coast': "Côte d'Ivoire",
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Dominican Republic': 'Dominican Rep.',
};

const REVERSE_NAME_MAP = Object.fromEntries(
  Object.entries(COUNTRY_NAME_MAP).map(([datasetName, mapName]) => [mapName, datasetName])
);

const getColor = (score) => {
  if (score == null) return 'var(--border-card)'; // Se adapta a claro/oscuro sin datos
  if (score >= 7) return '#0D5C4B';
  if (score >= 6) return '#2D8B7A';
  if (score >= 5) return '#6BC4B0';
  if (score >= 4) return '#B0DED3';
  return '#DCF0EB';
};

export default function WorldMap({ data = [], highlightCountry, onSelectCountry }) {
  const [geographies, setGeographies] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, content: '', x: 0, y: 0 });

  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((topology) => {
        const countries = feature(topology, topology.objects.countries).features;
        setGeographies(countries.filter((d) => d.properties.name !== 'Antarctica'));
      });
  }, []);

  const scoreMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      const score = d.happiness_score ?? d['Ladder score'];
      if (score != null && d.country) {
        const rawName = d.country.trim();
        const mappedName = COUNTRY_NAME_MAP[rawName] || rawName;
        map[mappedName] = { score: Number(score), originalName: rawName };
      }
    });
    return map;
  }, [data]);

  const pathGenerator = useMemo(() => {
    const projection = geoNaturalEarth1().scale(155).translate([400, 210]);
    return geoPath().projection(projection);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip((prev) => ({
      ...prev,
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top + 12,
    }));

    if (!isDragging) return;
    hasDraggedRef.current = true;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    }));
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const handleZoomIn = () => setTransform((t) => ({ ...t, k: Math.min(t.k * 1.4, 5) }));
  const handleZoomOut = () => {
    setTransform((t) => {
      const newK = Math.max(t.k / 1.4, 1);
      return newK === 1 ? { k: 1, x: 0, y: 0 } : { ...t, k: newK };
    });
  };
  const handleReset = () => setTransform({ k: 1, x: 0, y: 0 });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '380px',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {/* Tooltip */}
      {tooltip.show && !isDragging && (
        <div
          style={{
            position: 'absolute',
            top: tooltip.y,
            left: tooltip.x,
            zIndex: 5,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-card)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-card)',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Controles de Zoom */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button onClick={handleZoomIn} style={btnStyle} title="Acercar">+</button>
        <button onClick={handleZoomOut} style={btnStyle} title="Alejar">−</button>
        <button onClick={handleReset} style={{ ...btnStyle, fontSize: '0.75rem' }} title="Centrar">⟲</button>
      </div>

      {/* Leyenda */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          zIndex: 4,
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '0.7rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid var(--border-card)',
          pointerEvents: 'none',
        }}
      >
        <span>Bajo</span>
        {['#DCF0EB', '#B0DED3', '#6BC4B0', '#2D8B7A', '#0D5C4B'].map((color) => (
          <span
            key={color}
            style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2, display: 'inline-block' }}
          />
        ))}
        <span>Alto</span>
      </div>

      {/* Mapa SVG */}
      <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', display: 'block' }}>
        <g
          transform={`translate(${400 * (1 - transform.k) + transform.x}, ${200 * (1 - transform.k) + transform.y}) scale(${transform.k})`}
        >
          {geographies.map((geo, idx) => {
            const mapName = geo.properties.name;
            const entry = scoreMap[mapName];
            const score = entry?.score;
            const datasetName = entry?.originalName || REVERSE_NAME_MAP[mapName] || mapName;

            const isHighlighted =
              mapName === (COUNTRY_NAME_MAP[highlightCountry] || highlightCountry);
            const isHovered = hoveredCountry === mapName;

            let fillColor = getColor(score);
            if (isHighlighted) fillColor = 'var(--color-secondary, #F59E0B)';
            if (isHovered) fillColor = 'var(--color-primary, #10B981)';

            return (
              <path
                key={geo.id || idx}
                d={pathGenerator(geo)}
                fill={fillColor}
                stroke="var(--bg-card)"
                strokeWidth={0.6 / transform.k}
                style={{ cursor: isDragging ? 'grabbing' : 'pointer', transition: 'fill 0.15s ease' }}
                onClick={() => {
                  if (!hasDraggedRef.current && onSelectCountry) {
                    onSelectCountry(datasetName, score);
                  }
                }}
                onMouseEnter={() => {
                  setHoveredCountry(mapName);
                  setTooltip((prev) => ({
                    ...prev,
                    show: true,
                    content:
                      score != null
                        ? `${datasetName}: ${score.toFixed(2)}`
                        : `${datasetName} (Sin datos)`,
                  }));
                }}
                onMouseLeave={() => {
                  setHoveredCountry(null);
                  setTooltip((prev) => ({ ...prev, show: false }));
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

const btnStyle = {
  width: '28px',
  height: '28px',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};