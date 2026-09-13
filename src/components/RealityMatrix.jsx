import React from 'react';

export default function RealityMatrix() {
  // Added custom label offsets (labelOffsetX, labelOffsetY) to prevent text collision
  const points = [
    { label: 'Ireland', x: 121, y: 23.0, r: 16, color: 'rgba(255, 99, 132, 0.85)', labelOffsetX: 0, labelOffsetY: -22 },
    { label: 'Singapore', x: 99, y: 19.5, r: 15, color: 'rgba(255, 159, 64, 0.85)', labelOffsetX: -35, labelOffsetY: 25 }, // Moved down and left
    { label: 'Netherlands', x: 298, y: 9.7, r: 20, color: 'rgba(75, 192, 192, 0.85)', labelOffsetX: -15, labelOffsetY: -26 },
    { label: 'Germany', x: 529, y: 6.1, r: 25, color: 'rgba(54, 162, 235, 0.85)', labelOffsetX: 25, labelOffsetY: -32 },
    { label: 'United States', x: 5427, y: 6.0, r: 45, color: 'rgba(153, 102, 255, 0.85)', labelOffsetX: 0, labelOffsetY: -52 },
    { label: 'Nepal (Theoretical Limit)', x: 18, y: 100.0, r: 12, color: 'rgba(220, 53, 69, 1)', labelOffsetX: 0, labelOffsetY: -20 }
  ];

  const width = 700;
  const height = 400;
  // Increased padding to give the large bubbles room to breathe
  const paddingX = 70; 
  const paddingY = 60;
  
  // Extended the max X slightly so the US bubble doesn't touch the right edge
  const maxLogX = Math.log10(8000); 
  // Extended the max Y slightly so the Nepal bubble doesn't touch the top
  const maxY = 110; 

  return (
    // Removed all hardcoded background colors and borders. It will now inherit your site's green theme natively.
    <div style={{ margin: '40px 0', overflowX: 'auto' }}>
      <h4 style={{ marginTop: 0, fontFamily: 'inherit', color: 'currentColor', opacity: 0.9 }}>
        Interactive: Reality Check Matrix
      </h4>
      <p style={{ fontFamily: 'inherit', color: 'currentColor', opacity: 0.75, fontSize: '14px', marginBottom: '24px' }}>
        Comparing established global data center hubs against Nepal's maximum theoretical limit.
      </p>
      
      <div style={{ minWidth: '550px' }}>
        {/* Set overflow to visible to ensure large bubbles aren't clipped */}
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          
          {/* Axis lines - using a translucent black so it blends dynamically with your green background */}
          <line x1={paddingX} y1={paddingY - 20} x2={paddingX} y2={height - paddingY} stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX + 20} y2={height - paddingY} stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
          
          {/* Axis Labels - changed fill to currentColor to match your site's typography color */}
          <text x={width / 2} y={height - 15} fontSize="13" textAnchor="middle" fill="currentColor" opacity="0.6" fontFamily="inherit">
            Total Data Centers (Log Scale)
          </text>
          <text x={20} y={height / 2} fontSize="13" textAnchor="middle" fill="currentColor" opacity="0.6" fontFamily="inherit" transform={`rotate(-90 20 ${height / 2})`}>
            % of National Electricity Consumed
          </text>

          {/* Render Points */}
          {points.map((pt, i) => {
            const cx = paddingX + (Math.log10(pt.x) / maxLogX) * (width - 2 * paddingX);
            const cy = height - paddingY - (pt.y / maxY) * (height - 2 * paddingY);
            
            return (
              <g key={i}>
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={pt.r} 
                  fill={pt.color} 
                  stroke="rgba(255,255,255,0.3)" // Added a subtle white stroke to make overlapping bubbles distinct
                  strokeWidth="1.5"
                >
                  <title>{`${pt.label}:\n${pt.x} facilities\nConsumes ${pt.y}% of national grid`}</title>
                </circle>
                
                {/* Text labels now utilize the custom offsets and inherit font properties */}
                <text 
                  x={cx + pt.labelOffsetX} 
                  y={cy + pt.labelOffsetY} 
                  fontSize="12" 
                  textAnchor="middle" 
                  fill="currentColor" 
                  opacity="0.85" 
                  fontFamily="inherit" 
                  fontWeight="600"
                  style={{ pointerEvents: 'none' }} // Prevents text from interfering with circle hover tooltips
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
