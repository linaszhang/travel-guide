'use strict';
(()=>{
 const version=new URL(location.href).searchParams.get('v')==='1'?'1':'2';
 const root=version==='2'?'../nordic-v2/':'';
 const css=document.querySelector('link[href^="style.css"]');
 css.href=root+'style.css?v=unified-10';
 const brand=document.querySelector('.mobile-brand');brand.textContent='北欧旅行计划';
 const control=()=>{const picker=document.createElement('span');picker.className='version-picker';const label=document.createElement('span');label.className='version-picker-label';label.setAttribute('aria-hidden','true');label.textContent='V'+version;const arrow=document.createElementNS('http://www.w3.org/2000/svg','svg');arrow.setAttribute('viewBox','0 0 12 12');arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<path d="m3 4.5 3 3 3-3"/>';const select=document.createElement('select');select.className='version-select';select.setAttribute('aria-label','行程版本');select.innerHTML='<option value="1">V1</option><option value="2">V2</option>';select.value=version;select.addEventListener('change',()=>changeVersion(select));picker.append(label,arrow,select);return picker;};
 async function changeVersion(select){
  const target=select.value;if(target===version)return;select.disabled=true;
  try{
   const url=new URL(location.href);url.searchParams.set('v',target);
   const parts=location.hash.slice(1).split('/');const base=target==='2'?'../nordic-v2/':'';
   if(parts[0]==='day'){
    const current=typeof days!=='undefined'?days.find(d=>d.num===Number(parts[1])):null;
    const data=await fetch(base+'data.json?v=unified-10').then(r=>{if(!r.ok)throw Error('data');return r.json()});
    const match=current&&data.flatMap(c=>c.days).find(d=>d.date.split(' · ')[0].trim()===current.date.split(' · ')[0].trim());
    url.hash=match?'#day/'+match.num:'#country/finland';
   }else if(parts[0]==='experience'){
    const data=await fetch(base+'experiences.json?v=unified-10').then(r=>{if(!r.ok)throw Error('experiences');return r.json()});
    if(!data.some(x=>x.id===parts[1]))url.hash='#budget';
   }
   location.assign(url.href);
  }catch(error){select.disabled=false;select.value=version;const status=document.getElementById('toast');if(status){status.textContent='版本切换暂时失败，请重试';status.style.display='block';setTimeout(()=>status.style.display='none',3500);}}
 }
 const title=document.createElement('div');title.className='mobile-title';brand.before(title);title.append(brand,control());
 const side=document.createElement('div');side.className='sidebar-version';side.innerHTML='<span>北欧旅行计划</span>';side.append(control());document.querySelector('.side-brand').append(side);
 window.syncVersionUI=()=>{
  const heading=document.querySelector('.home-intro h1');
  if(heading&&!heading.querySelector('.home-version')){heading.querySelector('.version-badge')?.remove();heading.querySelector('.version-select')?.remove();const badge=document.createElement('span');badge.className='home-version';badge.textContent='V'+version;heading.append(badge);}
  document.querySelectorAll('.version-select').forEach(x=>x.value=version);
 };
 const app=document.createElement('script');app.src=root+'app.js?v=unified-10';document.head.append(app);
})();
