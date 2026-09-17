import steam from './steam-table.json' with {type:'json'};
// SI internally: kg/h, bar gauge, deg C, kJ/kg, kW, m2. Absolute atmospheric pressure is 1.01325 bar.
const rows=steam.rows;
function interpolate(value,col){
 if(!Number.isFinite(value)||value<rows[0][col]||value>rows.at(-1)[col])throw Error('Steam property request is outside the validated table.');
 let l=0,h=rows.length-1;while(h-l>1){const m=(l+h)>>1;if(rows[m][col]>value)h=m;else l=m;}
 const a=rows[l],b=rows[h],f=(value-a[col])/(b[col]-a[col]);return a.map((v,k)=>v+f*(b[k]-v));
}
export function saturated(gauge){const [t,p,hf,hg,vg]=interpolate(gauge+1.01325,1);return {t,p,hf,hg,hfg:hg-hf,vg};}
export const liquidH=t=>interpolate(t,0)[2];
export const liquidT=h=>interpolate(h,2)[0];
export const defaults={steam:9071.8474,tds:200,limit:3000,return:50,boiler:10.34213594,flash:.344737865,cold:15.5555556,drain:43.3333333,maxMakeup:90,U:600,use:100,efficiency:82,hours:8000,fuel:8,capital:25000,maintenance:250,pump:0.1,electric:.12,escalation:0,discount:5};
export const fields={
 steam:['Steam generation','flow'],tds:['Makeup water TDS','ppm'],limit:['Maximum boiler TDS','ppm'],return:['Clean condensate return','% of steam'],boiler:['Boiler operating pressure','pressure'],flash:['Flash tank pressure','pressure'],cold:['Incoming makeup temperature','temp'],drain:['Target residual drain temperature','temp'],maxMakeup:['Maximum heated makeup temperature','temp'],U:['Fouled overall U-value','u'],use:['Flash capture / availability','%'],efficiency:['Boiler fuel-to-steam efficiency','%'],hours:['Annual operating hours','h/year'],fuel:['Fuel cost','USD/MMBtu'],capital:['Installed skid + controller cost','USD'],maintenance:['Annual maintenance','USD/year'],pump:['Auxiliary electric load','kW'],electric:['Electricity rate','USD/kWh'],escalation:['Annual fuel-price escalation','%'],discount:['Annual discount rate','%']};
