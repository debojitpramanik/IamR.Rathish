(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* Theme toggle (localStorage + system preference) */
  const icon = $('#theme-icon');
  const paintIcon = () => { icon.textContent = root.dataset.theme === 'dark' ? '☀' : '☾'; };
  paintIcon();
  $('#theme-toggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    paintIcon();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    let saved = null; try { saved = localStorage.getItem('theme'); } catch (_) {}
    if (!saved) { root.dataset.theme = e.matches ? 'dark' : 'light'; paintIcon(); }
  });

  /* Mobile menu */
  const btn = $('#menu-btn'), menu = $('#mobile-menu');
  const setMenu = open => {
    menu.style.maxHeight = open ? menu.scrollHeight + 'px' : '0px';
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? '✕' : '☰';
  };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Scroll reveal */
  const revealIO = new IntersectionObserver((entries, o) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealIO.observe(el));

  /* Number counters */
  const ease = t => 1 - Math.pow(1 - t, 4);
  const runCounter = el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = target + suffix; return; }
    const dur = 1800, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * ease(p)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countIO = new IntersectionObserver((entries, o) => {
    entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); o.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('.counter').forEach(el => countIO.observe(el));

  /* 3D tilt + radial glare */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
        const ry = ((x / r.width) - 0.5) * 10, rx = -((y / r.height) - 0.5) * 10;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    /* Hero mouse parallax */
    const hero = $('#home'), layers = $$('[data-depth]', hero);
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${nx * d}px, ${ny * d}px)`; });
    });
  }

  /* Scroll progress, timeline fill, scroll-spy */
  const bar = $('#progress'), tl = $('#timeline'), fill = $('#tl-fill');
  const nodes = $$('.tl-node'), links = $$('a.nav-link');
  const sections = $$('main section[id]');
  let ticking = false;
  const onScroll = () => {
    const doc = root.scrollHeight - innerHeight;
    bar.style.width = (doc > 0 ? (scrollY / doc) * 100 : 0) + '%';

    const r = tl.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * 0.6 - r.top) / r.height, 0), 1);
    fill.style.height = (p * 100) + '%';
    nodes.forEach(n => {
      const nr = n.getBoundingClientRect();
      n.classList.toggle('lit', nr.top < innerHeight * 0.6);
    });

    let current = sections[0].id;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * 0.4) current = s.id; });
    if (innerHeight + scrollY >= root.scrollHeight - 4) current = 'contact';
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  $('#year').textContent = new Date().getFullYear();
})();
