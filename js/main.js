/* ============================================
   Proxima Centauri Site — Shared JavaScript
   Starfield animation + mobile nav
   ============================================ */

(function () {
  'use strict';

  // ---------- Starfield ----------
  function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, stars;
    const STAR_COUNT = 220;
    const SPEED = 0.15;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.3,
          alpha: Math.random() * 0.6 + 0.2,
          drift: (Math.random() - 0.5) * SPEED,
          twinkleSpeed: Math.random() * 0.008 + 0.002,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 215, 255, ${s.alpha * twinkle})`;
        ctx.fill();

        s.y += s.drift;
        if (s.y < -2) s.y = height + 2;
        if (s.y > height + 2) s.y = -2;
      }
      requestAnimationFrame(draw);
    }

    resize();
    createStars();
    requestAnimationFrame(draw);
    window.addEventListener('resize', () => { resize(); createStars(); });
  }

  // ---------- Mobile Nav Toggle ----------
  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const isOpen = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.innerHTML = isOpen ? '&times;' : '&#9776;';
    });

    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '&#9776;';
      }
    });
  }

  // ---------- Active Nav Link ----------
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  // ---------- Scroll Fade-in ----------
  function initScrollFade() {
    var sections = document.querySelectorAll('.section, .chart-container, .comparison, .size-compare, .timeline, .facts-grid, .planet-profile');
    if (!sections.length) return;

    sections.forEach(function (s) {
      // Make above-the-fold content visible immediately
      var rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        s.classList.add('fade-in', 'visible');
      } else {
        s.classList.add('fade-in');
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 60px 0px' }
    );

    sections.forEach(function (s) {
      if (!s.classList.contains('visible')) {
        observer.observe(s);
      }
    });
  }

  // ---------- Smooth Page Transitions ----------
  function initPageTransitions() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      // Only handle local .html links
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
      if (e.metaKey || e.ctrlKey) return; // allow cmd/ctrl+click

      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function () {
        window.location.href = href;
      }, 180);
    });
  }

  // ---------- Reading Progress Bar ----------
  function initProgressBar() {
    const bar = document.querySelector('.page-progress-bar');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', function () {
    initStarfield();
    initNav();
    setActiveNav();
    initScrollFade();
    initProgressBar();
    initPageTransitions();
  });
})();
