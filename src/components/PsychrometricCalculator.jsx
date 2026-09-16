import React, {useEffect, useMemo, useRef, useState} from 'react';
import {calculate, keys, saturation, humidityRatio, wetBulbRatio, pressureFromAltitude, toDisplay, fromDisplay, unit, inverseSaturation} from '../lib/psychrometrics.js';
import '../styles/psychrometrics.css';

const labels={Tdb:'Dry-bulb temperature',Twb:'Wet-bulb temperature',Tdp:'Dew-point temperature',RH:'Relative humidity',W:'Humidity ratio',SH:'Specific humidity',Pv:'Vapor pressure',Pws:'Saturation pressure',h:'Enthalpy'};
const modes=[['tdb','Dry-bulb only','Tdb'],['rh','Dry-bulb + RH','Tdb + RH'],['wet','Dry-bulb + Wet-bulb','Tdb + Twb'],['h','Enthalpy only','h'],['w','Humidity ratio only','W'],['custom','Any known inputs','Universal solver']];
const initial={Tdb:25,RH:50};
const format=(v,d=3)=>v===null?'Not defined':Number(v).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});

function Chart({state,p,ip,onSelect}) {
  const svg=useRef(null), dragging=useRef(false);
  const [extra,setExtra]=useState(false);
  const [hint,setHint]=useState('Click the chart or drag the state point. Arrow keys move the focused point.');
  const geometry=useMemo(()=>{
    const min=Math.max(-100,Math.min(-10,Math.floor((state?.Tdb??25)/10)*10-10));
    const max=Math.min(Math.max(50,Math.ceil((state?.Tdb??25)/10)*10+10),inverseSaturation(p*.999999));
    const top=Math.max(.015,humidityRatio(saturation(Math.min(30,max)),p)*1.3,(state?.W??0)*1.25);
    return {min,max,top};
  },[p,state?.Tdb,state?.W]);
  // Hold axes during dragging so the point does not chase a moving scale.
  const fixed=useRef(null), g=dragging.current&&fixed.current?fixed.current:geometry;
  const x=t=>64+(t-g.min)/(g.max-g.min)*790, y=w=>435-w/g.top*380;
  const path=fn=>{
    let result='',pen=false;
    for(let i=0;i<=320;i++) {
      const t=g.min+(g.max-g.min)*i/320;
      try {const w=fn(t), ws=humidityRatio(saturation(t),p);
        if(!Number.isFinite(w)||w<0||w>g.top||w>ws+1e-10){pen=false;continue;}
        result+=`${pen?'L':'M'}${x(t).toFixed(2)},${y(w).toFixed(2)} `;pen=true;
      } catch {pen=false;}
    }
    return result;
  };
  const choose=(t,w)=>{
    t=Math.max(g.min,Math.min(g.max,t));
    const limit=humidityRatio(saturation(t),p);
    const clipped=Math.max(0,Math.min(w,limit,g.top));
    setHint(w>limit?'Above saturation: point moved to the 100% RH boundary.':'State updated from chart coordinates.');
    onSelect({Tdb:t,W:clipped});
  };
  const pointer=e=>{
    const point=svg.current.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
    const local=point.matrixTransform(svg.current.getScreenCTM().inverse());
    if(!dragging.current&&(local.x<64||local.x>854||local.y<55||local.y>435))return;
    choose(g.min+(local.x-64)/790*(g.max-g.min),(435-local.y)/380*g.top);
  };
  return <section className="psy-panel psy-chart-panel" aria-label="Interactive psychrometric chart">
    <div className="psy-panel-heading"><div><span className="psy-eyebrow">02 / EXPLORE THE AIR STATE</span><h2>Psychrometric chart</h2></div><label className="psy-check"><input type="checkbox" checked={extra} onChange={e=>setExtra(e.target.checked)}/> h & wet-bulb lines</label></div>
    <div className="psy-legend"><span className="red">│ Dry-bulb</span><span className="green">─ Humidity ratio</span><span className="blue">⌒ Relative humidity</span><span className="gold">● Your state</span></div>
    <svg ref={svg} viewBox="0 0 960 505" className="psy-chart" aria-label="Dry-bulb temperature versus humidity ratio" onPointerDown={e=>{fixed.current=geometry;dragging.current=true;e.currentTarget.setPointerCapture(e.pointerId);pointer(e);}} onPointerMove={e=>{if(dragging.current)pointer(e);}} onPointerUp={()=>{dragging.current=false;}} onPointerCancel={()=>{dragging.current=false;}}>
      <defs><pattern id="psy-fine" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M 16 0 L 0 0 0 16" fill="none" stroke="#5484a0" strokeOpacity=".12" strokeWidth=".5"/></pattern><clipPath id="psy-clip"><rect x="64" y="55" width="790" height="380"/></clipPath></defs>
      <rect x="64" y="55" width="790" height="380" fill="url(#psy-fine)"/>
      {Array.from({length:9},(_,i)=>{const t=g.min+(g.max-g.min)*i/8;return <g key={i}><path d={`M${x(t)} 435V${Math.max(55,y(humidityRatio(saturation(t),p)))}`} stroke="#ef777a" strokeOpacity=".36"/><text x={x(t)} y="456" textAnchor="middle">{format(toDisplay('Tdb',t,ip),0)}</text></g>;})}
      {Array.from({length:9},(_,i)=>{const w=g.top*i/8;return <g key={i}><path d={path(()=>w)} stroke="#43dbb0" strokeOpacity=".4"/><text x="870" y={y(w)+4}>{format(toDisplay('W',w,ip),ip?0:4)}</text></g>;})}
      <g clipPath="url(#psy-clip)">
        {Array.from({length:10},(_,i)=>{const rh=(i+1)/10;const t=Math.min(g.max-2,inverseSaturation(p*(g.top*(i%2?.8:.93))/(.621945+g.top*(i%2?.8:.93))/rh));const w=humidityRatio(saturation(t)*rh,p);return <g key={rh}><path className="psy-rh-curve" d={path(t=>humidityRatio(saturation(t)*rh,p))} stroke={i===9?'#b4e5ff':'#4aafff'} strokeWidth={i===9?2.4:1.2} fill="none"/><text x={x(t)-5} y={y(w)-6} fill="#a1d8ff" textAnchor="end">{(i+1)*10}%</text></g>;})}
        {extra&&Array.from({length:15},(_,i)=><path key={`h${i}`} d={path(t=>(i*20-1.006*t)/(2501+1.86*t))} stroke="#cda1ff" strokeOpacity=".45" strokeDasharray="4 5" fill="none"/>)}
        {extra&&Array.from({length:10},(_,i)=><path key={`tw${i}`} d={path(t=>t>=i*5?wetBulbRatio(t,i*5,p):NaN)} stroke="#ffe4a0" strokeOpacity=".4" strokeDasharray="2 6" fill="none"/>)}
        {state&&<g><path d={`M64 ${y(state.W)}H${x(state.Tdb)}V435`} stroke="#ffd17d" fill="none" strokeDasharray="4 5" strokeOpacity=".7"/><circle cx={x(state.Tdb)} cy={y(state.W)} r="15" fill="#ffd17d" fillOpacity=".12"/><circle role="slider" aria-label="Air state: arrow keys change dry-bulb and humidity ratio" aria-valuemin={g.min} aria-valuemax={g.max} aria-valuenow={state.Tdb} aria-valuetext={`${format(toDisplay('Tdb',state.Tdb,ip),1)} ${unit('Tdb',ip)}, ${format(state.RH,1)}% RH`} tabIndex="0" cx={x(state.Tdb)} cy={y(state.W)} r="7" fill="#ffd17d" stroke="#fff4d9" strokeWidth="2" onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();choose(state.Tdb+(e.key==='ArrowRight'?.5:e.key==='ArrowLeft'?-.5:0),state.W+(e.key==='ArrowUp'?.0002:e.key==='ArrowDown'?-.0002:0));}}}/></g>}
      </g>
      <path d="M64 55V435H854V55" stroke="#bdcede" fill="none"/>
      <text x="460" y="491" textAnchor="middle">DRY-BULB TEMPERATURE / {unit('Tdb',ip)}</text><text x="854" y="30" textAnchor="end">HUMIDITY RATIO / {unit('W',ip)}</text>
      <text x="77" y="78" className="psy-chart-stamp">ASHRAE · {format(toDisplay('P',p,ip),3)} {unit('P',ip)}</text>
    </svg>
    <p className="psy-chart-hint">{hint}</p>{extra&&<p className="psy-chart-hint">Purple dashed: enthalpy, 20 kJ/kg intervals. Gold dotted: wet-bulb, 5 °C intervals.</p>}
  </section>;
}

