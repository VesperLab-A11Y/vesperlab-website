// apropos.js — 3 boutons à bascule (L'humain / L'esprit / L'entité) qui font
// apparaître UN des panneaux de .apropos-frame à la fois. Recliquer le
// bouton actif referme tout. Passer d'un onglet à l'autre referme d'abord la
// frame puis rejoue l'animation d'ouverture avec le nouveau contenu (plutôt
// que de sauter directement à la nouvelle hauteur) — cf. retour Pauline.
// Pas de framework, no-op silencieux sur les autres pages.
(function () {
  'use strict';

  var frame = document.querySelector('.apropos-frame');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.apropos-toggle'));
  if (!frame || !buttons.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CLOSE_MS = 400; // doit correspondre à la durée de transition de .apropos-frame

  function panels() {
    return Array.prototype.slice.call(frame.querySelectorAll('.apropos-panel'));
  }

  // La hauteur de la page change à l'ouverture/fermeture ; moon.js ne
  // recalcule --moon-phase que sur scroll/resize, donc on lui envoie un
  // signal une fois la transition de hauteur terminée.
  function nudgeMoon() {
    window.setTimeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, CLOSE_MS + 20);
  }

  function closeAll() {
    buttons.forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    panels().forEach(function (p) {
      p.hidden = true;
    });
    frame.classList.remove('is-open');
  }

  function openPanel(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    buttons.forEach(function (b) {
      b.setAttribute('aria-expanded', String(b === btn));
    });
    panels().forEach(function (p) {
      p.hidden = p !== panel;
    });
    // Force un reflow entre le "hidden" ci-dessus et l'ajout de la classe,
    // pour que le navigateur reparte bien de grid-template-rows:0fr — sans
    // ça, changer de panneau alors que la frame est déjà ouverte ne rejoue
    // pas la transition (elle est déjà à 1fr).
    void frame.offsetHeight;
    requestAnimationFrame(function () {
      frame.classList.add('is-open');
    });
    nudgeMoon();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isActive = btn.getAttribute('aria-expanded') === 'true';
      if (isActive) {
        closeAll();
        nudgeMoon();
        return;
      }
      var frameOpen = frame.classList.contains('is-open');
      if (frameOpen) {
        closeAll();
        window.setTimeout(function () {
          openPanel(btn);
        }, reduceMotion ? 0 : CLOSE_MS);
      } else {
        openPanel(btn);
      }
    });
  });
})();