export const units={SI:{flow:'kg/h',pressure:'bar(g)',temp:'°C',heat:'kW',area:'m²',volume:'m³/h',u:'W/(m²·K)'},IP:{flow:'lb/h',pressure:'psig',temp:'°F',heat:'Btu/h',area:'ft²',volume:'ft³/min',u:'Btu/(h·ft²·°F)'}};
const factors={flow:2.20462262185,pressure:14.503773773,heat:3412.141633,area:10.763910417,volume:.588577779,u:.1761101838};
export function display(v,kind,system){return system==='SI'?v:kind==='temp'?v*1.8+32:v*(factors[kind]??1);}
export function internal(v,kind,system){return system==='SI'?v:kind==='temp'?(v-32)/1.8:v/(factors[kind]??1);}
export function abmaReference(pressure){const p=pressure*14.503773773;return p<=300?3500:p<=450?3000:p<=600?2500:p<=750?1000:p<=900?750:625;}
export function shellEffectiveness(ntu,cr){if(ntu===0)return 0;const s=Math.sqrt(1+cr*cr);return 2/(1+cr+s/Math.tanh(ntu*s/2));}
export function shellNTU(e,cr){if(e===0)return 0;const s=Math.sqrt(1+cr*cr),z=(2/e-1-cr)/s;if(z<=1)throw Error('The requested drain temperature exceeds the capability of a one-shell-pass exchanger. Increase the drain target or use a different exchanger arrangement.');return Math.log((z+1)/(z-1))/s;}
export function calculate(i){
 for(const k of Object.keys(fields))if(typeof i[k]!=='number'||!Number.isFinite(i[k]))throw Error(`Enter a finite value for ${fields[k][0].toLowerCase()}.`);
 if(i.steam<=0||i.steam>1e7)throw Error('Steam generation must be greater than zero and at most 10 million kg/h.');
 if(i.tds<0||i.limit<=i.tds||i.limit>10000)throw Error('Boiler TDS must exceed makeup TDS and be no more than 10,000 ppm.');
 if(i.return<0||i.return>=100)throw Error('Condensate return must be between 0% and less than 100%.');
 if(i.boiler<=0||i.boiler>60||i.flash<0||i.flash>i.boiler)throw Error('Use 0 < boiler pressure ≤ 60 bar(g), with flash pressure between zero and boiler pressure.');
 if(i.cold<.01||i.cold>=95||i.maxMakeup<=i.cold||i.maxMakeup>95)throw Error('Use makeup inlet ≥ 0.01°C and a maximum heated makeup temperature above inlet and ≤ 95°C.');
 if(i.U<=0||i.U>10000||i.efficiency<=0||i.efficiency>100||i.use<0||i.use>100)throw Error('Enter U between 0 and 10,000 W/(m²·K), efficiency > 0 to 100%, and flash availability 0 to 100%.');
 if(i.hours<0||i.hours>8784||['fuel','capital','maintenance','pump','electric'].some(k=>i[k]<0)||i.escalation< -20||i.escalation>30||i.discount<0||i.discount>30)throw Error('Check economic inputs: nonnegative costs, hours ≤ 8,784, escalation -20 to 30%, and discount 0 to 30%.');
 const b=saturated(i.boiler),f=saturated(i.flash),hc=liquidH(i.cold);
 if(i.drain<=i.cold||i.drain>f.t)throw Error(`Drain target must exceed makeup inlet and be no greater than flash saturation temperature (${f.t.toFixed(2)}°C).`);
 const blow=i.steam*(1-i.return/100)*i.tds/(i.limit-i.tds),makeup=i.steam*(1-i.return/100)+blow;
 const flashFraction=(b.hf-f.hf)/f.hfg,flashMass=blow*flashFraction,residual=blow-flashMass;
 const hx=residual*(f.hf-liquidH(i.drain))/3600,hxOut=liquidT(hc+hx*3600/makeup);
 if(hxOut>i.maxMakeup+1e-8)throw Error('The selected drain target overheats the makeup stream. Raise the drain target or increase the allowable makeup temperature.');
 const coldCp=hx>0?(liquidH(hxOut)-hc)/(hxOut-i.cold):4.18,hotCp=i.drain<f.t?(f.hf-liquidH(i.drain))/(f.t-i.drain):4.18;
 const cHot=residual*hotCp/3600,cCold=makeup*coldCp/3600,cMin=Math.min(cHot,cCold),cr=cMin/Math.max(cHot,cCold);
 const effectiveness=cMin>0?hx/(cMin*(f.t-i.cold)):0,ntu=shellNTU(effectiveness,cr),area=cMin*1000*ntu/i.U;
 // Flash heats the same makeup AFTER the liquid-liquid HX through an indirect condenser.
 // Only latent heat is credited. No flash-condensate mass or sensible-heat recovery is assumed.
 const flashPotential=flashMass*f.hfg/3600,flashHeat=Math.max(0,Math.min(flashPotential*i.use/100,makeup*(liquidH(i.maxMakeup)-liquidH(hxOut))/3600));
 const makeupOut=liquidT(hc+(hx+flashHeat)*3600/makeup),usedFlash=flashHeat*3600/f.hfg;
 const waste=blow*(b.hf-hc)/3600,unrecovered=Math.max(0,waste-hx-flashHeat),drainHeat=residual*(liquidH(i.drain)-hc)/3600;
 const vaporVolume=flashMass*f.vg,separatorArea=vaporVolume/3600/3,separatorDiameter=Math.sqrt(4*separatorArea/Math.PI);
 const recovered=hx+flashHeat,fuelMMBtu=recovered*i.hours*3.412141633/1000/(i.efficiency/100),fuelSavings=fuelMMBtu*i.fuel,auxiliary=i.pump*i.hours*i.electric,net=fuelSavings-auxiliary-i.maintenance;
 let cash=-i.capital,npv=-i.capital;const cashflow=[{year:0,cash,discounted:npv}];for(let y=1;y<=10;y++){const annual=fuelSavings*(1+i.escalation/100)**(y-1)-auxiliary-i.maintenance;cash+=annual;npv+=annual/(1+i.discount/100)**y;cashflow.push({year:y,cash,discounted:npv});}
 const warnings=[];
 if(i.tds>=500||i.tds/i.limit>.15)warnings.push('High makeup TDS or a large makeup-to-boiler TDS ratio: review pretreatment/RO with your water-treatment specialist. These screening thresholds are not ABMA feedwater limits; softening alone does not remove TDS.');
 if(i.limit>abmaReference(i.boiler))warnings.push('Selected boiler TDS exceeds the historical ABMA reference reported by the National Board for this pressure. Confirm the approved limit with the boiler manufacturer and water-treatment specialist.');
 if(flashFraction<.02)warnings.push('Less than 2% flash steam: flash pressure is too close to boiler pressure for substantial flash recovery. Confirm pressure drop and backpressure.');
 if(flashHeat+1e-8<flashPotential*i.use/100)warnings.push('Makeup temperature limit caps flash recovery. Unused flash energy remains in the loss stream; savings are not credited for it.');
 if(i.drain>43.33334)warnings.push('Residual discharge is above 110°F / 43.3°C. Check the local drain limit and allow for a suitable cooling/discharge system. This is a screening temperature, not a universal legal limit.');
 if(net<=0)warnings.push('Annual operating savings do not cover the entered maintenance and auxiliary electricity costs.');
 if(blow===0)warnings.push('Zero makeup TDS gives zero TDS-controlled blowdown in this ideal balance. Required sludge/bottom blowdown and other chemistry controls are not modeled.');
 return {b,f,hc,blow,makeup,blowPercent:blow/makeup*100,feedPercent:blow/(i.steam+blow)*100,flashFraction,flashMass,residual,hx,hxOut,flashPotential,flashHeat,usedFlash,makeupOut,waste,unrecovered,drainHeat,vaporVolume,separatorDiameter,area,ntu,cr,effectiveness,recovered,fuelMMBtu,fuelSavings,auxiliary,net,cashflow,npv,payback:net>0&&i.capital>0?i.capital/net:null,roi:i.capital>0?net/i.capital*100:null,warnings};
}
// Independent conservation checks + inverse shell performance, separate from the solver above.
export function audit(i,r){
 const near=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(a),Math.abs(b));
 const make=(i.steam-i.steam*i.return/100)/(1-i.tds/i.limit),blow=make*i.tds/i.limit;
 const vapor=(blow*r.b.hf-blow*r.f.hf)/(r.f.hg-r.f.hf);
 const checks=[near(r.blow,blow),near(r.makeup,make),near(r.flashMass,vapor),near(r.flashFraction,(r.b.hf-r.f.hf)/(r.f.hg-r.f.hf)),near(blow*r.b.hf,vapor*r.f.hg+(blow-vapor)*r.f.hf),near(r.hx*3600,r.residual*(r.f.hf-liquidH(i.drain))),near(r.hx*3600,make*(liquidH(r.hxOut)-liquidH(i.cold))),near(r.flashHeat,r.usedFlash*r.f.hfg/3600),near(r.waste,r.recovered+r.unrecovered),near(r.recovered*3600,make*(liquidH(r.makeupOut)-liquidH(i.cold))),near(shellEffectiveness(r.ntu,r.cr),r.effectiveness),near(r.net,r.fuelSavings-r.auxiliary-i.maintenance)];
 return checks.every(Boolean)?10:0;
}
export const notes=[
 'Steady continuous surface blowdown only; dry steam and returned process condensate contain negligible dissolved solids. Treatment-chemical solids, carryover, sludge and intermittent bottom blowdown are excluded. B = S(1-r)Cm/(Cb-Cm); M = S(1-r)+B. B/M = Cm/Cb. Percent makeup is not percent feedwater.',
 'Boiler TDS is a user-approved operating limit, not automatically selected. Historical ABMA values are cited as reported by the National Board (1999); consult current manufacturer guidance and water chemistry, including silica, alkalinity and hardness. The default is an example, not an operating recommendation.',
 'Pressures are gauge; atmospheric pressure is fixed at 1.01325 bar. Saturation properties use a 0.25°C numerical table generated from CoolProp IF97. Liquid enthalpy is approximated by saturated-liquid enthalpy at the same temperature, neglecting the small compressed-liquid pressure correction. Dissolved-solids effects on properties are neglected.',
 'Flash fraction = (hf,boiler - hf,flash)/hfg,flash, assuming adiabatic throttling and equilibrium separation. All generated vapor counts toward flash-vessel flow, including any unused vapor. Diameter shown is only a vapor-disengagement screen at 3 m/s, not a vessel selection or pressure-vessel design.',
 'The residual liquid stays at flash-vessel pressure through the liquid-liquid exchanger; pressure reduction occurs downstream to avoid secondary flashing in the exchanger. The makeup stream first passes through this exchanger, then an indirect flash-steam condenser. Flash condensate is NOT returned to the boiler in this model.',
 'One shell pass and two tube passes: duty follows selected drain temperature; secant heat capacities preserve the enthalpy balance. Area = NTU*Cmin/U using the shell-and-tube effectiveness relation. U is a user-entered fouled value. Final area, tube velocity, fouling, corrosion allowance, pressure drop, traps and materials require vendor design. The flash condenser area is not included in the liquid-liquid HX area.',
 'Only captured flash latent heat is credited, capped by remaining makeup heating demand. Flash-condensate sensible heat, unused vapor and residual liquid heat remain in drain/unused losses. Waste heat is referenced to incoming makeup enthalpy, so the three diagram branches sum to 100%. No condensate water-reuse savings are claimed.',
 'Continuous coincident makeup and blowdown flow is assumed. Annual useful heat replaces fuel at the entered boiler efficiency; efficiency and fuel-price heating-value bases must match. Net savings subtract auxiliary electricity and annual maintenance. Installed cost includes the controller, flash vessel, condenser, exchanger and installation.',
 'The 10-year chart shows cumulative undiscounted cash and discounted cash (NPV), beginning with installed cost at year zero. Fuel price alone escalates; operating hours and other annual costs stay fixed. Simple payback uses year-one net savings. Taxes, financing, incentives, replacements and automatic-controller water/chemical savings are excluded.',
 'This is a preliminary thermal/economic sizing estimate, not an ABMA certification or a stamped mechanical design. Verify actual load coincidence, water chemistry, controls, drain conditions and pressure-vessel requirements before equipment selection.'
];
