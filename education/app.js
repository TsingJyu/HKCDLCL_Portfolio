'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const nav = $('#main-nav');
const menuButton = $('.menu-toggle');
function closeMenu() { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', '開啟選單'); }
menuButton.addEventListener('click', () => { const expanded = menuButton.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open', expanded); menuButton.setAttribute('aria-expanded', String(expanded)); menuButton.setAttribute('aria-label', expanded ? '關閉選單' : '開啟選單'); });
$$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
matchMedia('(min-width:1001px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const details = {
 workshop: { label:'文化教育 · 嶺先團隊項目 · 2024 年暑期', title:'嶺南大學影視實習工作坊', image:'project-08.webp', alt:'影視實習工作坊參與者合影', body:'我們參與工作坊的策劃與課程設計，以及授課安排和現場執行。課程涵蓋數字人文與新媒體創作，也包括攝影燈光及後期剪輯。', role:'課程設計 / 授課安排 / 現場執行' },
 poetry: { label:'文化內容 · 嶺先團隊項目', title:'《如何閱讀中國詩歌》', body:'我們參與詩歌講解影片製作，包括拍攝與剪輯、字幕及視覺包裝，並負責頻道運營。', role:'拍攝與剪輯 / 視覺包裝 / 頻道運營' },
 museum: { label:'文博展示 · 嶺先團隊項目', title:'博物館文化周', image:'project-03.webp', alt:'博物館文化周主視覺', body:'我們受託為香港大學中文學院「博物館文化周」及相關項目製作主視覺與活動網站。', role:'主視覺設計 / 網站設計與搭建' }
};
const dialog = $('#detail-dialog');
let detailTrigger = null;
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openDetail(key, trigger) {
  const d = details[key]; if (!d) return;
  detailTrigger = trigger;
  $('#detail-content').innerHTML = `${d.image ? `<img class="dialog-hero" src="assets/${d.image}" alt="${escapeHtml(d.alt)}">` : ''}<div class="detail-body"><div class="detail-eyebrow">${escapeHtml(d.label)}</div><h2 id="detail-title">${escapeHtml(d.title)}</h2><p>${escapeHtml(d.body)}</p><div class="case-role"><span>我們的工作</span><p>${escapeHtml(d.role)}</p></div></div>`;
  dialog.showModal(); dialog.scrollTop = 0; document.body.style.overflow = 'hidden';
  wireImages(dialog);
}
function closeDetail() { dialog.close(); }
dialog.addEventListener('close', () => { document.body.style.overflow = ''; if (detailTrigger?.isConnected) detailTrigger.focus({preventScroll:true}); });
$('.dialog-close').addEventListener('click', closeDetail);
dialog.addEventListener('click', event => { if(event.target === dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDetail();} });
$$('[data-detail]').forEach(b => b.addEventListener('click', () => openDetail(b.dataset.detail, b)));
const journeys = {
 culture: { image:'study-ceramics.webp', alt:'陶瓷工藝手作活動', topic:'文化觀察 · 工藝體驗', title:'文化與工藝研學', description:'我們以城市文化及傳統工藝為研學主題，結合現場觀察與陶瓷手作，讓學生認識工藝與日常生活的關係。' },
 science: { image:'study-space.webp', alt:'航天博物館展覽', topic:'航天探索 · 科學觀察', title:'航天與航空科普', description:'我們以航天博物館及航空科普參訪為主題，讓學生觀察實物與展覽，了解課堂知識在科學技術中的應用。' },
 career: { image:'study-hongkong.webp', alt:'香港校園探索活動', topic:'校園探索 · 生涯體驗', title:'香港校園探索', description:'我們透過香港校園參訪及交流，讓學生接觸不同學科與學習環境，了解升學方向。' }
};
function selectJourney(key, focus = false) {
 const data = journeys[key]; if(!data) return;
 $$('.journey-tabs [role=tab]').forEach(tab => { const selected=tab.dataset.journey===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus(); });
 $('#journey-panel').setAttribute('aria-labelledby',`tab-${key}`);
 $('#journey-image').src=`assets/${data.image}`;$('#journey-image').alt=data.alt;
 $('#journey-topic').textContent=data.topic;$('#journey-title').innerHTML=data.title;
 $('#journey-description').textContent=data.description;
}
const tabs=$$('.journey-tabs [role=tab]');tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectJourney(tab.dataset.journey));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectJourney(tabs[next].dataset.journey,true);});});
function wireImages(root=document) { $$('img',root).forEach(img=>{const handle=()=>{if(img.naturalWidth===0)img.parentElement.classList.add('img-error');};img.addEventListener('error',handle);img.addEventListener('load',()=>img.parentElement.classList.remove('img-error'));if(img.complete)handle();}); }
wireImages();

// Keep the navigation within the opening photograph; restore a solid surface on scroll.
const siteHeader = document.querySelector('.header');
const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 45);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
