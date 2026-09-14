import test from 'node:test';
import assert from 'node:assert/strict';
import {keys,calculate,solveKnown,stateFromTW,saturation,humidityRatio,pressureFromAltitude,referenceChecks,toDisplay,fromDisplay,critique,wetBulbRatio} from '../src/lib/psychrometrics.js';

test('24 ASHRAE table and worked-example checkpoints',()=>{
  const checks=referenceChecks();assert.equal(checks.length,24);
  for(const check of checks)assert.ok(check.pass,JSON.stringify(check));
});
test('known 25 °C, 50% RH state and independent numerical score',()=>{
  const {state:s,audit}=calculate({Tdb:25,RH:50});
  assert.ok(Math.abs(s.W-.00988104369)<1e-10);
  assert.ok(Math.abs(s.h-50.3219588)<1e-6);
  assert.ok(Math.abs(s.Twb-17.88934)<.001);
  assert.ok(Math.abs(s.Tdp-13.86397)<.001);
  assert.ok(audit.score>=8);
});
test('1044 independent pair cases across cold, freezing, warm, saturation and altitude',()=>{
  let solved=0,ambiguous=0;
  for(const t of [-40,-10,0,10,25,45])for(const rh of [10,50,100])for(const p of [101.325,pressureFromAltitude(2500)]){
    const s=stateFromTW(t,humidityRatio(saturation(t)*rh/100,p),p);
    for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){
      const a=keys[i],b=keys[j];
      if(['W','SH','Pv','Tdp'].includes(a)&&['W','SH','Pv','Tdp'].includes(b)||a==='Tdb'&&b==='Pws')continue;
      const known={[a]:s[a],[b]:s[b]};
      if(t===0&&rh===100&&a==='Twb'&&b==='h'){
        assert.throws(()=>solveKnown(known,p),/multiple physical solutions/);ambiguous++;continue;
      }
      const result=solveKnown(known,p);
      assert.ok(Math.abs(result.state.Tdb-t)<.002,JSON.stringify({t,rh,p,a,b,state:result.state}));
      assert.ok(Math.abs(result.state.W-s.W)<2e-7);
      solved++;
    }
  }
  assert.equal(solved,1042);assert.equal(ambiguous,2);
});
test('missing, dependent, inconsistent and nonphysical inputs do not fabricate states',()=>{
  for(const input of [{},{Tdb:25},{h:50},{W:.01},{W:.01,SH:.01/1.01},{Tdb:25,Pws:saturation(25)},{Tdb:25,RH:110},{Tdb:25,W:-.01},{Tdb:20,Twb:25},{Tdb:25,RH:50,W:.02},{Tdb:NaN,RH:50},{Tdb:25,RH:Infinity}])assert.throws(()=>calculate(input));
  assert.throws(()=>calculate({Tdb:25,RH:50},0));
  assert.throws(()=>pressureFromAltitude(12000));
});
test('overdetermined consistent values select a stable pair',()=>{
  const {state}=calculate({Tdb:25,RH:50});
  const recovered=calculate(state);
  assert.ok(recovered.audit.score>=8);
  assert.ok(Math.abs(recovered.state.W-state.W)<1e-10);
});
test('dry air has zero moisture and an explicitly undefined dew point',()=>{
  const {state,audit}=calculate({Tdb:25,RH:0});
  assert.equal(state.W,0);assert.equal(state.SH,0);assert.equal(state.Pv,0);assert.equal(state.Tdp,null);
  assert.ok(Number.isFinite(state.Twb));assert.ok(audit.score>=8);
});
test('audit flags deliberate corruption rather than displaying a fixed score',()=>{
  const {state}=calculate({Tdb:25,RH:50});
  assert.equal(critique({...state,h:state.h+1},101.325).score,0);
  assert.equal(critique({...state,Twb:state.Twb+1},101.325).acceptable,false);
});
test('unit conversion round trips preserve the SI state and enthalpy datum',()=>{
  const {state}=calculate({Tdb:25,RH:50});
  for(const k of keys)assert.ok(Math.abs(fromDisplay(k,toDisplay(k,state[k],true),true)-state[k])<1e-10);
  assert.equal(toDisplay('Tdb',25,true),77);
  assert.equal(toDisplay('W',.01,true),70);
  assert.ok(Math.abs(pressureFromAltitude(1000)-89.87475)<.001);
});
test('wet-bulb residual and independent checks over normal operating range',()=>{
  for(const t of [-40,-10,0,.01,5,25,45,65])for(const rh of [0,10,50,95,100]){
    const {state:s,audit}=calculate({Tdb:t,RH:rh});
    assert.ok(Math.abs(wetBulbRatio(s.Tdb,s.Twb,101.325)-s.W)<2e-7);
    assert.ok(s.Twb<=s.Tdb+.002);
    assert.ok(audit.score>=8,JSON.stringify({t,rh,audit}));
  }
});
