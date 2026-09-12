(() => {
  const navigation = document.getElementById('nav');
  const menuButton = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  const art = document.getElementById('letterArt');
  const heroImage = art.querySelector('h1 img');
  const preview = document.getElementById('workPreview');
  const previewImage = document.getElementById('previewImage');
  const toggle = document.getElementById('effectToggle');
  const closePreview = document.getElementById('closePreview');
  const manifest = JSON.parse(document.getElementById('collageData').textContent);
  const mask = Uint8Array.from(atob(manifest.mask), character => character.charCodeAt(0));
  document.body.appendChild(preview);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const geometry = document.querySelector('.page-geometry');
  let lightFrame = 0;
  let lightTargetX = 0;
  let lightTargetY = 0;
  let lightCurX = 0;
  let lightCurY = 0;
  let lightVX = 0;
  let lightVY = 0;
  let lightFollowFrame = 0;
  let lightFollowLast = 0;
  let lightInitialized = false;
  let browsing = false;
  let activeIndex = -1;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let previewX = 0;
  let previewY = 0;
  let previewVX = 0;
  let previewVY = 0;
  let targetX = 0;
  let targetY = 0;
  let followFrame = 0;
  let followLast = 0;
  const motionToggle = document.getElementById('motionToggle');
  let motionPaused = false;
  let heroVisible = true;

  function updateMotion() {
    art.classList.toggle('motion-paused', motionPaused || reducedMotion.matches);
    art.classList.toggle('offscreen', !heroVisible || document.hidden);
    motionToggle.disabled = reducedMotion.matches;
    motionToggle.setAttribute('aria-pressed', String(motionPaused || reducedMotion.matches));
    motionToggle.textContent = reducedMotion.matches ? '已減少動態' : motionPaused ? '播放微動效' : '暫停微動效';
  }
  motionToggle.addEventListener('click', () => {
    motionPaused = !motionPaused;
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      updateMotion();
    });
    heroObserver.observe(art);
  }
  updateMotion();

  function resetLight() {
    if (lightFrame) cancelAnimationFrame(lightFrame);
    lightFrame = 0;
    if (lightFollowFrame) cancelAnimationFrame(lightFollowFrame);
    lightFollowFrame = 0;
    lightInitialized = false;
    geometry.style.setProperty('--light-opacity', '0');
  }
  function applyLightTransform() {
    geometry.style.setProperty('--light-x', `${lightCurX}px`);
    geometry.style.setProperty('--light-y', `${lightCurY}px`);
  }
  function lightTick(now) {
    if (!lightFollowLast) lightFollowLast = now;
    let dt = (now - lightFollowLast) / 1000;
    lightFollowLast = now;
    if (dt > 0.064) dt = 0.064;
    // critically damped spring, ~0.24s response, x/y independent
    const omega = 2 * Math.PI / 0.24;
    const stiffness = omega * omega;
    const damping = 2 * omega;
    lightVX += (stiffness * (lightTargetX - lightCurX) - damping * lightVX) * dt;
    lightVY += (stiffness * (lightTargetY - lightCurY) - damping * lightVY) * dt;
    lightCurX += lightVX * dt;
    lightCurY += lightVY * dt;
    applyLightTransform();
    const settled = Math.abs(lightTargetX - lightCurX) < 0.5 && Math.abs(lightTargetY - lightCurY) < 0.5 && Math.abs(lightVX) < 1 && Math.abs(lightVY) < 1;
    if (settled) {
      lightFollowFrame = 0;
      lightCurX = lightTargetX;
      lightCurY = lightTargetY;
      applyLightTransform();
    } else {
      lightFollowFrame = requestAnimationFrame(lightTick);
    }
  }
  function startLightFollow() {
    if (!lightInitialized) {
      lightInitialized = true;
      lightCurX = lightTargetX;
      lightCurY = lightTargetY;
      lightVX = 0;
      lightVY = 0;
      applyLightTransform();
    }
    if (!lightFollowFrame) {
      lightFollowLast = 0;
      lightFollowFrame = requestAnimationFrame(lightTick);
    }
  }
  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
    lightTargetX = event.clientX;
    lightTargetY = event.clientY;
    geometry.style.setProperty('--light-opacity', '1');
    if (lightFrame) return;
    lightFrame = requestAnimationFrame(() => {
      lightFrame = 0;
      startLightFollow();
    });
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetLight);
  reducedMotion.addEventListener('change', resetLight);

  function updateNavigation() {
    navigation.classList.toggle('scrolled', window.scrollY > 40);
  }
  updateNavigation();

  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '開啟選單');
    menuButton.textContent = '☰';
    document.body.style.overflow = '';
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu(true);
    menu.hidden = false;
    menu.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', '關閉選單');
    menuButton.textContent = '✕';
    document.body.style.overflow = 'hidden';
    menu.querySelector('a').focus();
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const section = document.querySelector(link.getAttribute('href'));
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }));
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key !== 'Tab') return;
    const focusable = [menuButton, ...menu.querySelectorAll('a')];
    const index = focusable.indexOf(document.activeElement);
    const next = (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
    event.preventDefault();
    focusable[next].focus();
  });

  const projects = manifest.photos.map(source => {
    const image = Array.from(document.querySelectorAll('.gallery img, .about-fig img')).find(item => item.getAttribute('src') === source);
    const project = image?.closest('.project');
    const metadata = {};
    project?.querySelectorAll('.meta .row').forEach(row => {
      metadata[row.querySelector('b').textContent.trim()] = row.querySelector('span').textContent.trim();
    });
    const title = project?.querySelector('h4').innerText.replace(/\s+/g, ' ').trim() || image?.alt || '項目影像';
    return { source, title, date: metadata['時間'] || '待確認', caption: image?.closest('figure').querySelector('figcaption')?.textContent || '項目照片', alt: image?.alt || title };
  });
  function hidePreview() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    stopFollow();
    browsing = false;
    preview.hidden = true;
    art.classList.remove('preview-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '查看拼圖作品 <span>＋</span>';
    closePreview.hidden = true;
  }
  function applyPreviewTransform() {
    preview.style.transform = `translate3d(${previewX}px, ${previewY}px, 0)`;
  }
  function snapPreview() {
    previewX = targetX;
    previewY = targetY;
    previewVX = 0;
    previewVY = 0;
    applyPreviewTransform();
  }
  function stopFollow() {
    if (followFrame) cancelAnimationFrame(followFrame);
    followFrame = 0;
    followLast = 0;
  }
  function followTick(now) {
    if (!followLast) followLast = now;
    let dt = (now - followLast) / 1000;
    followLast = now;
    if (dt > 0.064) dt = 0.064; // clamp after tab switches to avoid a jump
    // critically damped spring: damping ratio 1.0, response ~0.3s
    const omega = 2 * Math.PI / 0.3;
    const stiffness = omega * omega;
    const damping = 2 * omega;
    previewVX += (stiffness * (targetX - previewX) - damping * previewVX) * dt;
    previewVY += (stiffness * (targetY - previewY) - damping * previewVY) * dt;
    previewX += previewVX * dt;
    previewY += previewVY * dt;
    applyPreviewTransform();
    const settled = Math.abs(targetX - previewX) < 0.5 && Math.abs(targetY - previewY) < 0.5 && Math.abs(previewVX) < 1 && Math.abs(previewVY) < 1;
    if (settled) {
      followFrame = 0;
      previewX = targetX;
      previewY = targetY;
      applyPreviewTransform();
    } else {
      followFrame = requestAnimationFrame(followTick);
    }
  }
  function startFollow() {
    if (browsing || reducedMotion.matches || !finePointer.matches) return snapPreview();
    if (!followFrame) {
      followLast = 0;
      followFrame = requestAnimationFrame(followTick);
    }
  }
  function placePreview(horizontal, vertical) {
    const margin = 16;
    const bounds = art.getBoundingClientRect();
    let left = horizontal + 24;
    let top = vertical - preview.offsetHeight * .4;
    if (left + preview.offsetWidth > window.innerWidth - margin) left = horizontal - preview.offsetWidth - 24;
    if (browsing || reducedMotion.matches || !finePointer.matches) {
      left = (window.innerWidth - preview.offsetWidth) / 2;
      top = bounds.top + Math.max(30, (bounds.height - preview.offsetHeight) / 2);
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - preview.offsetWidth - margin));
    const minimumTop = Math.max(margin, navigation.getBoundingClientRect().bottom + 12);
    top = Math.max(minimumTop, Math.min(top, window.innerHeight - preview.offsetHeight - margin));
    targetX = left;
    targetY = top;
  }
  function showPreview(index, announce = false) {
    if (index !== activeIndex) {
      const project = projects[index];
      activeIndex = index;
      previewImage.alt = project.alt;
      previewImage.src = project.source;
      previewImage.hidden = false;
      preview.querySelector('.preview-error').hidden = true;
      document.getElementById('previewTitle').textContent = project.title;
      document.getElementById('previewDate').textContent = project.date;
      document.getElementById('previewDateLabel').textContent = project.date === '待確認' ? '日期' : '項目期間';
      document.getElementById('previewCaption').textContent = project.caption;
      document.getElementById('previewCount').textContent = `${String(index + 1).padStart(2, '0')} / ${projects.length}`;
    }
    const wasHidden = preview.hidden;
    preview.hidden = false;
    art.classList.add('preview-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (announce) {
      closePreview.hidden = false;
      toggle.innerHTML = '下一張作品 <span>→</span>';
      document.getElementById('previewStatus').textContent = `${projects[index].title}，項目期間：${projects[index].date}`;
    }
    placePreview(pointerX, pointerY);
    if (wasHidden || browsing || reducedMotion.matches || !finePointer.matches) snapPreview();
    else startFollow();
  }
  function hitTest(horizontal, vertical) {
    const bounds = heroImage.getBoundingClientRect();
    const scale = Math.min(bounds.width / manifest.width, bounds.height / manifest.height);
    const left = bounds.left + (bounds.width - manifest.width * scale) / 2;
    const top = bounds.top + (bounds.height - manifest.height * scale) / 2;
    const imageX = (horizontal - left) / scale;
    const imageY = (vertical - top) / scale;
    if (imageX < 0 || imageY < 0 || imageX >= manifest.width || imageY >= manifest.height) return -1;
    const pixel = Math.floor(imageY / 4) * manifest.maskWidth + Math.floor(imageX / 4);
    if (!(mask[pixel >> 3] & (1 << (pixel & 7)))) return -1;
    if (imageX % 300 >= 298 || imageY % 205 >= 203) return -1;
    return Math.floor(imageY / 205) * manifest.columns + Math.floor(imageX / 300);
  }
  toggle.addEventListener('click', () => {
    const next = browsing ? (activeIndex + 1) % projects.length : 0;
    browsing = true;
    showPreview(next, true);
  });
  closePreview.addEventListener('click', () => {
    hidePreview();
    toggle.focus({ preventScroll: true });
  });
  previewImage.addEventListener('error', () => {
    previewImage.hidden = true;
    preview.querySelector('.preview-error').hidden = false;
  });
  art.addEventListener('pointermove', event => {
    if (!finePointer.matches || browsing) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = hitTest(pointerX, pointerY);
      if (index < 0) hidePreview();
      else showPreview(index);
    });
  }, { passive: true });
  art.addEventListener('pointerleave', () => {
    if (!browsing) hidePreview();
  });
  art.addEventListener('click', event => {
    if (finePointer.matches) return;
    const index = hitTest(event.clientX, event.clientY);
    if (index < 0) return hidePreview();
    browsing = true;
    showPreview(index, true);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !preview.hidden) hidePreview();
  });
  document.addEventListener('pointerdown', event => {
    if (!art.contains(event.target) && !event.target.closest('.preview-controls')) hidePreview();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
    hidePreview();
  }, { passive: true });
  reducedMotion.addEventListener('change', hidePreview);

  const workScope = document.querySelector('.work > .container');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const previousPhoto = document.getElementById('lightboxPrevious');
  const nextPhoto = document.getElementById('lightboxNext');
  let highlightedItem = null;
  let currentPhotos = [];
  let photoIndex = 0;
  let lightboxTrigger = null;
  let previousOverflow = '';

  function clearHighlight() {
    highlightedItem?.classList.remove('is-highlighted');
    highlightedItem = null;
    workScope.classList.remove('gallery-focus-scope');
  }
  function highlightCard(item) {
    if (lightbox.open || highlightedItem === item) return;
    clearHighlight();
    highlightedItem = item;
    workScope.classList.add('gallery-focus-scope');
    item.classList.add('is-highlighted');
  }
  function renderPhoto() {
    const figure = currentPhotos[photoIndex];
    const image = figure.querySelector('img');
    lightboxImage.hidden = false;
    document.getElementById('lightboxError').hidden = true;
    lightboxImage.alt = image.alt;
    lightboxImage.src = image.getAttribute('src');
    document.getElementById('lightboxCaption').textContent = figure.querySelector('figcaption').textContent;
    document.getElementById('lightboxCount').textContent = `${photoIndex + 1} / ${currentPhotos.length}`;
    previousPhoto.disabled = currentPhotos.length < 2;
    nextPhoto.disabled = currentPhotos.length < 2;
  }
  function changePhoto(direction) {
    photoIndex = (photoIndex + direction + currentPhotos.length) % currentPhotos.length;
    renderPhoto();
  }
  galleryItems.forEach(item => {
    item.addEventListener('pointerenter', () => {
      if (finePointer.matches) highlightCard(item);
    });
    item.addEventListener('pointerleave', () => {
      if (highlightedItem === item && !item.contains(document.activeElement)) clearHighlight();
    });
    item.addEventListener('focusin', () => highlightCard(item));
    item.addEventListener('focusout', event => {
      if (!item.contains(event.relatedTarget) && highlightedItem === item) clearHighlight();
    });
    item.querySelector('.gallery-open').addEventListener('click', event => {
      clearHighlight();
      hidePreview();
      resetLight();
      currentPhotos = Array.from(item.closest('.gallery').querySelectorAll('figure'));
      photoIndex = currentPhotos.indexOf(item.querySelector('figure'));
      lightboxTrigger = event.currentTarget;
      document.getElementById('lightboxTitle').textContent = item.closest('.project').querySelector('h4').innerText.replace(/\s+/g, ' ').trim();
      renderPhoto();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      lightbox.showModal();
    });
  });
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.close());
  previousPhoto.addEventListener('click', () => changePhoto(-1));
  nextPhoto.addEventListener('click', () => changePhoto(1));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      lightbox.close();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changePhoto(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  lightbox.addEventListener('click', event => {
    const bounds = lightbox.getBoundingClientRect();
    if (event.target === lightbox && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) lightbox.close();
  });
  lightbox.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    lightboxTrigger?.focus({ preventScroll: true });
    clearHighlight();
  });
  lightboxImage.addEventListener('error', () => {
    lightboxImage.hidden = true;
    document.getElementById('lightboxError').hidden = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') clearHighlight();
  });
  window.addEventListener('resize', clearHighlight, { passive: true });
  finePointer.addEventListener('change', clearHighlight);

  /* §16 wayfinding: highlight the section currently in view */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a, .mobile-menu a'));
  const sections = ['about', 'services', 'work', 'contact'].map(id => document.getElementById(id)).filter(Boolean);
  let currentSection = '';
  function updateActiveSection() {
    const probe = window.innerHeight * 0.38;
    let activeId = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= probe) activeId = section.id;
    }
    if (activeId === currentSection) return;
    currentSection = activeId;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + activeId) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  /* §1/§11: one rAF-throttled scroll handler instead of four separate listeners */
  let scrollFrame = 0;
  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      updateNavigation();
      resetLight();
      hidePreview();
      clearHighlight();
      updateActiveSection();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateActiveSection();
})();
