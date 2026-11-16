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
function wireImages(root=document) { $$('img',root).forEach(img=>{const handle=()=>{if(img.naturalWidth===0)img.parentElement.classList.add('img-error');};img.addEventListener('error',handle);img.addEventListener('load',()=>img.parentElement.classList.remove('img-error'));if(img.complete)handle();}); }
wireImages();

// Keep the navigation within the opening photograph; restore a solid surface on scroll.
const siteHeader = document.querySelector('.header');
const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 45);
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
