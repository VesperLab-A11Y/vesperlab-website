// blog-search.js — bouton loupe (page /blog/) qui ouvre une barre de
// recherche en toggle (même technique qu'apropos.js/entries.js :
// grid-template-rows 0fr → 1fr + attribut hidden). Contrairement aux
// panneaux "+ " des cartes, ce toggle déplace le focus dans le champ à
// l'ouverture : le but est de taper tout de suite, pas de lire un contenu.
// Recherche déclenchée uniquement à la validation (submit du <form>, donc
// Entrée ou clic sur le bouton "enter") — pas de filtrage à chaque frappe.
// Filtre pur JS sur les cartes déjà rendues (data-search, voir
// build-blog.mjs) : site statique, pas de backend de recherche.
(function () {
  'use strict';

  var toggle = document.querySelector('.blog-search-toggle');
  if (!toggle) return;

  var panel = document.getElementById(toggle.getAttribute('aria-controls'));
  var wrap = panel && panel.closest('.blog-search-panel-wrap');
  var input = panel && panel.querySelector('input[type="search"]');
  var status = document.getElementById('blog-search-status');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.blog-gallery > .blog-entry'));
  if (!panel || !wrap || !input) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CLOSE_MS = 300; // doit correspondre à la transition de .blog-search-panel-wrap
  var hideTimer = null;

  var openLabel = toggle.getAttribute('data-label-open');
  var closeLabel = toggle.getAttribute('data-label-close');

  function stripAccents(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function showAll() {
    cards.forEach(function (card) { card.hidden = false; });
    if (status) status.textContent = '';
  }

  function runSearch() {
    var query = stripAccents(input.value.trim().toLowerCase());
    if (!query) {
      showAll();
      return;
    }
    var shown = 0;
    cards.forEach(function (card) {
      var match = stripAccents(card.dataset.search || '').indexOf(query) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    if (status) {
      status.textContent = shown
        ? shown + (shown > 1 ? ' articles trouvés.' : ' article trouvé.')
        : 'Aucun article ne correspond à cette recherche.';
    }
  }

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    if (closeLabel) toggle.setAttribute('aria-label', closeLabel);
    if (hideTimer) { window.clearTimeout(hideTimer); hideTimer = null; }
    panel.hidden = false;
    void wrap.offsetHeight; // reflow : repartir de 0fr même si démasqué à l'instant
    requestAnimationFrame(function () {
      wrap.classList.add('is-open');
      input.focus();
    });
  }

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    if (openLabel) toggle.setAttribute('aria-label', openLabel);
    wrap.classList.remove('is-open');
    input.value = '';
    showAll();
    if (reduceMotion) {
      panel.hidden = true;
    } else {
      hideTimer = window.setTimeout(function () {
        panel.hidden = true;
        hideTimer = null;
      }, CLOSE_MS);
    }
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') close();
    else open();
  });

  panel.addEventListener('submit', function (e) {
    e.preventDefault();
    runSearch();
  });

  panel.addEventListener('keydown', function (e) {
    // La soumission native (Entrée -> submit) suffit dans un navigateur
    // normal, mais on déclenche aussi explicitement sur Entrée : plus fiable
    // que de compter sur la soumission implicite (certains contextes —
    // claviers virtuels, webviews, outils d'automatisation — ne la
    // déclenchent pas de façon homogène). Double appel à runSearch() sans
    // conséquence (idempotent), mais on annule quand même l'event pour ne
    // pas déclencher les deux chemins en même temps.
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
      return;
    }
    if (e.key === 'Escape') {
      close();
      toggle.focus();
    }
  });
})();
