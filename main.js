(function() {
  'use strict';

  /* ═══════════════════════════════════════════
     PREMIUM EASING & TIMING
     ═══════════════════════════════════════════ */
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const DURATION = 700;

  /* ─── Nav scroll effect ─── */
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ─── Mobile nav toggle ─── */
  const toggle = document.getElementById('navToggle');
  toggle.addEventListener('click', () => {
    const links = document.querySelector('.nav-links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  });

  /* ═══════════════════════════════════════════
     1. SCROLL REVEAL — staggered
     ═══════════════════════════════════════════ */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(el => revealObs.observe(el));

  /* ═══════════════════════════════════════════
     2. HERO COUNTER ANIMATION
     ═══════════════════════════════════════════ */
  function animateCounters() {
    document.querySelectorAll('.hero-stat-value').forEach(el => {
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimal) || 0;
      const duration = 2000;
      const start    = performance.now();

      function tick(now) {
        const t     = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounters();
        heroObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) heroObs.observe(heroStats);

  /* ═══════════════════════════════════════════
     3. DASHBOARD TILT (Mouse-tracking)
     ═══════════════════════════════════════════ */
  document.querySelectorAll('.tilt-target').forEach(el => {
    el.style.transition = `transform ${DURATION}ms ${EASE}`;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;

      const rotateX = (y * -4).toFixed(2);
      const rotateY = (x *  4).toFixed(2);

      el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ═══════════════════════════════════════════
     4. ROI CALCULATOR — Rolling Numbers
     ═══════════════════════════════════════════ */
  const spendSlider = document.getElementById('spendSlider');
  const empSlider   = document.getElementById('empSlider');
  const toolSlider  = document.getElementById('toolSlider');

  function formatCurrency(n) {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return '$' + (n / 1_000).toFixed(0) + 'k';
    return '$' + n.toLocaleString();
  }

  const rollingAnimations = {};

  function animateValue(elementId, newValue, formatter) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (rollingAnimations[elementId]) {
      cancelAnimationFrame(rollingAnimations[elementId]);
    }

    const currentText = el.textContent.replace(/[^0-9.-]/g, '');
    let currentNum = parseFloat(currentText) || 0;

    if (el.textContent.includes('M')) currentNum *= 1_000_000;
    else if (el.textContent.includes('k')) currentNum *= 1_000;

    const startVal = currentNum;
    const endVal   = newValue;
    const duration = 500;
    const start    = performance.now();

    function tick(now) {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val   = startVal + (endVal - startVal) * eased;
      el.textContent = formatter(Math.round(val));
      if (t < 1) {
        rollingAnimations[elementId] = requestAnimationFrame(tick);
      } else {
        delete rollingAnimations[elementId];
      }
    }
    rollingAnimations[elementId] = requestAnimationFrame(tick);
  }

  function animatePayback(elementId, newValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (rollingAnimations[elementId]) {
      cancelAnimationFrame(rollingAnimations[elementId]);
    }

    const currentText = el.textContent.replace(/[^0-9.]/g, '');
    const startVal = parseFloat(currentText) || 0;
    const endVal   = parseFloat(newValue) || 0;
    const duration = 500;
    const start    = performance.now();

    function tick(now) {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val   = startVal + (endVal - startVal) * eased;
      el.textContent = val.toFixed(1) + ' mo';
      if (t < 1) {
        rollingAnimations[elementId] = requestAnimationFrame(tick);
      } else {
        delete rollingAnimations[elementId];
      }
    }
    rollingAnimations[elementId] = requestAnimationFrame(tick);
  }

  function updateROI() {
    const spend = parseInt(spendSlider.value);
    const emps  = parseInt(empSlider.value);
    const tools = parseInt(toolSlider.value);

    document.getElementById('spendValue').textContent = '$' + spend.toLocaleString();
    document.getElementById('empValue').textContent   = emps.toLocaleString();
    document.getElementById('toolValue').textContent  = tools;

    const annualSpend = spend * 12;

    const seatSavings      = annualSpend * 0.12 * (emps / 200);
    const contractSavings  = annualSpend * 0.09 * (tools / 25);
    const duplicateSavings = annualSpend * 0.08 * (tools / 25);
    const negotiateSavings = annualSpend * 0.05;
    const total = Math.round(seatSavings + contractSavings + duplicateSavings + negotiateSavings);

    const sentinelCost  = 15000 + (emps * 5 * 12);
    const paybackMonths = total > 0 ? Math.max(0.5, (sentinelCost / total) * 12).toFixed(1) : '0';

    animateValue('roiSavings',   total,                      formatCurrency);
    animateValue('roiSeats',     Math.round(seatSavings),     formatCurrency);
    animateValue('roiContracts', Math.round(contractSavings), formatCurrency);
    animateValue('roiDuplicate', Math.round(duplicateSavings),formatCurrency);
    animateValue('roiNegotiate', Math.round(negotiateSavings),formatCurrency);
    animatePayback('roiPayback', paybackMonths);
  }

  [spendSlider, empSlider, toolSlider].forEach(s => {
    s.addEventListener('input', updateROI);
  });

  updateROI();

  /* ═══════════════════════════════════════════
     5. MAGNETIC BUTTONS
     ═══════════════════════════════════════════ */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.style.transition = `transform ${DURATION}ms ${EASE}`;

    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ═══════════════════════════════════════════
     6. SMOOTH SCROLL
     ═══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════════
     7. DARK / LIGHT MODE TOGGLE
     ═══════════════════════════════════════════ */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem('sentinel-theme', mode);
  }

  const savedTheme = localStorage.getItem('sentinel-theme') || 'dark';
  setTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

})();