const lessons=[
  ['Tdb','What a regular thermometer reads. It tells you how hot the air is, without directly measuring its moisture. Think of the temperature on a weather app.','Tdb = (h − 2501W) / (1.006 + 1.86W)'],
  ['Twb','The temperature a wetted thermometer approaches as water evaporates. Like sweat cooling your skin, evaporation lowers the reading. Drier air usually creates more cooling.','W = [(2501 − 2.326Twb)Ws − 1.006(Tdb − Twb)] / [2501 + 1.86Tdb − 4.186Twb] (Twb ≥ 0 °C)'],
  ['Tdp','The temperature where cooling air first reaches saturation. Think of droplets forming on a cold glass. Below freezing, this calculator uses saturation over ice, so the value is a frost point.','Pws(Tdp) = Pv; invert the saturation curve'],
  ['RH','How close water vapor is to saturation at the current temperature. Like a fullness gauge, 50% means half the saturation vapor pressure. Heating air without adding water usually lowers RH.','RH = 100 × Pv / Pws(Tdb)'],
  ['W','The mass of water vapor mixed with each unit mass of dry air. Imagine weighing the water vapor and dry air in separate containers.','W = 0.621945 × Pv / (P − Pv)'],
  ['SH','The fraction of the total moist-air mass that is water vapor. Unlike humidity ratio, the total includes both the dry air and its water vapor.','SH = W / (1 + W)'],
  ['h','An energy account for the air and its water vapor. Both warming the air and adding vapor increase this account. Its zero point is a chosen reference, like the starting balance of an account.','h = 1.006Tdb + W(2501 + 1.86Tdb)'],
  ['Pv','The part of air pressure caused by water-vapor molecules. Picture water vapor and dry air each contributing to the total push against a container.','Pv = P × W / (0.621945 + W)'],
  ['Pws','Water-vapor pressure at saturation for a given temperature. It rises sharply as temperature rises. It is the reference line used by the RH fullness gauge.','Pws = exp(ASHRAE polynomial in absolute temperature) / 1000, in kPa'],
];

