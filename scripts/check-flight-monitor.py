"""Validate recorded flight quotes before publishing; does not fetch prices."""
import json, math
from pathlib import Path
from datetime import datetime
p=Path(__file__).resolve().parents[1]/'nordic-v2/flight-monitor.json'
d=json.loads(p.read_text())
expected={'pvg-hel':('2027-02-06',12282),'hel-tos':('2027-02-07',4530),'tos-kef':('2027-02-14',2974),'kef-cph':('2027-02-19',3384),'cph-pvg':('2027-02-20',8752)}
assert d['passengers']==2 and d['schemaVersion']==1
assert len(d['flights'])==5 and {f['id'] for f in d['flights']}==set(expected)
for f in d['flights']:
 assert (f['date'],f['budgetCny'])==expected[f['id']], f['id']
 for q in f['history']+([f['latest']] if f.get('latest') else []):
  assert datetime.fromisoformat(q['checkedAt']).tzinfo
  assert all(isinstance(q[k],(int,float)) and not isinstance(q[k],bool) and math.isfinite(q[k]) and q[k]>0 for k in ['amount','cny'])
  assert q['currency'] in ['CNY','USD','HKD','ISK','EUR','NOK','DKK']
  assert q['seats'] is None or type(q['seats']) is int and q['seats']>=0
  assert q['url'].startswith('https://') and all(q.get(k) for k in ['provider','fare','baggage','seatsNote'])
  assert all(k not in q['url'].lower() for k in ['shoppingid','sid=','token=','cookie','sessionid'])
 if f.get('latest'): assert f['latest'] in f['history'], 'Latest must be preserved in history'
 for q in ([f['ctrip']] if f.get('ctrip') else [])+f.get('ctripHistory',[]):
  assert datetime.fromisoformat(q['checkedAt']).tzinfo
  assert q['baseCny']>0 and math.isfinite(q['baseCny'])
  assert abs(q['baseCny']/d['passengers']-q['perPersonCny'])<.01
  assert q.get('seats') is None or type(q['seats']) is int and q['seats']>=0
  assert q['url'].startswith('https://flights.ctrip.com/')
 g=f['google']
 assert g['judgment'] in [None,'低','正常','高']
 assert datetime.fromisoformat(g['checkedAt']).tzinfo
 assert g.get('judgmentScope') in [None,'route','flight']
 assert g['baseCny'] is None or math.isfinite(g['baseCny']) and g['baseCny']>0
 if g.get('typicalRange') is not None: assert len(g['typicalRange'])==2 and 0<g['typicalRange'][0]<g['typicalRange'][1]
 if g.get('status')=='no_matching_itinerary': assert g['baseCny'] is None and g['judgment'] is None
 if g.get('judgmentScope')=='route': assert g.get('insightUrl','').startswith('https://www.google.com/travel/flights/')
print('Validated 5 routes: prices, budgets, timestamps, baggage, inventory, and source links.')
