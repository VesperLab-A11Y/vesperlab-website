// entries.js — bouton "+" par carte (.entry-card) sur les pages Vesper Tools
// et Projets. Chaque carte est indépendante (contrairement à apropos.js, pas
// de sélection unique) : ouvrir l'une n'affecte pas les autres. Même
// technique d'animation qu'À propos (grid-template-rows 0fr → 1fr sur
// .entry-panel-wrap), mais l'attribut hidden porte tout le travail
// d'accessibilité : c'est lui qui retire vraiment le panneau de l'ordre de
// tabulation, pas la hauteur 0. Pas de framework, no-op silencieux ailleurs.
(function () {
  'use strict';

  var toggles = Array.prototype.slice.call(document.querySelectorAll('.entry-toggle'));
  if (!toggles.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CLOSE_MS = 300; // doit correspondre à la transition de .entry-panel-wrap

  toggles.forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var wrap = panel && panel.closest('.entry-panel-wrap');
    if (!panel || !wrap) return;

    var openLabel = btn.getAttribute('data-label-open');
    var closeLabel = btn.getAttribute('data-label-close');
    var hideTimer = null;

    btn.addEventListener('click', function () {
      var opening = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(opening));
      if (closeLabel) btn.setAttribute('aria-label', opening ? closeLabel : openLabel);

      if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
      }

      if (opening) {
        panel.hidden = false;
        // Force un reflow avant d'ajouter la classe, pour repartir de 0fr
        // même si le panneau vient d'être démasqué à l'instant.
        void wrap.offsetHeight;
        requestAnimationFrame(function () {
          wrap.classList.add('is-open');
        });
      } else {
        wrap.classList.remove('is-open');
        if (reduceMotion) {
          panel.hidden = true;
        } else {
          hideTimer = window.setTimeout(function () {
            panel.hidden = true;
            hideTimer = null;
          }, CLOSE_MS);
        }
      }
      // Le focus reste sur le bouton : on ne déplace rien.
    });
  });
})();