export default function PsychrometricCalculator() {
  const [ip,setIp]=useState(false), [mode,setMode]=useState('rh'), [values,setValues]=useState(initial), [alt,setAlt]=useState(''), [feet,setFeet]=useState(false);
  const root=useRef(null);
  const [light,setLight]=useState(false), [pdfStatus,setPdfStatus]=useState('');
  useEffect(()=>{try{setLight(localStorage.getItem('psychrometric-theme')==='light');}catch{}},[]);
  const toggleTheme=()=>{setLight(!light);try{localStorage.setItem('psychrometric-theme',light?'dark':'light');}catch{}};
  const [assume,setAssume]=useState(false), [assumption,setAssumption]=useState(50);
  const result=useMemo(()=>{
    try {
      const p=pressureFromAltitude(alt===''?0:Number(alt)*(feet?.3048:1));
      const known={...values};
      if(assume&&['tdb','h','w'].includes(mode))known[mode==='tdb'?'RH':'Tdb']=assumption;
      return {...calculate(known,p),p};
    } catch(error){return {error:error.message};}
  },[values,alt,feet,assume,assumption,mode]);
  const selectMode=id=>{
    const s=result.state??calculate(initial).state;
    setMode(id);setAssume(false);setAssumption(id==='tdb'?50:25);
    setValues(id==='tdb'?{Tdb:s.Tdb}:id==='h'?{h:s.h}:id==='w'?{W:s.W}:id==='wet'?{Tdb:s.Tdb,Twb:s.Twb}:id==='custom'?{Tdb:s.Tdb,RH:s.RH}:{Tdb:s.Tdb,RH:s.RH});
  };
  const fields=mode==='custom'?keys:Object.keys(values);
  const single=['tdb','h','w'].includes(mode);
  const assumptionKey=mode==='tdb'?'RH':'Tdb';
  const change=(k,v)=>setValues(old=>({...old,[k]:v===''?'':fromDisplay(k,Number(v),ip)}));
  const download=()=>{
    const blob=new Blob([JSON.stringify({...result,known:values,assumption:assume?{[assumptionKey]:assumption}:null,units:'SI: °C, kPa, kg/kg, kJ/kg; RH %',enthalpyDatum:'0 °C dry air'},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='psychrometric-state.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const exportPDF=async()=>{
    if(!result.state||result.error||pdfStatus==='Preparing report…')return;
    const chart=root.current.querySelector('svg.psy-chart')?.cloneNode(true);
    if(!chart){setPdfStatus('Chart unavailable. Please try again.');return;}
    const printable=k=>`${format(toDisplay(k,result.state[k],ip),['W','SH'].includes(k)&&!(ip&&k==='W')?6:2)} ${unit(k,ip)}`;
    const inputs=Object.entries(values).filter(([,v])=>v!==''&&v!==undefined).map(([k,v])=>[
      labels[k],`${format(toDisplay(k,v,ip),['W','SH'].includes(k)?6:3)} ${unit(k,ip)}`
    ]);
    if(assume&&single)inputs.push([`Assumed ${labels[assumptionKey]}`,`${format(toDisplay(assumptionKey,assumption,ip),3)} ${unit(assumptionKey,ip)}`]);
    inputs.push(['Site altitude',`${alt===''?'0 (sea level default)':alt} ${feet?'ft':'m'}`],['Atmospheric pressure',`${format(toDisplay('P',result.p,ip),3)} ${unit('P',ip)}`]);
    const snapshot={chart,imperial:ip,inputs,outputs:keys.map(k=>[labels[k],result.state[k]===null?'Not defined':printable(k)]),notes:[
      `Input mode: ${modes.find(m=>m[0]===mode)[1]}. ${assume&&single?'Includes the explicitly listed assumption.':'No assumed air property.'}`,
      'Atmospheric pressure is estimated from site altitude using the standard atmosphere. Actual weather pressure may differ.',
      'Saturation pressure uses the ASHRAE water/ice equations. Below freezing, the reported dew point is a frost point. Ideal-gas psychrometric relationships are used.',
      'Enthalpy retains the reference of zero dry-air enthalpy at 0 °C in both unit systems. Imperial values use BTU/lb = kJ/kg / 2.326 and differ from charts with a conventional Imperial datum.',
      'Humidity ratio is water-vapor mass per dry-air mass (grains/lb in Imperial). Specific humidity is water-vapor mass per total moist-air mass.',
      ...(result.state.Tdp===null?['Dew/frost point is undefined for dry air or below the -100 °C curve limit for trace moisture.']:[]),
      'This report captures the inputs, results and chart at export time.'
    ]};
    setPdfStatus('Preparing report…');
    try{const {exportPsychrometricReport}=await import('../lib/psychrometric-report.js');await exportPsychrometricReport(snapshot);setPdfStatus('Report downloaded.');}
    catch{setPdfStatus('Report export failed. Please try again.');}
  };
  let chartPressure=101.325;
  try{chartPressure=pressureFromAltitude(alt===''?0:Number(alt)*(feet?.3048:1));}catch{/* invalid altitude: chart disabled below */}
  return <div className={`psy-app ${light?'psy-light':''}`} ref={root}>
    <div className="psy-shell">
      <header className="psy-title"><div><span className="psy-eyebrow">TILAK BHUSAL / ENGINEERING TOOLS</span><h1>Understand the air.</h1><div className="psy-unit-switch" role="group" aria-label="Unit system"><button aria-pressed={!ip} onClick={()=>setIp(false)}>SI <small>°C / kPa</small></button><button aria-pressed={ip} onClick={()=>setIp(true)}>Imperial <small>°F / psi</small></button></div><p>Precision psychrometrics. From two known properties to the complete picture.</p></div><div className="psy-header-controls"><div className="psy-actions"><button className="psy-action" aria-pressed={light} onClick={toggleTheme}>{light?'☾ Dark mode':'☀ Light mode'}</button><button className="psy-action psy-primary" disabled={!result.state||!!result.error||pdfStatus==='Preparing report…'} onClick={exportPDF}>↓ Export engineering PDF</button></div><span className="psy-export-status" role="status">{pdfStatus}</span></div></header>
      <div className="psy-workspace">
        <aside className="psy-panel psy-input-panel"><span className="psy-eyebrow">01 / DEFINE YOUR CONDITIONS</span><h2>Known properties</h2><p className="psy-muted">Choose your starting point.</p>
          <div className="psy-modes">{modes.map(([id,title,sub])=><button key={id} aria-pressed={mode===id} onClick={()=>selectMode(id)}><span>{title}</span><small>{sub}</small></button>)}</div>
          <div className="psy-inputs">{fields.map(k=><label key={k}>{labels[k]} <span>{k}</span><div className="psy-field"><input type="number" step="any" aria-label={labels[k]} placeholder={mode==='custom'?'Unknown':''} value={values[k]===undefined||values[k]===''?'':Number(toDisplay(k,values[k],ip).toPrecision(10))} onChange={e=>change(k,e.target.value)}/><span>{unit(k,ip)}</span></div></label>)}</div>
          {single&&<div className="psy-assumption"><p>One property describes many possible air states. Supply another property in “Any known inputs,” or enable an explicit assumption.</p><label className="psy-check"><input type="checkbox" checked={assume} onChange={e=>setAssume(e.target.checked)}/> Use assumed {assumptionKey}</label>{assume&&<label>Assumed {labels[assumptionKey]} ({unit(assumptionKey,ip)})<input type="number" step="any" value={toDisplay(assumptionKey,assumption,ip)} onChange={e=>setAssumption(e.target.value===''?NaN:fromDisplay(assumptionKey,Number(e.target.value),ip))}/></label>}</div>}
          <div className="psy-atmosphere"><div className="psy-inline"><h3>Site altitude</h3><select aria-label="Altitude units" value={feet?'ft':'m'} onChange={e=>{const next=e.target.value==='ft';if(alt!=='')setAlt(String(Number(alt)*(next?1/.3048:.3048)));setFeet(next);}}><option value="m">Meters</option><option value="ft">Feet</option></select></div><label className="psy-field"><input type="number" aria-label="Site altitude" step="any" value={alt} placeholder="Sea level (default)" onChange={e=>setAlt(e.target.value)}/><span>{feet?'ft':'m'}</span></label><p className="psy-muted">{result.p?`${format(toDisplay('P',result.p,ip),3)} ${unit('P',ip)} · standard atmosphere`:'Blank altitude defaults to 101.325 kPa.'}</p></div>
        </aside>
        <div className="psy-main-column">
          <Chart state={result.state} p={chartPressure} ip={ip} onSelect={known=>{setMode('custom');setValues(known);setAssume(false);}}/>
          <section className="psy-results" aria-label="Calculated properties" aria-live="polite"><div className="psy-panel-heading"><div><span className="psy-eyebrow">03 / COMPLETE AIR STATE</span><h2>Your results</h2></div><button className="psy-download" disabled={!result.state} onClick={download}>Export JSON ↗</button></div>
            {result.error?<div className="psy-error" role="alert">{result.error}</div>:<><p className="psy-route">{result.route}{assume?' · Includes an explicit assumption':''}</p><div className="psy-result-grid">{keys.map(k=><div className={`psy-property ${k==='Tdb'||k==='W'?'psy-property-featured':''}`} key={k}><div>{labels[k]} <span>{k}</span></div><strong>{format(toDisplay(k,result.state[k],ip),['W','SH'].includes(k)&&!(ip&&k==='W')?6:2)}</strong><small>{unit(k,ip)}</small></div>)}</div>{result.state.Tdp===null&&<p className="psy-muted">Dew/frost point is undefined for completely dry air, or below the −100 °C curve limit for trace moisture.</p>}</>}
          </section>
        </div>
      </div>
      <section className="psy-learn"><span className="psy-eyebrow">04 / THE SCIENCE, MADE SIMPLE</span><h2>Meet the properties.</h2><p className="psy-muted">Nine ways to describe the same air. Formulas below use SI units; W is per kg of dry air.</p><div className="psy-lesson-grid">{lessons.map(([k,description,formula])=><article className="psy-panel" key={k}><span className="psy-symbol">{k}</span><h3>{labels[k]}</h3><p>{description}</p><code>{formula}</code></article>)}</div></section>
      <details className="psy-panel psy-method"><summary>Equation details, operating limits & sources</summary><p>Saturation pressure uses ASHRAE equations 5 and 6 with absolute temperature K = Tdb + 273.15. The ice branch applies at or below 0.01 °C; the water branch applies above it.</p><code>ln(Pws [Pa]) = −5674.5359/K + 6.3925247 − 0.009677843K + 6.2215701×10⁻⁷K² + 2.0747825×10⁻⁹K³ − 9.484024×10⁻¹³K⁴ + 4.1635019 ln(K) [ice]</code><code>ln(Pws [Pa]) = −5800.2206/K + 1.3914993 − 0.048640239K + 4.1764768×10⁻⁵K² − 1.4452093×10⁻⁸K³ + 6.5459673 ln(K) [water]</code><p>Below 0 °C wet-bulb: W = [(2830 − 0.24Twb)Ws − 1.006(Tdb − Twb)] / [2830 + 1.86Tdb − 2.1Twb]. Ws is the saturation humidity ratio at Twb. Wet-bulb inversion uses bracketed bisection, split at freezing.</p><p>Altitude: P = 101.325(1 − Lz/T₀)^(gM/RL), where L = 0.0065 K/m, T₀ = 288.15 K, g = 9.80665 m/s², M = 0.0289644 kg/mol, and R = 8.3144598 J/(mol·K). Valid altitude: −500 to 11,000 m. Actual weather pressure can differ.</p><p>Saturation curve: −100 to 200 °C. Complete states must be below the local boiling point, within the wet-bulb curve range, and unsaturated or saturated. Dependent inputs (for example W + SH) cannot determine temperature. Inconsistent measurements require correction; the solver tries alternative pairs but never silently replaces a measurement.</p><p>Enthalpy in both displays retains the SI reference of zero dry-air enthalpy at 0 °C. BTU/lb = kJ/kg ÷ 2.326; this differs from charts using the conventional IP enthalpy datum. Specific humidity uses mass per mass of moist air, never per mass of dry air.</p><p>Reference-table humidity ratios include effects beyond the ideal-gas approximations; the published test tolerances reflect this difference. PsychroLib uses a small moisture floor, which can affect near-dry states. Independent numerical checks account for those differences.</p><p>Sources: <a href="https://psychrometrics.github.io/psychrolib/api_docs.html">PsychroLib equation references</a> · <a href="https://github.com/psychrometrics/psychrolib/blob/3066345dc8cf91bf59134147cf917f982c1fce13/tests/test_psychrolib_si.py">ASHRAE table checkpoints</a> · <a href="https://www.ashrae.org/technical-resources/ashrae-handbook">ASHRAE Handbook</a>. Independent checker: PsychroLib 2.5.0, MIT licensed.</p></details>
      <div className="psy-export-bottom"><button className="psy-action psy-primary" disabled={!result.state||!!result.error||pdfStatus==='Preparing report…'} onClick={exportPDF}>↓ Export engineering PDF</button><p role="status">{pdfStatus}</p></div>
      <footer className="psy-footer">PSYCHROMETRICS / ASHRAE FUNDAMENTALS <span>Built for curious minds and careful engineering.</span></footer>
    </div>
  </div>;
}
