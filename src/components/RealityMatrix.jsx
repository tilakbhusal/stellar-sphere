import React from 'react';

export default function RealityMatrix() {
  const points = [
    { label: 'Ireland', x: 121, y: 23.0, r: 15, color: 'rgba(255, 99, 132, 0.8)' },
    { label: 'Singapore', x: 99, y: 19.5, r: 18, color: 'rgba(255, 159, 64, 0.8)' },
    { label: 'Netherlands', x: 298, y: 9.7, r: 25, color: 'rgba(75, 192, 192, 0.8)' },
    { label: 'Germany', x: 529, y: 6.1, r: 35, color: 'rgba(54, 162, 235, 0.8)' },
    { label: 'United States', x: 5427, y: 6.0, r: 60, color: 'rgba(153, 102, 255, 0.8)' },
    { label: 'Nepal (Theoretical Limit)', x: 18, y: 100.0, r: 12, color: 'rgba(220, 53, 69, 1)' }
  ];

  const width = 600;
  const height = 350;
  const padding = 50;
  const maxLogX = Math.log10(6000);

  return (
    <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', margin: '32px 0', border: '1px solid #e9ecef', overflowX: 'auto' }}>
      <h4 style={{ marginTop: 0, color: '#343a40', fontFamily: 'sans-serif' }}>Interactive: Reality Check Matrix</h4>
      <div style={{ minWidth: '500px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#fff', borderRadius: '4px', border: '1px solid #dee2e6' }}>
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e9ecef" strokeWidth="2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e9ecef" strokeWidth="2" />
          
          <text x={width / 2} y={height - 10} fontSize="12" textAnchor="middle" fill="#6c757d" fontFamily="sans-serif">Total Data Centers (Log Scale)</text>
          <text x={15} y={height / 2} fontSize="12" textAnchor="middle" fill="#6c757d" fontFamily="sans-serif" transform={`rotate(-90 15 ${height / 2})`}>% of National Electricity Consumed</text>

          {points.map((pt, i) => {
            const cx = padding + (Math.log10(pt.x) / maxLogX) * (width - 2 * padding);
            const cy = height - padding - (pt.y / 100) * (height - 2 * padding);
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={pt.r} fill={pt.color}>
                  <title>{`${pt.label}:\n${pt.x} facilities\nConsumes ${pt.y}% of national grid`}</title>
                </circle>
                <text x={cx} y={cy - pt.r - 8} fontSize="11" textAnchor="middle" fill="#495057" fontFamily="sans-serif" fontWeight="bold">{pt.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
