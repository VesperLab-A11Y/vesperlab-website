// site.js — comportements communs à toutes les pages : bascule burger, sous-menu
// LAB, fondu du header au scroll, et les trois options d'accessibilité du footer
// (taille du texte, thème, fondu de lune). Aucune dépendance, chargé en <script defer>.
// Amélioration progressive : sans JS, le header reste visible en permanence, le
// sous-menu LAB reste ouvert (CSS), et les options du footer sont simplement absentes.
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var burger = document.getElementById('nav-burger');
  var navPanel = document.getElementById('nav-panel');
  var labToggle = document.getElementById('lab-toggle');
  var labSubmenu = document.getElementById('lab-submenu');

  // ---------------------------------------------------------------------------
  // Burger mobile
  // ---------------------------------------------------------------------------
  if (burger && navPanel) {
    var burgerOpenIcon = burger.querySelector('.icon-burger');
    var burgerCloseIcon = burger.querySelector('.icon-close');
    var burgerLabel = burger.querySelector('.visually-hidden');

    function setBurgerOpen(open) {
      burger.setAttribute('aria-expanded', String(open));
      navPanel.classList.toggle('is-open', open);
      if (burgerOpenIcon) burgerOpenIcon.hidden = open;
      if (burgerCloseIcon) burgerCloseIcon.hidden = !open;
      if (burgerLabel) {
        burgerLabel.textContent = open ? burgerLabel.getAttribute('data-close-label') : burgerLabel.getAttribute('data-open-label');
      }
    }

    burger.addEventListener('click', function () {
      setBurgerOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setBurgerOpen(false);
        burger.focus();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Sous-menu LAB (disclosure) — « LAB » reste un vrai lien ; ce bouton séparé
  // n'ouvre/ferme que la liste des trois pages.
  // ---------------------------------------------------------------------------
  if (labToggle && labSubmenu) {
    function setLabOpen(open) {
      labToggle.setAttribute('aria-expanded', String(open));
      labSubmenu.classList.toggle('is-open', open);
    }

    labToggle.addEventListener('click', function () {
      setLabOpen(labToggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) setLabOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && labToggle.getAttribute('aria-expanded') === 'true') {
        setLabOpen(false);
        labToggle.focus();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Fondu du header au scroll — piloté par la DIRECTION du scroll, pas la
  // position. `inert` retire le header masqué de la navigation clavier (un
  // simple opacity:0 le laisserait tabulable, invisible).
  // ---------------------------------------------------------------------------
  if (header) {
    var lastY = window.scrollY;
    var upAccum = 0; // distance remontée depuis le dernier changement de sens
    var downAccum = 0; // distance descendue depuis le dernier changement de sens
    var ticking = false;
    var REAPPEAR_THRESHOLD = 40; // ~1cm : un petit scroll vers le haut suffit.
    var HIDE_THRESHOLD = 64; // il faut une vraie intention de descendre, pas juste 5px.
    var hidden = false;

    function setHidden(next) {
      if (next === hidden) return;
      hidden = next;
      header.classList.toggle('is-hidden', hidden);
      if (hidden) {
        header.setAttribute('inert', '');
      } else {
        header.removeAttribute('inert');
      }
    }

    function onScroll() {
      var y = window.scrollY;
      var delta = y - lastY;

      if (y <= 0) {
        setHidden(false);
        upAccum = 0;
        downAccum = 0;
      } else if (delta > 0) {
        upAccum = 0;
        downAccum += delta;
        if (downAccum > HIDE_THRESHOLD) setHidden(true);
      } else if (delta < 0) {
        downAccum = 0;
        upAccum += -delta;
        if (upAccum > REAPPEAR_THRESHOLD) setHidden(false);
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    // Le focus clavier force la réapparition, même en pleine descente : personne
    // ne doit se battre avec un menu qui disparaît sous son doigt.
    header.addEventListener('focusin', function () {
      setHidden(false);
    });
  }

  // ---------------------------------------------------------------------------
  // Options d'accessibilité (footer) — persistées en mémoire locale.
  // ---------------------------------------------------------------------------
  var root = document.documentElement;

  // Taille du texte : 5 crans, -2 à +2, appliqués via une classe sur <html>.
  var FONT_SIZES = { '-2': 'vl-font--2', '-1': 'vl-font--1', '0': '', '1': 'vl-font-1', '2': 'vl-font-2' };
  function applyFontStep(step) {
    Object.values(FONT_SIZES).forEach(function (c) { if (c) root.classList.remove(c); });
    var cls = FONT_SIZES[String(step)];
    if (cls) root.classList.add(cls);
    localStorage.setItem('vl-font-step', String(step));
  }
  var savedFontStep = parseInt(localStorage.getItem('vl-font-step'), 10);
  if (!isNaN(savedFontStep)) applyFontStep(savedFontStep);

  document.querySelectorAll('[data-font-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = parseInt(localStorage.getItem('vl-font-step'), 10) || 0;
      var step = btn.getAttribute('data-font-step');
      var next = step === '0' ? 0 : Math.max(-2, Math.min(2, current + parseInt(step, 10)));
      applyFontStep(next);
    });
  });

  // Thème : dark (défaut, pas d'attribut) / light / system.
  function applyTheme(theme) {
    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('vl-theme', theme);
    document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-choice') === theme));
    });
  }
  var savedTheme = localStorage.getItem('vl-theme');
  if (savedTheme) applyTheme(savedTheme);

  document.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyTheme(btn.getAttribute('data-theme-choice'));
    });
  });

  // Fondu de lune : activé par défaut, sauf si prefers-reduced-motion est déjà
  // actif au niveau système (on respecte ce choix avant même de demander).
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function applyMotion(on) {
    root.setAttribute('data-moon-motion', on ? 'on' : 'off');
    localStorage.setItem('vl-motion', on ? 'on' : 'off');
    document.querySelectorAll('[data-motion-choice]').forEach(function (btn) {
      var choiceIsOn = btn.getAttribute('data-motion-choice') === 'on';
      btn.setAttribute('aria-pressed', String(choiceIsOn === on));
    });
    // assets/js/moon.js écoute cet événement pour armer/désarmer le scrub sans recharger la page.
    document.dispatchEvent(new CustomEvent('vl:motion-change', { detail: { on: on } }));
  }
  var savedMotion = localStorage.getItem('vl-motion');
  applyMotion(savedMotion ? savedMotion === 'on' : !prefersReducedMotion);

  document.querySelectorAll('[data-motion-choice]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyMotion(btn.getAttribute('data-motion-choice') === 'on');
    });
  });
})();
