import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,calculate,audit} from '../src/lib/affinity.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Worked speed reduction: 1800 to 1440 rpm; electrical losses included',()=>{
 const r=calculate(defaults);close(r.q,80);close(r.h,19.2);close(r.p,7.68);close(r.op,80);close(r.oh,19.2);close(r.opPower,7.68);close(r.savings,(15/.93-7.68/.93/.97)*4000*.12);assert.equal(audit(defaults,r),10);
});
test('Independent standard-law and intersection grid, 288 cases',()=>{
 for(const equipment of ['pump','fan'])for(const mode of ['speed','similarity'])for(const ratio of [.1,.3,.5,.8,1,1.2,1.5,2])for(const staticHead of [0,10,29])for(const q of [1,100,10000]){
 const i={...defaults,equipment,mode,q,n2:defaults.n1*ratio,d2:defaults.d1*ratio,static:staticHead},r=calculate(i);
 const qfac=mode==='speed'?ratio:ratio*ratio*ratio,pfac=mode==='speed'?ratio*ratio*ratio:ratio**5;
 close(r.q,q*qfac);close(r.h,30*ratio*ratio);close(r.p,15*pfac);
 if(r.op!==null)close(r.pump(r.op),r.system(r.op));assert.equal(audit(i,r),10);
 }
});
test('Static head separates homologous flow from the actual intersection',()=>{const r=calculate({...defaults,static:15});close(r.op,Math.sqrt((25.6-15)/.0025));assert.ok(r.op<r.q);close(r.opPower,7.68*r.op/80*r.oh/19.2);});
test('Custom exponents, pump trim, and geometry are distinct',()=>{
 const r=calculate({...defaults,advanced:true,ep:2.8});close(r.p,15*Math.exp(2.8*Math.log(.8)));
 close(calculate({...defaults,mode:'trim'}).q,90);close(calculate({...defaults,mode:'similarity'}).q,72.9);
 close(calculate({...defaults,advanced:false,ep:2.8}).p,7.68);
});
test('Stopped machine and insufficient shutoff do not invent useful savings',()=>{for(const i of [{...defaults,n2:0},{...defaults,static:29}]){const r=calculate(i);assert.equal(r.op,null);assert.equal(r.savings,null);assert.equal(audit(i,r),10);}});
test('Reject missing, infinite, nonphysical and inconsistent inputs',()=>{for(const change of [{q:0},{q:''},{p:-1},{n1:0},{n2:-1},{motor:101},{motor:0},{drive:0},{hours:9000},{rate:-1},{h:40},{static:30},{eq:0},{npsha:-1},{d2:Infinity},{equipment:'fan',mode:'trim'}])assert.throws(()=>calculate({...defaults,...change}));});
test('BEP and NPSH screens are conditional; negative savings stay negative',()=>{
 const r=calculate({...defaults,n2:2100,npsha:2,bep:200});assert.ok(r.warnings.some(w=>w.includes('cavitation')));assert.ok(r.warnings.some(w=>w.includes('BEP')));assert.ok(r.savings<0);assert.equal(calculate({...defaults,mode:'trim'}).nr,null);
});
test('Validation rejects deliberately corrupted output',()=>{const r=calculate(defaults);assert.equal(audit(defaults,{...r,p:8}),0);assert.equal(audit(defaults,r,[80,19.2,100]),0);});
