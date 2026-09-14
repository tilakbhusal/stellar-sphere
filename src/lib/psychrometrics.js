// ASHRAE Handbook—Fundamentals (2017), chapter 1, eqs. 5, 6, 20–24, 30, 33, 35.
// Canonical state: °C, kPa, kg/kg dry air (SH: kg/kg moist air), kJ/kg dry air, RH %.
import reference from './vendor/psychrolib.js';
reference.SetUnitSystem(reference.SI);
export const keys = ['Tdb', 'Twb', 'Tdp', 'RH', 'W', 'SH', 'Pv', 'Pws', 'h'];
export const tolerances = {Tdb: .002, Twb: .003, Tdp: .003, RH: .01, W: 2e-7, SH: 2e-7, Pv: 2e-5, Pws: 2e-5, h: .002};
const fail = message => { throw new Error(message); };
export function saturation(t) {
  if (!Number.isFinite(t) || t < -100 || t > 200) fail('Temperature must be between −100 and 200 °C.');
  const k = t + 273.15;
  const ln = t <= .01
    ? -5674.5359/k + 6.3925247 - .009677843*k + .00000062215701*k*k + 2.0747825e-9*k**3 - 9.484024e-13*k**4 + 4.1635019*Math.log(k)
    : -5800.2206/k + 1.3914993 - .048640239*k + .000041764768*k*k - 1.4452093e-8*k**3 + 6.5459673*Math.log(k);
  return Math.exp(ln)/1000;
}
export function pressureFromAltitude(altitude = 0) {
  if (!Number.isFinite(altitude) || altitude < -500 || altitude > 11000) fail('Altitude must be between −500 and 11,000 m (troposphere model).');
  return 101.325 * (1 - .0065*altitude/288.15)**(9.80665*.0289644/(8.3144598*.0065));
}
export function bisect(fn, low, high, tolerance = 1e-9) {
  let a = fn(low), b = fn(high);
  if (!Number.isFinite(a) || !Number.isFinite(b)) fail('Non-finite endpoint residual.');
  if (Math.abs(a) < 1e-14) return low;
  if (Math.abs(b) < 1e-14) return high;
  if (a*b > 0) fail('No bracketed physical solution. Check the known properties.');
  for (let i=0; i<100; i++) {
    const mid = (low+high)/2, c = fn(mid);
    if (!Number.isFinite(c)) fail('Non-finite numerical residual.');
    if (high-low < tolerance || Math.abs(c)<1e-14) return mid;
    if (a*c <= 0) { high=mid; b=c; } else { low=mid; a=c; }
  }
  fail('Solver did not converge.');
}
export function inverseSaturation(p) {
  if (!(p >= saturation(-100) && p <= saturation(200))) fail('Vapor pressure is outside the −100 to 200 °C saturation curve.');
  return bisect(t => Math.log(saturation(t)/p), -100, 200);
}
export function humidityRatio(pv, p) {
  if (!(pv >= 0 && pv < p)) fail('Vapor pressure must be nonnegative and below atmospheric pressure.');
  return .621945*pv/(p-pv);
}
export const enthalpy = (t,w) => 1.006*t + w*(2501+1.86*t);
export function wetBulbRatio(t, tw, p) {
  const ws = humidityRatio(saturation(tw),p);
  return tw >= 0
    ? ((2501-2.326*tw)*ws-1.006*(t-tw))/(2501+1.86*t-4.186*tw)
    : ((2830-.24*tw)*ws-1.006*(t-tw))/(2830+1.86*t-2.1*tw);
}
export function wetBulb(t,w,p) {
  const ws=humidityRatio(saturation(t),p);
  if (Math.abs(w-ws)<1e-12+ws*1e-9) return t;
  // Split at freezing: the liquid-water and ice balances are separate branches.
  const ranges = t < 0 ? [[-100,t]] : [[0,t],[-100,-1e-9]];
  for (const [lo,hi] of ranges) {
    if (hi < lo) continue;
    try { const tw = bisect(x=>wetBulbRatio(t,x,p)-w,lo,hi); if (Math.abs(wetBulbRatio(t,tw,p)-w)<1e-8) return tw; } catch { /* try ice branch */ }
  }
  fail('Wet-bulb balance has no solution in the supported temperature range.');
}
export function stateFromTW(Tdb,W,p=101.325) {
  if (!(p > 0 && Number.isFinite(p))) fail('Atmospheric pressure must be positive.');
  const Pws = saturation(Tdb);
  if (Pws >= p) fail('Dry-bulb temperature must be below the boiling point at this pressure.');
  if (!Number.isFinite(W) || W < -1e-10) fail('Inputs imply a negative humidity ratio.');
  W = Math.max(0,W);
  const Pv=p*W/(.621945+W), RH=100*Pv/Pws;
  if (RH > 100+1e-6) fail('Inputs imply supersaturated air. Reduce moisture or increase dry-bulb temperature.');
  const Tdp = Pv < saturation(-100) ? null : inverseSaturation(Pv);
  return {Tdb, Twb:wetBulb(Tdb,W,p), Tdp, RH:Math.min(100,RH), W, SH:W/(1+W), Pv, Pws, h:enthalpy(Tdb,W)};
}
const moistureKeys = ['W','SH','Pv','Tdp'];
function wFunction(key, value, p) {
  switch(key) {
    case 'W': return ()=>value;
    case 'SH': return ()=>value/(1-value);
    case 'Pv': return ()=>humidityRatio(value,p);
    case 'Tdp': return ()=>humidityRatio(saturation(value),p);
    case 'RH': return t=>humidityRatio(saturation(t)*value/100,p);
    case 'h': return t=>(value-1.006*t)/(2501+1.86*t);
    case 'Twb': return t=>wetBulbRatio(t,value,p);
    default: fail('Unsupported property.');
  }
}
function pairStates(a,b,input,p) {
  const anchor = [a,b].find(k=>k==='Tdb'||k==='Pws');
  if (anchor) {
    const other = a===anchor?b:a;
    if (other==='Tdb'||other==='Pws') return [];
    const t=anchor==='Tdb'?input.Tdb:inverseSaturation(input.Pws);
    return [stateFromTW(t,wFunction(other,input[other],p)(t),p)];
  }
  if (moistureKeys.includes(a)&&moistureKeys.includes(b)) return [];
  const fa=wFunction(a,input[a],p), fb=wFunction(b,input[b],p);
  const low = Math.max(-99.9, ...[a,b].filter(k=>k==='Twb'||k==='Tdp').map(k=>input[k]));
  const high=Math.min(199.9,inverseSaturation(Math.min(p*.999,saturation(200))));
  const states=[];
  let prev;
  for(let i=0;i<=800;i++) {
    const t=low+(high-low)*i/800;
    try {
      const f=fa(t)-fb(t);
      if (!Number.isFinite(f)) {prev=undefined;continue;}
      if (prev && (f*prev.f<0 || Math.abs(f)<1e-12)) {
        const root=bisect(x=>fa(x)-fb(x),prev.t,t);
        try { const s=stateFromTW(root,fa(root),p); if (!states.some(x=>Math.abs(x.Tdb-root)<1e-5)) states.push(s); } catch { /* outside physical region */ }
      } else if (i===0 && Math.abs(f)<1e-12) {
        try {states.push(stateFromTW(t,fa(t),p));} catch { /* outside physical region */ }
      }
      prev={t,f};
    } catch {prev=undefined;}
  }
  return states;
}
export function solveKnown(known,p=101.325) {
  const input=Object.fromEntries(Object.entries(known).filter(([,v])=>v!=='' && v!==null && v!==undefined));
  for (const [k,v] of Object.entries(input)) {
    if (!keys.includes(k)||!Number.isFinite(v)) fail('Every known property must be a finite number.');
    if (['Tdb','Twb','Tdp'].includes(k)) saturation(v);
    if (k==='RH'&&(v<0||v>100)) fail('Relative humidity must be between 0 and 100%.');
    if (k==='SH'&&(v<0||v>=1)) fail('Specific humidity must be between 0 and 1 kg/kg moist air.');
    if (['W','Pv','Pws'].includes(k)&&v<0) fail(`${k} cannot be negative.`);
  }
  const names=keys.filter(k=>k in input);
  if (names.length<2) fail('A complete air state requires two independent properties and pressure. Add a second known property.');
  let best, bestError=Infinity, route, ambiguous=false;
  for(let i=0;i<names.length;i++) for(let j=i+1;j<names.length;j++) {
    try {
      for(const s of pairStates(names[i],names[j],input,p)) {
        const error=Math.max(...names.map(k=>s[k]===null?Infinity:Math.abs(s[k]-input[k])/tolerances[k]));
        if (error<=1 && bestError<=1 && Math.abs(s.Tdb-best.Tdb)>.01) ambiguous=true;
        if(error<bestError){best=s;bestError=error;route=`${names[i]} + ${names[j]} → Tdb, W → complete state`;}
      }
    } catch { /* try another independent pair */ }
  }
  if (!best) fail('These properties are dependent or have no physical solution. Add dry-bulb temperature or check the values.');
  if (bestError>1) fail('Known properties conflict beyond tolerance. Correct the inputs; no state can satisfy all supplied values.');
  if(ambiguous) fail('This combination has multiple physical solutions. Add dry-bulb temperature to select the intended state.');
  return {state:best,route};
}
export function independentState(s,p) {
  const Tdb=s.Tdb, W=s.W, P=p*1000;
  // PsychroLib uses a 1e−7 W floor. Preserve exact dryness in algebraic properties.
  const Pv=P*W/(.621945+W)/1000;
  const Pws=reference.GetSatVapPres(Tdb)/1000;
  return {Tdb,W,Pv,Pws,RH:100*Pv/Pws,SH:W/(1+W),h:reference.GetMoistAirEnthalpy(Tdb,W)/1000,
    Tdp:s.Tdp===null?null:reference.GetTDewPointFromVapPres(Tdb,Pv*1000),
    Twb:reference.GetTWetBulbFromHumRatio(Tdb,W,P)};
}
export function critique(state,p) {
  try {
    const independent=independentState(state,p);
    const comparisons=keys.map(key=>({key, original:state[key], recomputed:independent[key], difference:state[key]===null&&independent[key]===null?0:Math.abs(state[key]-independent[key]), tolerance:tolerances[key]}));
    const worst=Math.max(...comparisons.map(x=>x.difference/x.tolerance));
    const score=Number(Math.max(0,10-2*worst).toFixed(2));
    return {score,comparisons,independent,acceptable:score>=8, explanation:score>=8?'Independent ASHRAE implementation agrees within the displayed tolerances.':'Independent recomputation exceeds tolerance. Review the flagged properties.'};
  } catch(error) {return {score:0,comparisons:[],acceptable:false,explanation:error.message};}
}
// ASHRAE 2017 ch. 1 tables 1–3 and example 1, transcribed in PsychroLib's SI tests.
export function referenceChecks() {
  const rows=[];
  const add=(label,actual,expected,tolerance)=>rows.push({label,actual,expected,tolerance,pass:Math.abs(actual-expected)<=tolerance});
  for(const [t,pa] of [[-60,1.08],[-20,103.24],[-5,401.74],[5,872.6],[25,3169.7],[50,12351.3],[100,101418],[150,476101.4]]) add(`Table 3 · Pws at ${t} °C (Pa)`,saturation(t)*1000,pa,t===-60?.01:pa*.0003);
  for(const [t,w] of [[-50,.0000243],[-20,.0006373],[-5,.0024863],[5,.005425],[25,.020173],[50,.086863]]) add(`Table 2 · Ws at ${t} °C (kg/kg)`,humidityRatio(saturation(t),101.325),w,Math.abs(w)*([-5,5,25].includes(t)?.005:.01));
  for(const [z,pa] of [[-500,107478],[0,101325],[500,95461],[1000,89875],[4000,61640],[10000,26436]]) add(`Table 1 · pressure at ${z} m (Pa)`,pressureFromAltitude(z)*1000,pa,2);
  const ex=stateFromTW(40,wetBulbRatio(40,20,101.325));
  for(const [k,v,tol] of [['W',.0065,.0001],['Tdp',7,.5],['RH',14,1],['h',56.7,.1]]) add(`Example 1 · ${k}`,ex[k],v,tol);
  return rows;
}
export function calculate(known,p=101.325) {
  let {state,route}=solveKnown(known,p), audit=critique(state,p), corrected=false;
  const initialAudit=audit;
  if(audit.score<8) {
    // Re-solve constraints with tighter independent checks; never discard conflicting measurements.
    const retry=solveKnown(known,p);
    const candidate=independentState(retry.state,p);
    const agrees=Object.entries(known).filter(([,v])=>v!==''&&v!==null&&v!==undefined).every(([k,v])=>candidate[k]!==null&&Math.abs(candidate[k]-v)<=tolerances[k]);
    const reverse=critique(candidate,p);
    const residual=Math.abs(wetBulbRatio(candidate.Tdb,candidate.Twb,p)-candidate.W);
    if(agrees&&reverse.score>=8&&residual<=2e-7){state=candidate;audit={...reverse,explanation:'Recomputed with the independent implementation after a tolerance discrepancy.'};corrected=true;}
  }
  const references=referenceChecks();
  if(references.some(r=>!r.pass))audit={...audit,score:Math.min(4,audit.score),acceptable:false,explanation:'An ASHRAE reference checkpoint failed. Result flagged for review.'};
  return {state,route,audit,initialAudit,corrected,references};
}
export function toDisplay(key,value,imperial=false) {
  if(value===null) return null;
  if(!imperial) return value;
  if(['Tdb','Twb','Tdp'].includes(key)) return value*1.8+32;
  if(['Pv','Pws','P'].includes(key)) return value/6.894757293;
  if(key==='W') return value*7000;
  if(key==='h') return value/2.326; // same SI 0 °C enthalpy datum in both displays
  return value;
}
export function fromDisplay(key,value,imperial=false) {
  if(!imperial) return value;
  if(['Tdb','Twb','Tdp'].includes(key)) return (value-32)/1.8;
  if(['Pv','Pws','P'].includes(key)) return value*6.894757293;
  if(key==='W') return value/7000;
  if(key==='h') return value*2.326;
  return value;
}
export const unit=(key,ip=false)=>['Tdb','Twb','Tdp'].includes(key)?(ip?'°F':'°C'):['Pv','Pws','P'].includes(key)?(ip?'psi':'kPa'):key==='RH'?'%':key==='W'?(ip?'grains/lb dry air':'kg/kg dry air'):key==='SH'?(ip?'lb/lb moist air':'kg/kg moist air'):(ip?'BTU/lb dry air':'kJ/kg dry air');
