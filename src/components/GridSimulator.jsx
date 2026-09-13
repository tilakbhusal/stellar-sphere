import React, { useState } from 'react';

export default function GridSimulator() {
  const [numDCs, setNumDCs] = useState(1);
  const nepalTotalGrid = 15641; 
  const hyperscaleUsage = 876;
  
  const totalEnergy = numDCs * hyperscaleUsage;
  const percentage = ((totalEnergy / nepalTotalGrid) * 100).toFixed(1);
  const barWidth = Math.min(percentage, 100);

  return (
    <div style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', margin: '32px 0', border: '1px solid #e9ecef' }}>
      <h4 style={{ marginTop: 0, color: '#343a40', fontFamily: 'sans-serif' }}>Interactive: Grid Load Simulator</h4>
      <p style={{ fontFamily: 'sans-serif', color: '#495057', fontSize: '14px' }}>Adjust the slider to simulate adding 100 MW Hyperscale Data Centers to Nepal's grid.</p>
      
      <input type="range" min="1" max="18" value={numDCs} onChange={(e) => setNumDCs(e.target.value)} style={{ width: '100%', margin: '16px 0', cursor: 'pointer' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'sans-serif', marginBottom: '8px' }}>
        <strong>Hyperscale Facilities Active: <span style={{ color: '#007bff' }}>{numDCs}</span></strong>
        <strong>{percentage}% of Grid Reached</strong>
      </div>

      <div style={{ height: '24px', background: '#e9ecef', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ width: `${barWidth}%`, background: percentage > 90 ? '#dc3545' : '#20c997', height: '100%', transition: 'width 0.3s ease, background 0.3s ease' }} />
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontFamily: 'sans-serif' }}>
        <div style={{ flex: 1, background: '#fff', padding: '16px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '20px', display: 'block', color: '#dc3545', fontWeight: 'bold' }}>{totalEnergy.toLocaleString()} GWh / yr</span>
          <span style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase' }}>Energy Consumed</span>
        </div>
        <div style={{ flex: 1, background: '#fff', padding: '16px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '20px', display: 'block', color: '#fd7e14', fontWeight: 'bold' }}>{(numDCs * 364000).toLocaleString()}</span>
          <span style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase' }}>Equivalent Households</span>
        </div>
      </div>
    </div>
  );
}
