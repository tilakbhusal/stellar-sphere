/** Affinity predictions at homologous points; quadratic system intersection.
 * SI internally: m3/h, m (pump) or Pa (fan), kW shaft, rpm, mm.
 * Trim is an approximate same-casing pump model, not geometric fan scaling.
 */
export const defaults = {equipment:'pump',mode:'speed',advanced:false,q:100,h:30,p:15,n1:1800,n2:1440,d1:250,d2:225,eq:1,eh:2,ep:3,shutoff:40,static:0,bep:100,motor:93,drive:97,hours:4000,rate:0.12,npshr:3,npsha:6};
export function exponents(i) { return i.advanced ? [i.eq,i.eh,i.ep] : i.mode==='similarity' ? [3,2,5] : [1,2,3]; }
export function validate(i) {
 const positive=['q','h','p','n1','d1','d2','shutoff','bep','motor','drive'];
 for(const k of [...positive,'n2','static','hours','rate','eq','eh','ep','npshr','npsha']) if(typeof i[k]!=='number'||!Number.isFinite(i[k])) throw Error('Enter a finite number in every numeric field.');
 for(const k of positive) if(i[k]<=0) throw Error(`${k} must be greater than zero.`);
 if(i.n2<0||i.static<0||i.hours<0||i.rate<0||i.npshr<0||i.npsha<0) throw Error('Speed, static head, hours, tariff and NPSH cannot be negative.');
 if(i.motor>100||i.drive>100||i.hours>8784) throw Error('Efficiency must be at most 100%; annual hours must be at most 8,784.');
 if(i.shutoff<=i.h||i.static>=i.h) throw Error('Shutoff must exceed baseline head/pressure; static head/pressure must be below it.');
 if(i.eq<=0||i.eh<=0||i.ep<=0||Math.max(i.eq,i.eh,i.ep)>10) throw Error('Exponents must be greater than 0 and at most 10.');
 if(!['pump','fan'].includes(i.equipment)||!['speed','trim','similarity'].includes(i.mode)) throw Error('Unknown equipment or scaling model.');
 if(i.equipment==='fan'&&i.mode==='trim') throw Error('Pump impeller trim does not describe geometrically scaled fans.');
}
export function calculate(i) {
 validate(i);
 const e=exponents(i),r=i.mode==='speed'?i.n2/i.n1:i.d2/i.d1;
 const s=e.map(x=>r**x),[sq,sh,sp]=s;
 const q=i.q*sq,h=i.h*sh,p=i.p*sp;
 const k=(i.h-i.static)/i.q**2,a=(i.shutoff-i.h)/i.q**2;
 const pump=x=>sq===0?0:sh*(i.shutoff-a*(x/sq)**2);
 const system=x=>i.static+k*x*x;
 const available=i.shutoff*sh-i.static;
 const op=available>0&&sq>0?Math.sqrt(available/(a*sh/sq**2+k)):null;
 const oh=op===null?null:system(op);
 // Flat local hydraulic-efficiency assumption, anchored to homologous power.
 const opPower=op===null?null:p*(op/q)*(oh/h);
 const baseKW=i.p/(i.motor/100),newKW=opPower===null?null:opPower/(i.motor/100)/(i.mode==='speed'?i.drive/100:1);
 const kwh=newKW===null?null:(baseKW-newKW)*i.hours;
 const savings=kwh===null?null:kwh*i.rate;
 const bepRatio=op===null?null:op/(i.bep*sq);
 const nr=i.equipment==='pump'&&i.mode==='speed'?i.npshr*r*r:null;
 const warnings=[];
 if(op===null) warnings.push('No positive-flow intersection: the modeled machine cannot overcome static head/pressure. Energy savings are unavailable.');
 if(bepRatio!==null&&(bepRatio<0.7||bepRatio>1.2)) warnings.push(`Operating flow is ${(100*bepRatio).toFixed(0)}% of scaled BEP flow, outside the illustrative 70–120% screening band. Efficiency may fall; use the manufacturer’s allowable operating region.`);
 if(i.mode==='speed'&&(r<0.5||r>1.1)) warnings.push('Large RPM change: verify motor cooling, mechanical speed limits and manufacturer curves. Low-flow fan stall or pump recirculation cannot be determined from RPM alone.');
 if(i.equipment==='fan'&&bepRatio!==null&&bepRatio<0.7) warnings.push('Low relative flow: potential fan stall. Check the manufacturer’s stall boundary; this monotonic model cannot predict stall.');
 if(nr!==null&&nr>=i.npsha) warnings.push('Estimated NPSHr reaches or exceeds entered NPSHa: cavitation risk. Check actual NPSHr at operating flow and the required NPSH margin.');
 if(i.mode==='trim') warnings.push('The 1/2/3 diameter rule approximates small pump trims in the same casing. Confirm the trimmed impeller curve and efficiency.');
 if(i.advanced) warnings.push('Custom exponents are empirical calibration, not the standard affinity laws.');
 if(newKW!==null&&newKW>baseKW) warnings.push('This scenario increases electrical energy cost.');
 if(![q,h,p,k,a,...s].every(Number.isFinite)||[op,oh,opPower,newKW,kwh,savings].some(v=>v!==null&&!Number.isFinite(v))) throw Error('Inputs exceed the numerical range. Use realistic engineering values.');
 return {q,h,p,r,e,s,k,a,pump,system,op,oh,opPower,baseKW,newKW,kwh,savings,bepRatio,nr,warnings};
}
// Independent logarithmic reference, plus a bisection intersection check.
// A failed check blocks publication; no fabricated score or self-modifying code.
export function audit(i,result,display=null) {
 const ratio=i.mode==='speed'?i.n2/i.n1:i.d2/i.d1;
 const powers=i.advanced?[i.eq,i.eh,i.ep]:i.mode==='similarity'?[3,2,5]:[1,2,3];
 const expected=[i.q,i.h,i.p].map((v,j)=>ratio===0?0:Math.exp(Math.log(v)+powers[j]*Math.log(ratio)));
 const values=display||[result.q,result.h,result.p];
 let error=Math.max(...values.map((v,j)=>Math.abs(v-expected[j])/Math.max(1,Math.abs(expected[j]))));
 if(result.op!==null){
  let lo=0,hi=i.q*result.s[0]*Math.sqrt(i.shutoff/(i.shutoff-i.h));
  for(let n=0;n<100;n++){const mid=(lo+hi)/2;if(result.pump(mid)>result.system(mid))lo=mid;else hi=mid;}
  error=Math.max(error,Math.abs((lo+hi)/2-result.op)/Math.max(1,result.op));
 }
 return Number.isFinite(error)&&error<1e-9?10:0;
}
