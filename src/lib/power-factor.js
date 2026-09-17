/** Balanced three-phase, sinusoidal voltage, lagging displacement PF.
 * Fundamental reactive compensation and aggregate RMS harmonic-current model.
 * Not an IEEE 519 compliance, NEC design, or equipment selection calculation.
 */
export const defaults={kw:400,peak:500,pf:.75,target:.95,voltage:480,transformer:750,impedance:5.75,advanced:false,thdi:30,filter:true,residual:5,margin:25,tariff:'kva',basis:'true',kvaRate:12,kwRate:12,threshold:.9,hours:4000,energyRate:.12,resistance:.01,deviceLoss:.5,fixed:150,capital:18000,maintenance:200};
export const fields={kw:['Operating load active power','kW'],peak:['Monthly peak active demand','kW'],pf:['Existing displacement PF','lagging'],target:['Target displacement PF','lagging'],voltage:['Line-to-line voltage','V'],transformer:['Transformer nameplate','kVA'],impedance:['Transformer impedance','%'],thdi:['Existing current THDi','% of I₁'],residual:['Residual THDi with AHF','% of new I₁'],margin:['AHF sizing allowance','%'],kvaRate:['kVA demand rate','USD/kVA/month'],kwRate:['kW demand rate','USD/kW/month'],threshold:['No-penalty PF threshold','PF'],hours:['Annual operating hours','h/year'],energyRate:['Energy rate','USD/kWh'],resistance:['Upstream resistance per phase','Ω'],deviceLoss:['Bank / filter active losses','kW'],fixed:['Other fixed monthly charges','USD/month'],capital:['Installed project cost','USD'],maintenance:['Annual added maintenance','USD/year']};
export function validate(i){
 for(const key of Object.keys(fields))if(typeof i[key]!=='number'||!Number.isFinite(i[key]))throw Error('Enter a finite number in every numeric field.');
 for(const key of ['kw','peak','voltage','transformer','impedance'])if(i[key]<=0)throw Error(`${fields[key][0]} must be greater than zero.`);
 if(i.peak<i.kw)throw Error('Monthly peak demand must be at least the operating load.');
 for(const key of ['pf','target','threshold'])if(i[key]<=0||i[key]>1)throw Error('Power factors must be greater than 0 and at most 1.');
 if(i.target<i.pf)throw Error('Target PF must be at least the existing displacement PF.');
 for(const key of ['thdi','residual','margin','kvaRate','kwRate','hours','energyRate','resistance','deviceLoss','fixed','capital','maintenance'])if(i[key]<0)throw Error(`${fields[key][0]} cannot be negative.`);
 if(i.hours>8784)throw Error('Annual hours must be at most 8,784.');
 if(i.impedance>100||i.thdi>300||i.residual>300||i.margin>200)throw Error('Check impedance, THDi, and filter sizing allowance; values exceed the supported range.');
 if(!['kva','penalty','switch','kw'].includes(i.tariff)||!['true','displacement'].includes(i.basis))throw Error('Select a supported tariff and meter PF basis.');
}
export function calculate(i){
 validate(i);
 const theta1=Math.acos(i.pf),theta2=Math.acos(i.target);
 const q1=i.kw*Math.tan(theta1),q2=i.kw*Math.tan(theta2),qc=q1-q2;
 const sFund1=i.kw/i.pf,sFund2=i.kw/i.target;
 const ampsPerKVA=1000/(Math.sqrt(3)*i.voltage);
 const fundamental1=sFund1*ampsPerKVA,fundamental2=sFund2*ampsPerKVA;
 const harmonic1=i.advanced?fundamental1*i.thdi/100:0;
 // Capacitors do not remove harmonic amperes. AHF residual THDi is relative to NEW I1.
 const harmonic2=i.advanced&&i.filter?Math.min(harmonic1,fundamental2*i.residual/100):harmonic1;
 const amps1=Math.hypot(fundamental1,harmonic1),amps2=Math.hypot(fundamental2,harmonic2);
 const s1=amps1/ampsPerKVA,s2=amps2/ampsPerKVA,true1=i.kw/s1,true2=i.kw/s2;
 const peakFactor=i.peak/i.kw,peakS1=s1*peakFactor,peakS2=s2*peakFactor,bank=qc*peakFactor;
 const filterAmps=(harmonic1-harmonic2)*peakFactor,filterSize=filterAmps*(1+i.margin/100);
 const loss1=3*amps1**2*i.resistance/1000,loss2=3*amps2**2*i.resistance/1000;
 const lossReduction=1-amps2**2/amps1**2,lossKWh=(loss1-loss2)*i.hours,lossSavings=lossKWh*i.energyRate;
 const meter1=i.basis==='true'?true1:i.pf,meter2=i.basis==='true'?true2:i.target;
 let demand1,demand2;
 if(i.tariff==='kva'){demand1=i.peak/meter1*i.kvaRate;demand2=i.peak/meter2*i.kvaRate;}
 if(i.tariff==='penalty'){demand1=i.peak*i.kwRate*Math.max(1,i.threshold/meter1);demand2=i.peak*i.kwRate*Math.max(1,i.threshold/meter2);}
 if(i.tariff==='switch'){demand1=i.peak/meter1*i.kvaRate;demand2=i.peak*i.kwRate;}
 if(i.tariff==='kw'){demand1=demand2=i.peak*i.kwRate;}
 const demandSavings=(demand1-demand2)*12;
 const energy1=(i.kw+loss1)*i.hours/12*i.energyRate,energy2=(i.kw+loss2+i.deviceLoss)*i.hours/12*i.energyRate;
 const bill1=demand1+energy1+i.fixed,bill2=demand2+energy2+i.fixed;
 const deviceCost=i.deviceLoss*i.hours*i.energyRate,net=demandSavings+lossSavings-deviceCost-i.maintenance;
 const payback=net>0&&i.capital>0?i.capital/net:null,roi=i.capital>0?net/i.capital*100:null;
 const freed=peakS1-peakS2,loading1=peakS1/i.transformer*100,loading2=peakS2/i.transformer*100;
 const resonance=bank>0?Math.sqrt((i.transformer/(i.impedance/100))/bank):null;
 const warnings=[];
 if(loading1>100)warnings.push(`Existing peak apparent load exceeds nameplate capacity (${loading1.toFixed(1)}%). Harmonic heating may require additional derating.`);
 if(loading2>100)warnings.push(`Corrected peak load still exceeds transformer nameplate (${loading2.toFixed(1)}%). PF correction alone is insufficient.`);
 if(i.advanced&&i.thdi>0&&bank>0)warnings.push('Capacitors and harmonic-producing loads coexist: parallel resonance may amplify harmonics. Obtain a harmonic study and select a suitable detuned bank or filter. THDi alone cannot establish safety.');
 if(i.advanced&&i.thdi>0&&resonance!==null&&[3,5,7,11,13].some(h=>Math.abs(resonance-h)/h<.1))warnings.push(`Screening resonance order ${resonance.toFixed(2)} lies within 10% of a common harmonic. This transformer-only estimate ignores utility and feeder impedance; it is not a design limit.`);
 if(i.advanced&&!i.filter&&i.thdi>0)warnings.push('Capacitor-only correction retains harmonic amperes; true PF remains below displacement PF and THDi can rise as fundamental current falls.');
 if(i.target>.98)warnings.push('Near-unity target: use load-following steps and verify light-load operation to prevent leading PF and overvoltage.');
 if(i.tariff==='switch')warnings.push('kW-tariff switch is a hypothetical commercial scenario. PF correction does not automatically make this tariff available; utility approval and the full tariff are required.');
 if(i.tariff==='penalty'&&meter2<i.threshold)warnings.push('The proposed meter PF remains below the selected penalty threshold. Residual demand penalties are included.');
 if(loss1>i.kw*.1)warnings.push('Calculated feeder losses exceed 10% of load kW. Check voltage, per-phase resistance, and circuit scope; the fixed-voltage model may be unsuitable.');
 if(net<=0)warnings.push('Net annual savings are zero or negative with these costs. No positive simple payback is available.');
 const r={theta1:theta1*180/Math.PI,theta2:theta2*180/Math.PI,q1,q2,qc,bank,sFund1,sFund2,s1,s2,true1,true2,fundamental1,fundamental2,harmonic1,harmonic2,amps1,amps2,peakS1,peakS2,filterAmps,filterSize,postTHDi:harmonic2/fundamental2*100,loss1,loss2,lossReduction,lossKWh,lossSavings,demand1,demand2,demandSavings,energy1,energy2,bill1,bill2,deviceCost,net,payback,roi,freed,loading1,loading2,resonance,warnings};
 if(Object.values(r).some(v=>typeof v==='number'&&!Number.isFinite(v)))throw Error('Inputs exceed the numerical range. Use realistic electrical values.');
 return r;
}
// Independent algebraic reference: no tangent/arccos implementation reuse.
export function audit(i,r){
 const q1=i.kw*Math.sqrt(1-i.pf*i.pf)/i.pf,q2=i.kw*Math.sqrt(1-i.target*i.target)/i.target;
 const distortion1=i.advanced?i.kw/i.pf*i.thdi/100:0;
 const distortion2=i.advanced&&i.filter?Math.min(distortion1,i.kw/i.target*i.residual/100):distortion1;
 const reference={q1,q2,bank:(q1-q2)*i.peak/i.kw,s1:Math.sqrt(i.kw*i.kw+q1*q1+distortion1*distortion1),s2:Math.sqrt(i.kw*i.kw+q2*q2+distortion2*distortion2),theta1:Math.atan2(q1,i.kw)*180/Math.PI,theta2:Math.atan2(q2,i.kw)*180/Math.PI};
 return Object.entries(reference).every(([k,v])=>Number.isFinite(r[k])&&Math.abs(r[k]-v)<=1e-9*Math.max(1,Math.abs(v)))?10:0;
}
