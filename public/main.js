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
  const navLinks = document.querySelector('.nav-links');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

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
      const href = a.getAttribute('href');
      if (href === '#') return; // skip bare hash links
      e.preventDefault();
      const target = document.querySelector(href);
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

  /* ═══════════════════════════════════════════
     8. LEAD CAPTURE MODAL LOGIC
     ═══════════════════════════════════════════ */
  const modalOverlay  = document.getElementById('leadModal');
  const modalContent  = document.getElementById('modalContent');
  const leadForm      = document.getElementById('leadForm');
  const closeBtn      = document.getElementById('closeModal');
  const successClose  = document.getElementById('successCloseBtn');
  const submitBtn     = document.getElementById('modalSubmitBtn');

  function openModal() {
    modalOverlay.setAttribute('aria-hidden', 'false');
    // Reset state in case it was opened before
    modalContent.style.display = 'block';
    document.getElementById('modalAnalysis').style.display = 'none';
    document.getElementById('modalReport').style.display = 'none';
    leadForm.reset();
  }

  function closeModalDialog() {
    modalOverlay.setAttribute('aria-hidden', 'true');
  }

  // Open modal on any trigger click
  document.querySelectorAll('.trigger-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closeModalDialog);
  successClose.addEventListener('click', closeModalDialog);

  // Close on outside click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModalDialog();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.getAttribute('aria-hidden') === 'false') {
      closeModalDialog();
    }
  });

  // Modal Analysis Animation Sequence
  async function playModalAnalysis(companyName) {
    const analysisContainer = document.getElementById('modalAnalysis');
    const termOutput = document.getElementById('modalTermOutput');
    const termCursor = document.getElementById('modalTermCursor');
    const termBody = document.getElementById('modalTermBody');
    const reportSection = document.getElementById('modalReport');
    
    // Reset from previous runs
    termOutput.innerHTML = '';
    reportSection.style.display = 'none';
    analysisContainer.style.display = 'block';
    
    const lines = [
      { text: `> Initializing secure connection to ${companyName}...`, type: 'cmd' },
      { text: `> Indexing active SaaS subscriptions...`, type: 'cmd' },
      { text: `[INFO] Found 142 active contracts`, type: 'info' },
      { text: `> Running RAG semantic analysis on contract clauses...`, type: 'cmd' },
      { text: `[WARNING] Detected 3 auto-renewal escalations`, type: 'warning' },
      { text: `> Cross-referencing seat utilization against Okta logs...`, type: 'cmd' },
      { text: `  ████████████████████████████████ 100%`, type: 'dim' },
      { text: `[SUCCESS] Analysis complete. Generating preliminary report...`, type: 'success' },
    ];

    async function typeLine(lineData) {
      const lineEl = document.createElement('div');
      lineEl.className = 'term-line ' + lineData.type;
      termOutput.appendChild(lineEl);
      termOutput.appendChild(termCursor);

      for (let i = 0; i < lineData.text.length; i++) {
        lineEl.textContent += lineData.text[i];
        termBody.scrollTop = termBody.scrollHeight;
        await new Promise(r => setTimeout(r, 10 + Math.random() * 15));
      }
      await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    }

    for (const line of lines) {
      await typeLine(line);
    }
    
    // Show report
    await new Promise(r => setTimeout(r, 400));
    reportSection.style.display = 'block';
    
    // Animate numbers
    animateValue('reportSavings', 184500, formatCurrency);
    animateValue('reportSeats', 47, n => n);
    animateValue('reportRisks', 3, n => n);
    animateValue('reportDuplicate', 8, n => n);
    
    // Let user see report before success screen
    await new Promise(r => setTimeout(r, 3000));
  }

  // Handle Form Submission
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    submitBtn.classList.add('loading');

    const formData = new FormData(leadForm);
    const company = formData.get('company');
    const payload = {
      email: formData.get('email'),
      company: company
    };
    
    try {
      // Fire the fetch but don't await its UI state immediately
      const fetchPromise = fetch('/api/submit-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // While fetch runs in background, play UI magic
      modalContent.style.display = 'none';
      await playModalAnalysis(company);
      
      const response = await fetchPromise;

      if (response.ok) {
        // Success state is now fully integrated into the analysis view (it stays visible).
        // The playModalAnalysis already faded in the final report and "Return to Site" button.
      } else {
        let errorMsg = 'Failed to submit request. Please try again.';
        try {
          const result = await response.json();
          errorMsg = result.error || errorMsg;
        } catch (parseErr) { /* response was not JSON */ }
        console.error('API Error:', response.status, errorMsg);
        
        // bring form back on error
        document.getElementById('modalAnalysis').style.display = 'none';
        modalContent.style.display = 'block';
        alert('Error: ' + errorMsg);
      }
    } catch (error) {
      console.error('Submission Error:', error);
      document.getElementById('modalAnalysis').style.display = 'none';
      modalContent.style.display = 'block';
      alert('Network error. Please try again later.');
    } finally {
      submitBtn.classList.remove('loading');
    }
  });

  /* ═══════════════════════════════════════════
     9. AI TERMINAL — TYPING ANIMATION
     ═══════════════════════════════════════════ */
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalBody   = document.getElementById('terminalBody');
  const termCursor     = document.getElementById('termCursor');

  const TERM_LINES = [
    { text: '> Initializing Sentinel AI Engine...', type: 'cmd' },
    { text: '> Loading contract: Slack Enterprise — FY2025', type: 'cmd' },
    { text: '> Scanning 142 pages for financial clauses...', type: 'cmd' },
    { text: '  ████████████████████████████████ 100%', type: 'dim' },
    { text: '[INFO] Found: Auto-renewal clause at 115% rate increase', type: 'info' },
    { text: '[WARNING] Deadline: Renewal window closes in 14 days', type: 'warning' },
    { text: '[INFO] Analyzing seat utilization across 340 licenses...', type: 'info' },
    { text: '[WARNING] 47 seats inactive for 90+ days — $8,460/yr recoverable', type: 'warning' },
    { text: '> Cross-referencing market benchmarks (Q1 2026)...', type: 'cmd' },
    { text: '[INFO] Current rate: $18/seat — Market median: $12/seat', type: 'info' },
    { text: '> Generating AI counter-proposal...', type: 'cmd' },
    { text: '[SUCCESS] Counter-proposal ready — projected savings: $31,460/yr', type: 'success' },
    { text: '> Analysis complete. 3 action items flagged. ✓', type: 'success' },
  ];

  let termAnimRunning = false;

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function typeLine(lineData) {
    const lineEl = document.createElement('div');
    lineEl.className = 'term-line ' + lineData.type;
    terminalOutput.appendChild(lineEl);

    // Move cursor after the line
    terminalOutput.appendChild(termCursor);

    for (let i = 0; i < lineData.text.length; i++) {
      lineEl.textContent += lineData.text[i];
      terminalBody.scrollTop = terminalBody.scrollHeight;
      await sleep(18 + Math.random() * 22);
    }

    // Pause between lines
    await sleep(350 + Math.random() * 400);
  }

  async function runTerminalAnimation() {
    if (termAnimRunning) return;
    termAnimRunning = true;

    while (true) {
      // Clear previous output
      terminalOutput.innerHTML = '';
      terminalOutput.appendChild(termCursor);

      for (const line of TERM_LINES) {
        await typeLine(line);
      }

      // Pause at the end before restarting
      await sleep(5000);
    }
  }

  const termSection = document.getElementById('aiTerminal');
  if (termSection) {
    const termObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          runTerminalAnimation();
          termObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    termObs.observe(termSection);
  }
  /* ═══════════════════════════════════════════
     10. FAQ ACCORDION
     ═══════════════════════════════════════════ */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');

      // Close all other items
      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        openItem.classList.remove('active');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked item
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  /* ═══════════════════════════════════════════
     11b. COMING SOON LINKS — prevent navigation
     ═══════════════════════════════════════════ */
  document.querySelectorAll('.coming-soon').forEach(link => {
    link.addEventListener('click', e => e.preventDefault());
  });

  /* ═══════════════════════════════════════════
     11. CURSOR GLOW (Desktop Only)
     ═══════════════════════════════════════════ */
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  
  if (isFinePointer) {
    const ring = document.getElementById('cursorRing');

    if (ring) {
      let mouseX = -200, mouseY = -200;
      let ringX  = -200, ringY  = -200;
      const LERP_SPEED = 0.12;

      document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      // Ring trails with LERP
      function animateRing() {
        ringX += (mouseX - ringX) * LERP_SPEED;
        ringY += (mouseY - ringY) * LERP_SPEED;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateRing);
      }
      requestAnimationFrame(animateRing);

      // Hover detection — glow gets bigger on interactive elements
      const hoverTargets = document.querySelectorAll('a, button, .faq-question, .btn-primary, .btn-secondary, .nav-cta, .theme-toggle, input, .trust-logo');
      hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
      });

      // Hide glow when mouse leaves viewport
      document.addEventListener('mouseleave', () => ring.classList.add('hidden'));
      document.addEventListener('mouseenter', () => ring.classList.remove('hidden'));
    }
  }

})();
