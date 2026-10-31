(() => {
  const menu = document.querySelector('.mobile-menu');
  const header = document.querySelector('.site');
  const updateOffset = () => {
    if (header) document.documentElement.style.setProperty('--header-offset', Math.ceil(header.getBoundingClientRect().height + 16) + 'px');
  };
  updateOffset();
  if (header && 'ResizeObserver' in window) new ResizeObserver(updateOffset).observe(header);
  window.addEventListener('resize', updateOffset);
  if (menu) {
    menu.addEventListener('toggle', updateOffset);
    document.querySelectorAll('.site a').forEach(link => {
      link.addEventListener('click', event => {
        if (!menu.open || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        menu.open = false;
        updateOffset();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const target = document.getElementById(href.slice(1));
          if (target) {
            event.preventDefault();
            history.pushState(null, '', href);
            requestAnimationFrame(() => {
              updateOffset();
              target.scrollIntoView({block:'start', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
              if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
                target.addEventListener('blur', () => target.removeAttribute('tabindex'), {once:true});
              }
              target.focus({preventScroll:true});
            });
          }
        }
      });
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  }
  const box = document.getElementById('lightbox');
  const items = Array.from(document.querySelectorAll('.thumb'));
  if (!box || typeof box.showModal !== 'function' || !items.length) return;
  const large = document.getElementById('large');
  const counter = document.getElementById('counter');
  const error = document.getElementById('image-error');
  const original = document.getElementById('original');
  let active = 0, opener = null, oldOverflow = '', start = null;
  function show(index) {
    active = (index + items.length) % items.length;
    const item = items[active];
    large.hidden = false;
    error.hidden = true;
    original.href = item.href;
    large.alt = item.querySelector('img').alt;
    large.src = item.href;
    counter.textContent = (active + 1) + ' de ' + items.length;
  }
  large.addEventListener('error', () => { large.hidden = true; error.hidden = false; });
  items.forEach((item, index) => {
    item.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      opener = item;
      oldOverflow = document.body.style.overflow;
      show(index);
      try { box.showModal(); } catch (_) { return; }
      event.preventDefault();
      document.body.style.overflow = 'hidden';
    });
  });
  document.getElementById('close').addEventListener('click', () => box.close());
  box.addEventListener('close', () => {
    document.body.style.overflow = oldOverflow;
    large.removeAttribute('src');
    start = null;
    if (opener) opener.focus({preventScroll:true});
  });
  document.getElementById('prev').addEventListener('click', () => show(active - 1));
  document.getElementById('next').addEventListener('click', () => show(active + 1));
  box.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(active + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  const swipe = document.getElementById('swipe-area');
  swipe.addEventListener('touchstart', event => {
    start = event.touches.length === 1 ? {x:event.touches[0].clientX,y:event.touches[0].clientY} : null;
  }, {passive:true});
  swipe.addEventListener('touchmove', event => { if (event.touches.length !== 1) start = null; }, {passive:true});
  swipe.addEventListener('touchend', event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(active + (dx > 0 ? -1 : 1));
    start = null;
  }, {passive:true});
  swipe.addEventListener('touchcancel', () => { start = null; });
})();