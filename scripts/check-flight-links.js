'use strict';
// Verify emitted links against the official conversion responses, without opening an app.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('nordic-v2/app.js'),flights=JSON.parse(read('nordic-v2/flight-monitor.json')).flights;
const proof=JSON.parse(read('docs/ctrip-native-links.json'));
const helpers=source.slice(source.indexOf('function ctripSearch('),source.indexOf('async function populateBudgetFlightDetails('));
const mobile=source.split('\n').find(line=>line.startsWith('function isCtripMobileDevice()'));
const devices=[['iPhone','iPhone',5,true],['Android Mobile','Linux arm',5,true],['HarmonyOS Mobile','Linux',5,true],['Macintosh','MacIntel',5,true],['Windows NT 10.0','Win32',0,false],['Macintosh','MacIntel',0,false]];
let checked=0;
for(const [userAgent,platform,maxTouchPoints,isMobile] of devices){
 const ctx={URL,URLSearchParams,navigator:{userAgent,platform,maxTouchPoints},esc:String};
 vm.createContext(ctx);vm.runInContext(mobile+'\n'+helpers+'\nglobalThis.makeLink=ctripFlightLink;',ctx);
 for(const flight of flights){
  const html=ctx.makeLink(flight,2),attr=name=>html.match(new RegExp(' '+name+'="([^"]+)"'))[1];
  const native=attr('data-app-href'),web=attr('data-web-href'),href=attr('href');
  const official=proof.routes.filter(r=>r.id===flight.id);assert.equal(official.length,2);
  for(const record of official){assert.equal(record.handler,'AwakeSchemaService');assert.equal(native,record.nativeUrl);}
  const params=new URL(native).searchParams;
  assert.equal(new URL(native).pathname,'/flight_int_singlelist');assert.equal(params.get('c1'),'1');
  assert.equal(params.get('c4'),flight.date.replaceAll('-',''));assert.equal(params.has('c5'),false);
  assert.equal(href,isMobile?native:web);assert.equal(new URL(web).searchParams.get('ddate'),flight.date);
  assert.equal(new URL(web).searchParams.get('nop'),'2-0-0');checked++;
 }
}
console.log(`Validated ${checked} route/device combinations against 10 official native conversion results.`);
