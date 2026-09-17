import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,calculate,audit} from '../src/lib/power-factor.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Known 3-4-5 triangle and correction to unity',()=>{
 const i={...defaults,kw:300,peak:300,pf:.6,target:1,deviceLoss:0,maintenance:0},r=calculate(i);
 close(r.q1,400);close(r.s1,500);close(r.q2,0);close(r.s2,300);close(r.bank,400);close(r.theta1,53.13010235415598);close(r.lossReduction,.64);close(r.demandSavings,200*12*12);assert.equal(audit(i,r),10);
});
test('288 independent electrical scenarios, including unity and distortion',()=>{
 for(const pf of [.2,.5,.75,.9,.95,1])for(const target of [pf,1])for(const thdi of [0,5,30,100])for(const kw of [1,400,5000]){
  const i={...defaults,kw,peak:kw*1.25,pf,target,advanced:true,thdi};const r=calculate(i);
  close(r.bank,i.peak*(Math.sqrt(1-pf*pf)/pf-Math.sqrt(1-target*target)/target));
  close(r.s1,kw/pf*Math.sqrt(1+(thdi/100)**2));assert.equal(audit(i,r),10);
 }
});
test('Capacitors retain harmonic amperes, so true PF is below displacement PF',()=>{
 const r=calculate({...defaults,pf:.8,target:1,advanced:true,thdi:30,filter:false});
 close(r.true1,.8/Math.sqrt(1.09));close(r.harmonic1,r.harmonic2);close(r.postTHDi,37.5);close(r.true2,1/Math.sqrt(1+.375**2));assert.ok(r.true2<1);close(r.filterSize,0);
});
test('AHF residual uses corrected fundamental current and rating includes peak/allowance',()=>{
 const i={...defaults,advanced:true,thdi:40,residual:5},r=calculate(i);
 close(r.harmonic2,r.fundamental2*.05);close(r.true2,.95/Math.sqrt(1.0025));
 close(r.filterSize,(r.harmonic1-r.harmonic2)*1.25*1.25);
 const noAdd=calculate({...i,residual:300});close(noAdd.harmonic2,noAdd.harmonic1);close(noAdd.filterSize,0);
});
test('Tariff modes are mutually exclusive, do not double count penalties',()=>{
 const kva=calculate(defaults);close(kva.demandSavings,12*12*500*(1/.75-1/.95));
 const penalty=calculate({...defaults,tariff:'penalty'});close(penalty.demand1,500*12*.9/.75);close(penalty.demand2,6000);
 const flat=calculate({...defaults,tariff:'kw'});close(flat.demandSavings,0);
 const sw=calculate({...defaults,tariff:'switch',kwRate:15});close(sw.demand2,7500);assert.ok(sw.warnings.some(w=>w.includes('hypothetical')));
});
test('Savings reconcile to monthly bills and maintenance, with no energy duplication',()=>{
 const r=calculate(defaults);close(r.net,12*(r.bill1-r.bill2)-defaults.maintenance);
 close(r.loss1,3*r.amps1*r.amps1*defaults.resistance/1000);close(r.payback,defaults.capital/r.net);
 const zero=calculate({...defaults,target:.75,resistance:0,deviceLoss:0,maintenance:0});close(zero.net,0);assert.equal(zero.payback,null);
 assert.equal(calculate({...defaults,capital:0}).roi,null);
});
test('Overload, resonance, nonphysical inputs and corrupted output are handled',()=>{
 assert.ok(calculate({...defaults,transformer:300}).warnings.some(w=>w.includes('nameplate')));
 assert.ok(calculate({...defaults,advanced:true}).warnings.some(w=>w.includes('resonance')));
 for(const change of [{pf:0},{pf:1.1},{target:.5},{voltage:0},{kw:''},{peak:300},{resistance:-1},{hours:9000},{thdi:Infinity}])assert.throws(()=>calculate({...defaults,...change}));
 assert.equal(audit(defaults,{...calculate(defaults),s1:1}),0);
});
