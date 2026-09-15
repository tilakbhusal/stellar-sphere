// Browser-only PDF export. The caller supplies a frozen input/result/chart snapshot.
export async function exportPsychrometricReport({inputs,outputs,notes,chart,imperial}) {
  const {jsPDF}=await import('jspdf');
  const doc=new jsPDF({compress:true});
  let y=47;
  const header=title=>{
    doc.setFillColor(9,29,45);doc.rect(0,0,210,35,'F');
    doc.setTextColor(255);doc.setFontSize(10);
    doc.text('TILAK BHUSAL  /  ENGINEERING TOOLS',15,13);
    doc.setFontSize(18);doc.text(title,15,25);
    doc.setTextColor(25,45,60);y=47;
  };
  const paragraph=text=>{
    doc.setFontSize(9);
    const lines=doc.splitTextToSize(text,178);
    if(y+lines.length*4.5>275){doc.addPage();header('Psychrometric analysis / continued');}
    doc.text(lines,16,y);y+=lines.length*4.5+4;
  };
  const table=(title,rows)=>{
    paragraph(title);
    for(const [label,value] of rows){
      if(y>266){doc.addPage();header('Psychrometric analysis / continued');}
      doc.setFillColor(240,245,247);doc.rect(15,y-4,180,9,'F');
      doc.setFontSize(9);doc.text(label,18,y+1);
      doc.text(String(value),192,y+1,{align:'right'});y+=10;
    }
    y+=6;
  };
  header('Psychrometric Engineering Report');
  paragraph(`Generated ${new Date().toISOString()} | tilakbhusal.com | ${imperial?'Imperial':'SI'} units`);
  table('01 / INPUT CONDITIONS',inputs);
  table('02 / CALCULATED AIR PROPERTIES',outputs);
  doc.addPage();header('Psychrometric chart & assumptions');
  // Normalize the snapshot for legibility on white, independently of UI theme.
  chart.setAttribute('xmlns','http://www.w3.org/2000/svg');
  chart.setAttribute('width','1920');chart.setAttribute('height','1010');
  chart.querySelectorAll('text').forEach(n=>{
    n.setAttribute('fill','#253d52');n.setAttribute('font-family','Arial');n.setAttribute('font-size','11');
  });
  const colors={'#b4e5ff':'#12649a','#4aafff':'#2882af','#ffd17d':'#b46c00','#fff4d9':'#784600','#ffe4a0':'#956800','#cda1ff':'#8558a6','#bdcede':'#60758a'};
  for(const attr of ['stroke','fill'])chart.querySelectorAll(`[${attr}]`).forEach(n=>{
    const replacement=colors[n.getAttribute(attr)];if(replacement)n.setAttribute(attr,replacement);
  });
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(chart)],{type:'image/svg+xml'}));
  try{
    const img=new Image();img.src=url;await img.decode();
    const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1010;
    const context=canvas.getContext('2d');context.fillStyle='white';context.fillRect(0,0,1920,1010);context.drawImage(img,0,0);
    doc.addImage(canvas.toDataURL('image/png'),'PNG',12,y,186,98,undefined,'FAST');
  }finally{URL.revokeObjectURL(url);}
  y+=105;
  paragraph('CHART LEGEND');
  paragraph('Red: dry-bulb grid. Green: humidity-ratio grid. Blue: relative humidity curves. Amber marker: calculated air state. Optional purple dashed lines: enthalpy; gold dotted lines: wet-bulb temperature.');
  paragraph('03 / ASSUMPTIONS & CALCULATION BASIS');
  notes.forEach(paragraph);
  paragraph('Sources: ASHRAE Handbook - Fundamentals; PsychroLib 2.5.0 equation references (psychrometrics.github.io/psychrolib/api_docs.html).');
  for(let page=1;page<=doc.getNumberOfPages();page++){
    doc.setPage(page);doc.setFontSize(8);doc.setTextColor(95);
    doc.text(`Engineering analysis | Page ${page} of ${doc.getNumberOfPages()}`,15,289);
  }
  doc.save('psychrometric-engineering-report.pdf');
}
