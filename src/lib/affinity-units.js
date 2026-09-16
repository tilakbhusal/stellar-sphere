// Canonical calculation units remain SI; switching display units never mutates inputs.
// US gallon = 0.003785411784 m3; international foot = 0.3048 m.
// Mechanical horsepower; conventional inch of water = 249.08891 Pa.
export function factor(key,equipment='pump',imperial=false){
 if(!imperial)return 1;
 if(['q','bep'].includes(key))return equipment==='fan'?1/(0.3048**3*60):1/(0.003785411784*60);
 if(['h','static','shutoff'].includes(key))return equipment==='fan'?1/249.08891:1/0.3048;
 if(['npshr','npsha'].includes(key))return 1/0.3048;
 if(['d1','d2'].includes(key))return 1/25.4;
 if(key==='p')return 1/0.7456998715822702;
 return 1;
}
export const toDisplay=(key,value,equipment,imperial)=>value===null||value===''?value:value*factor(key,equipment,imperial);
export const fromDisplay=(key,value,equipment,imperial)=>value===null||value===''?value:value/factor(key,equipment,imperial);
export function unit(key,equipment='pump',imperial=false){
 if(['q','bep'].includes(key))return imperial?(equipment==='fan'?'cfm':'US gpm'):'m³/h';
 if(['h','static','shutoff'].includes(key))return equipment==='fan'?(imperial?'in. w.g.':'Pa'):(imperial?'ft':'m');
 if(['npshr','npsha'].includes(key))return imperial?'ft':'m';
 if(['d1','d2'].includes(key))return imperial?'in':'mm';
 if(key==='p')return imperial?'hp':'kW';
 return {n1:'rpm',n2:'rpm',eq:'',eh:'',ep:'',motor:'%',drive:'%',hours:'h/yr',rate:'USD/kWh'}[key]||'';
}
