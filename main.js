(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apply Tailwind utility classes to skill chips cleanly
  document.querySelectorAll('.skill-chip').forEach((chip) => {
    chip.className =
      'border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark px-3.5 py-1 rounded-full text-[15px] transition-all duration-200 hover:border-brass hover:-translate-y-0.5 hover:shadow-sm cursor-default';
  });

  // 1. Dynamic Year & Responsive Mobile Menu
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');

  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isHidden = menu.classList.toggle('hidden');
      menu.classList.toggle('flex', !isHidden);
      burger.setAttribute('aria-expanded', String(!isHidden));
    });

    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && window.innerWidth < 768) {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 2. Dark / Light Theme Persistence
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const root = document.documentElement;

  const setTheme = (isDark) => {
    root.classList.toggle('dark', isDark);
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
  };

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (_) {
    // Ignore storage errors in sandboxed/file:// environments
  }
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme ? savedTheme === 'dark' : systemDark);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = !root.classList.contains('dark');
      setTheme(isDark);
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (_) {}
    });
  }

  // 3. Staggered Blur + Slide Scroll Reveal
  const revealItems = document.querySelectorAll('.reveal-item');
  revealItems.forEach((el, index) => {
    el.style.setProperty('--delay', `${(index % 4) * 0.08}s`);
  });

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('is-visible'));
  }

  // 4. Ease-Out Cubic Number Counters
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  // 5. 3D Perspective Tilt + Radial Cursor Spotlight on Cards
  if (!prefersReducedMotion) {
    document.querySelectorAll('.interactive-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        if (card.hasAttribute('data-tilt')) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -2.2;
          const rotateY = ((x - centerX) / centerX) * 2.2;
          card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // 6. Hero Ring Parallax & Magnetic CTA Buttons
  const hero = document.getElementById('hero');
  const ringOuter = document.getElementById('ring-outer');
  const ringInner = document.getElementById('ring-inner');

  if (hero && ringOuter && ringInner && !prefersReducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 26;
      const y = (e.clientY / window.innerHeight - 0.5) * 26;
      ringOuter.style.transform = `translate(${-x}px, ${-y}px)`;
      ringInner.style.transform = `translate(${x * 1.4}px, ${y * 1.4}px)`;
    });
  }

  if (!prefersReducedMotion) {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // 7. Scroll Progress Bar, Career Timeline Fill & Active Nav Spy
  const progressBar = document.getElementById('scroll-progress');
  const timelineWrap = document.getElementById('timeline-wrap');
  const timelineFill = document.getElementById('timeline-fill');
  const timelineDots = document.querySelectorAll('.timeline-dot');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docHeight > 0) {
      progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
    }

    if (timelineWrap && timelineFill) {
      const rect = timelineWrap.getBoundingClientRect();
      const trigger = window.innerHeight * 0.7;
      const ratio = Math.min(1, Math.max(0, (trigger - rect.top) / rect.height));
      timelineFill.style.height = `${ratio * 100}%`;

      timelineDots.forEach((dot) => {
        const active = dot.getBoundingClientRect().top < trigger;
        dot.classList.toggle('bg-brass', active);
        dot.classList.toggle('bg-bg-light', !active);
        dot.classList.toggle('dark:bg-bg-dark', !active);
      });
    }

    let currentId = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 150) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
})();