import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,calculate,audit,saturated,liquidH,shellNTU,shellEffectiveness,display,internal} from '../src/lib/boiler-recovery.js';
import reference from './fixtures/steam-iapws95.json' with {type:'json'};
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Steam interpolation agrees with independent IAPWS-95 properties at 12 pressures',()=>{
 for(const expected of reference.rows){const actual=saturated(expected.gauge);for(const key of ['t','hf','hg','vg'])near(actual[key],expected[key],.001);}
});
test('Published Spirax Sarco 10 to 0.5 barg example gives about 14.1% flash',()=>{
 const b=saturated(10),f=saturated(.5);near((b.hf-f.hf)/f.hfg,.141,.001);
});
test('Mass balance distinguishes makeup, total feedwater and returned condensate',()=>{
 for(const ret of [0,50,90]){const i={...defaults,steam:10000,tds:100,limit:2000,return:ret},r=calculate(i);near(r.blow,10000*(1-ret/100)/19);near(r.blowPercent,5);near(r.makeup*100,r.blow*2000);near(r.makeup+10000*ret/100,10000+r.blow);assert.equal(audit(i,r),10);}
});
test('Independent conservation over 216 operating scenarios and corrupt-output rejection',()=>{
 let count=0;for(const boiler of [3,10,40])for(const flash of [0,.5,2])for(const tds of [0,100,300,600])for(const ret of [0,50,85])for(const use of [0,100]){
 const i={...defaults,boiler,flash,tds,return:ret,use,drain:60},r=calculate(i);near(r.blow*r.b.hf,r.flashMass*r.f.hg+r.residual*r.f.hf);near(r.waste,r.hx+r.flashHeat+r.unrecovered);near(r.recovered*3600,r.makeup*(liquidH(r.makeupOut)-liquidH(i.cold)));assert.ok(r.makeupOut<=i.maxMakeup+1e-8);assert.equal(audit(i,r),10);assert.equal(audit(i,{...r,blow:r.blow+1}),0);count++;}assert.equal(count,216);
});
test('One-shell-pass inverse sizing matches effectiveness and rejects impossible duties',()=>{
 for(const cr of [0,.05,.5,1])for(const ntu of [.01,.2,1,3,10])near(shellNTU(shellEffectiveness(ntu,cr),cr),ntu,1e-8);
 assert.throws(()=>shellNTU(.9,1),/one-shell-pass/);
 const r=calculate(defaults),d=calculate({...defaults,U:defaults.U/2});near(d.area,2*r.area);near(d.hx,r.hx);
});
test('Flash capture is limited by the makeup heat sink and unused heat stays in losses',()=>{
 const i={...defaults,maxMakeup:20},r=calculate(i);near(r.makeupOut,20);assert.ok(r.flashHeat<r.flashPotential);assert.ok(r.warnings.some(w=>w.includes('caps flash')));
 const zero=calculate({...defaults,use:0});near(zero.flashHeat,0);near(zero.waste,zero.hx+zero.unrecovered);
});
test('Zero blowdown and zero flashing are valid; invalid scenarios fail closed',()=>{
 const z=calculate({...defaults,tds:0});for(const key of ['blow','area','recovered','flashMass'])near(z[key],0);assert.equal(audit({...defaults,tds:0},z),10);
 const same={...defaults,flash:defaults.boiler},r=calculate(same);near(r.flashMass,0);assert.ok(r.warnings.some(w=>w.includes('2%')));
 for(const bad of [{flash:-1},{flash:61},{boiler:0},{tds:3000},{return:100},{cold:0},{drain:10},{maxMakeup:99},{U:0},{hours:9000},{fuel:-1},{steam:''},{efficiency:0}])assert.throws(()=>calculate({...defaults,...bad}));
});
test('Cash flow reconciles heat, fuel, costs, escalation and discounting',()=>{
 const i={...defaults,escalation:3,discount:7},r=calculate(i);near(r.fuelSavings,r.recovered*3412.141633*i.hours/1e6/(i.efficiency/100)*i.fuel);near(r.net,r.fuelSavings-i.maintenance-i.pump*i.hours*i.electric);
 let cash=-i.capital,npv=-i.capital;for(let y=1;y<=10;y++){const annual=r.fuelSavings*1.03**(y-1)-r.auxiliary-i.maintenance;cash+=annual;npv+=annual/1.07**y;near(r.cashflow[y].cash,cash);near(r.cashflow[y].discounted,npv);}near(r.payback,i.capital/r.net);
});
test('SI and Imperial conversions preserve physical scenarios without rounding drift',()=>{
 for(const kind of ['flow','pressure','temp','heat','area','volume','u'])for(const value of [0,1,15.5,200,9071.8474])near(internal(display(value,kind,'IP'),kind,'IP'),value);
 near(display(1,'pressure','IP'),14.503773773);near(display(0,'temp','IP'),32);near(display(1,'area','IP'),10.763910417);
});
