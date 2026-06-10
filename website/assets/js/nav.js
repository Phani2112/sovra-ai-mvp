/* ==========================================================
   Sovra AI — Navigation & Theme JS
   ========================================================== */

(function () {
  'use strict';

  // ---- Theme toggle ----
  const html = document.documentElement;
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = mql.matches ? 'dark' : 'light';
  html.setAttribute('data-theme', theme);

  function setToggleIcon(btn, t) {
    if (!btn) return;
    btn.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
    btn.innerHTML = t === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(btn => {
      setToggleIcon(btn, theme);
      btn.addEventListener('click', function () {
        theme = theme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', theme);
        toggles.forEach(b => setToggleIcon(b, theme));
      });
    });

    // ---- Sticky nav scroll state ----
    const nav = document.querySelector('.nav');
    if (nav) {
      window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    // ---- Mobile burger ----
    const burger = document.querySelector('.nav__burger');
    const mobileMenu = document.querySelector('.nav__mobile');
    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        const open = burger.classList.toggle('open');
        mobileMenu.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function () {
          burger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    // ---- Active nav link ----
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || href.endsWith('/' + currentPath))) {
        link.classList.add('active');
      }
    });
  });
})();
