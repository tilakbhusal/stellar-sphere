import test from 'node:test';
import assert from 'node:assert/strict';
import {toDisplay,fromDisplay,unit} from '../src/lib/affinity-units.js';
import {calculate,defaults} from '../src/lib/affinity.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Engineering unit checkpoints: US gpm, cfm, feet, in. water, horsepower',()=>{
 close(toDisplay('q',0.22712470704,'pump',true),1);
 close(toDisplay('q',1.69901079552,'fan',true),1);
 close(toDisplay('h',0.3048,'pump',true),1);
 close(toDisplay('h',249.08891,'fan',true),1);
 close(toDisplay('d1',25.4,'pump',true),1);
 close(toDisplay('p',0.7456998715822702,'pump',true),1);
 close(toDisplay('npsha',0.3048,'pump',true),1);
 assert.equal(unit('q','pump',true),'US gpm');assert.equal(unit('q','fan',true),'cfm');
});
test('SI/Imperial round trips preserve physical inputs and financial results',()=>{
 for(const equipment of ['pump','fan']){
  const i={...defaults,equipment},copy={...i};
  for(let n=0;n<50;n++)for(const k of ['q','bep','h','shutoff','static','p','d1','d2','npshr','npsha','n1','n2','hours','rate','motor','drive'])copy[k]=fromDisplay(k,toDisplay(k,copy[k],equipment,true),equipment,true);
  for(const k of ['q','h','p','op','oh','savings'])close(calculate(copy)[k],calculate(i)[k]);
 }
 assert.equal(toDisplay('q',null,'pump',true),null);assert.equal(fromDisplay('q','','pump',true),'');
});
