// Lazy-loaded report writer; the caller passes an immutable scenario snapshot.
export async function exportPowerFactorReport({i,r,inputs,charts,notes,tariff}){
 const {jsPDF}=await import('jspdf');const doc=new jsPDF({compress:true});let y=47;
 const f=(v,d=3)=>v===null?'Unavailable':v.toLocaleString('en-US',{maximumFractionDigits:d});
 const header=title=>{doc.setFillColor(9,29,45);doc.rect(0,0,210,35,'F');doc.setTextColor(255);doc.setFontSize(10);doc.text('TILAK BHUSAL  /  ENGINEERING TOOLS',15,13);doc.setFontSize(18);doc.text(title,15,25);doc.setTextColor(25,45,60);y=47;};
 const line=text=>{doc.setFontSize(9);const lines=doc.splitTextToSize(text,178);if(y+lines.length*4.3>276){doc.addPage();header('Electrical analysis / continued');}doc.text(lines,16,y);y+=lines.length*4.3+4;};
 const table=(title,rows)=>{line(title);for(const [a,b] of rows){if(y>266){doc.addPage();header('Electrical analysis / continued');}doc.setFillColor(240,245,247);doc.rect(15,y-4,180,8,'F');doc.setFontSize(8.5);doc.text(a,18,y+1);doc.text(String(b),192,y+1,{align:'right'});y+=9;}y+=4;};
 header('Power Factor Correction Report');line(`Generated ${new Date().toISOString()} | Model 1.0 | tilakbhusal.com`);
 line(`Billing: ${tariff}. Meter PF: ${i.basis}. Harmonics: ${i.advanced?'modeled':'not evaluated'}. AHF: ${i.advanced&&i.filter?'included':'not included'}.`);
 table('01 / INPUTS & COST ASSUMPTIONS',inputs);
 doc.addPage();header('Sizing & financial analysis');
 table('02 / REACTIVE COMPENSATION & SYSTEM PERFORMANCE',[
 ['Peak capacitor compensation',`${f(r.bank)} kVAR`],['Operating-duty compensation',`${f(r.qc)} kVAR`],['Operating reactive power: before / after',`${f(r.q1)} / ${f(r.q2)} kVAR`],['Operating apparent power: before / after',`${f(r.s1)} / ${f(r.s2)} kVA`],['Displacement angles: before / after',`${f(r.theta1)} / ${f(r.theta2)} degrees`],['True PF: before / after',`${f(r.true1,4)} / ${f(r.true2,4)}`],['Peak transformer loading: before / after',`${f(r.loading1,1)}% / ${f(r.loading2,1)}%`],['Peak apparent capacity liberated',`${f(r.freed)} kVA`],['Feeder resistive losses: before / after',`${f(r.loss1)} / ${f(r.loss2)} kW`],['Feeder loss reduction',`${f(r.lossReduction*100)}%`],...(i.advanced?[['Peak AHF screening rating per phase',i.filter?`${f(r.filterSize)} A`:'Not included'],['Residual current THDi',`${f(r.postTHDi)}%`]]:[])]);
 table('03 / SAVINGS & SIMPLE RETURN',[
 ['Monthly modeled bill: before / after',`USD ${f(r.bill1,2)} / ${f(r.bill2,2)}`],['Avoided annual demand charges',`USD ${f(r.demandSavings,2)}`],['Annual feeder loss savings',`USD ${f(r.lossSavings,2)}`],['Annual device energy + maintenance',`USD ${f(r.deviceCost+i.maintenance,2)}`],['Net annual savings',`USD ${f(r.net,2)}`],['Simple payback',r.payback===null?'Unavailable':`${f(r.payback,2)} years`],['Annual return on installed cost',r.roi===null?'Unavailable':`${f(r.roi,1)}%`]]);
 doc.addPage();header('Power triangle & comparative plots');
 // Exact final fundamental triangle, not an intermediate animation frame.
 const sx=24,sy=114,scale=Math.min(130/i.kw,50/Math.max(1,r.q1));
 doc.setFontSize(10);doc.text('FUNDAMENTAL POWER TRIANGLE',18,y);y+=5;
 doc.setDrawColor(130,153,174);doc.setLineDashPattern([2,2],0);doc.line(sx,sy,sx+i.kw*scale,sy-r.q1*scale);doc.line(sx+i.kw*scale,sy-r.q1*scale,sx+i.kw*scale,sy);
 doc.setLineDashPattern([],0);doc.setDrawColor(20,133,154);doc.setLineWidth(.6);doc.line(sx,sy,sx+i.kw*scale,sy-r.q2*scale);doc.line(sx+i.kw*scale,sy-r.q2*scale,sx+i.kw*scale,sy);doc.setDrawColor(30,137,103);doc.line(sx,sy,sx+i.kw*scale,sy);doc.setFontSize(8);doc.text(`${f(i.kw)} kW`,sx+45,sy+6);doc.text(`${f(r.q2)} kVAR`,sx+i.kw*scale+3,sy-r.q2*scale/2);doc.text(`After: ${f(r.sFund2)} kVA fundamental | angle ${f(r.theta2)} degrees`,20,sy+14);y=137;
 async function drawSVG(svg){
  svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','1480');svg.setAttribute('height','490');
  svg.querySelectorAll('text').forEach(n=>{n.setAttribute('fill','#253d52');n.setAttribute('font-family','Arial');n.setAttribute('font-size','12');});
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
  try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=1480;canvas.height=490;const c=canvas.getContext('2d');c.fillStyle='white';c.fillRect(0,0,1480,490);c.drawImage(img,0,0);doc.addImage(canvas.toDataURL('image/png'),'PNG',12,y,186,62,undefined,'FAST');}finally{URL.revokeObjectURL(url);}y+=65;
 }
 await drawSVG(charts[1]);await drawSVG(charts[2]);
 doc.addPage();header('Assumptions & engineering checks');
 line('04 / MODEL BOUNDARIES');for(const n of notes)line(n);
 if(r.warnings.length){line('05 / SCENARIO WARNINGS');for(const w of r.warnings)line(w);}
 line('References: Eaton, Power factor correction: A guide for the plant engineer (SA02607001E); Eaton, Power Factor Correction and Harmonic Resonance: A Volatile Mix (IA02607001E).');
 for(let p=1;p<=doc.getNumberOfPages();p++){doc.setPage(p);doc.setFontSize(8);doc.setTextColor(95);doc.text(`Engineering estimate | Page ${p} of ${doc.getNumberOfPages()}`,15,289);}
 doc.save('power-factor-engineering-report.pdf');
}
