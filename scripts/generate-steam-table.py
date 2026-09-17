"""Regenerate numerical property data: pip install CoolProp==8.0.0.
Uses the IF97 backend, not a copied proprietary steam table.
"""
import json
from pathlib import Path
import CoolProp
from CoolProp.CoolProp import PropsSI
rows=[]
for n in range(1201):
    c=max(.01,n/4)
    t=c+273.15
    rows.append([c,PropsSI('P','T',t,'Q',0,'IF97::Water')/1e5,
        PropsSI('H','T',t,'Q',0,'IF97::Water')/1000,
        PropsSI('H','T',t,'Q',1,'IF97::Water')/1000,
        1/PropsSI('D','T',t,'Q',1,'IF97::Water')])
p=Path(__file__).resolve().parents[1]/'src/lib/steam-table.json'
p.write_text(json.dumps({'source':f'CoolProp {CoolProp.__version__}, IF97::Water; T in C, absolute P in bar, h in kJ/kg, vg in m3/kg','rows':[[round(v,10) for v in row] for row in rows]},separators=(',',':'))+'\n')
print(p, p.stat().st_size)
