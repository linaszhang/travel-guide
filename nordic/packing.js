'use strict';
(() => {
  const storageKey = 'nordic-journey:packing:v1';
  const groups = [
    {id:'documents',title:'证件与预订',items:[['passport','护照与签证'],['insurance','旅行保险与紧急联系方式'],['bookings','机票、酒店和活动预订凭证'],['licence','驾照原件与车行要求的翻译件'],['payment','信用卡与少量现金']]},
    {id:'clothing',title:'冬季衣物',items:[['base-layer','保暖内衣与打底裤'],['mid-layer','抓绒或羊毛中层'],['down-jacket','保暖羽绒服'],['shell','防风防水外套与裤子'],['boots','防水保暖鞋'],['socks','羊毛袜与备用袜'],['gloves','保暖手套'],['hat','帽子与围脖'],['daily-clothes','换洗衣物与睡衣']]},
    {id:'activities',title:'徒步、滑雪与温泉',items:[['daypack','轻便双肩包'],['traction','城市步行防滑鞋套'],['sunglasses','太阳镜'],['swimwear','泳衣'],['sandals','拖鞋与防水收纳袋'],['thermos','保温水杯']]},
    {id:'electronics',title:'电子与摄影',items:[['phone','手机与充电线'],['adapter','欧标转换插头'],['charger','多口充电器'],['power-bank','充电宝'],['camera','相机、镜头与存储卡'],['battery','备用电池'],['tripod','三脚架']]},
    {id:'personal',title:'洗漱与随身用品',items:[['toiletries','牙刷、牙膏与洗漱包'],['skin-care','保湿面霜与润唇膏'],['sunscreen','防晒用品'],['medication','个人常用药'],['tissues','纸巾与湿巾'],['laundry','脏衣袋与密封袋']]},
    {id:'driving',title:'自驾随车',items:[['rental','租车凭证与车行联系电话'],['car-charger','车载充电器与手机支架'],['offline-maps','离线地图'],['snacks','饮水与路上简餐']]}
  ];
  const ids = new Set(groups.flatMap(group => group.items.map(([id]) => id)));
  let checked = {}, storageAvailable = true;
  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const valid = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
      checked = Object.fromEntries(Object.entries(valid).filter(([id,value]) => ids.has(id) && value === true));
      storageAvailable = true;
    } catch { checked = {}; storageAvailable = false; }
  }
  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify(checked)); storageAvailable = true; }
    catch { storageAvailable = false; }
  }
  function updateProgress() {
    const page = document.querySelector('.packing-page');
    if (!page) return;
    const count = Object.keys(checked).length;
    page.querySelector('[data-packing-count]').textContent = `${count} / ${ids.size}`;
    const progress = page.querySelector('progress');
    progress.value = count;
    const message = page.querySelector('[data-packing-message]');
    message.hidden = storageAvailable;
    message.textContent = storageAvailable ? '' : '浏览器暂不允许保存，当前勾选可能无法在下次打开时保留。';
    for (const group of groups) {
      page.querySelector(`[data-packing-group="${group.id}"]`).textContent = `${group.items.filter(([id]) => checked[id]).length} / ${group.items.length}`;
    }
  }
  window.renderPacking = function () {
    readState();
    document.getElementById('main').innerHTML = `<div class="page-wrap packing-page"><header class="packing-heading"><h1>行李清单</h1></header><section class="packing-progress" aria-label="行李准备进度"><div><span>已准备</span><strong data-packing-count></strong></div><progress max="${ids.size}" value="0" aria-label="已准备的行李数量"></progress><p data-packing-message role="status" hidden></p></section><div class="packing-groups">${groups.map(group => `<section class="packing-group" aria-labelledby="packing-${group.id}"><header><h2 id="packing-${group.id}">${group.title}</h2><span data-packing-group="${group.id}"></span></header>${group.items.map(([id,label]) => `<label class="packing-item${checked[id]?' is-packed':''}"><input type="checkbox" data-packing-id="${id}"${checked[id]?' checked':''}><span>${label}</span></label>`).join('')}</section>`).join('')}</div></div>`;
    updateProgress();
  };
  document.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.matches('[data-packing-id]')) return;
    const id = input.dataset.packingId;
    if (!ids.has(id)) return;
    if (input.checked) checked[id] = true;
    else delete checked[id];
    input.closest('.packing-item').classList.toggle('is-packed', input.checked);
    saveState();
    updateProgress();
  });
  window.addEventListener('storage', event => {
    if ((event.key === storageKey || event.key === null) && document.querySelector('.packing-page')) {
      readState();
      for (const input of document.querySelectorAll('[data-packing-id]')) {
        input.checked = !!checked[input.dataset.packingId];
        input.closest('.packing-item').classList.toggle('is-packed', input.checked);
      }
      updateProgress();
    }
  });
})();
