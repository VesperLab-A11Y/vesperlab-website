// lightbox.js — agrandissement au clic pour les images de contenu (mockups
// d'outils/projets, photos de la page À propos, images des articles de
// blog). Volontairement scopé à ces conteneurs précis plutôt qu'à tous les
// <img> du site : exclut le logo (inline SVG, pas un <img>), la lune de fond
// (décorative, aria-hidden) et les vignettes de la galerie blog (déjà
// enveloppées dans un <a> vers l'article — un <img> cliquable imbriqué dans
// un lien serait un piège au clavier/lecteur d'écran).
// <dialog>.showModal() gère nativement l'inertie du reste de la page,
// Échap pour fermer, et le retour du focus sur l'élément qui a ouvert la
// boîte de dialogue à la fermeture — pas de gestion de focus à coder ici.
(function () {
  'use strict';

  var SELECTOR = '.entry-mockup img, .post img, .apropos-figure img';
  var targets = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!targets.length) return;

  var lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  var L = {
    fr: { enlarge: 'Agrandir : ', close: "Fermer l'image agrandie" },
    en: { enlarge: 'Enlarge: ', close: 'Close enlarged image' }
  }[lang];

  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox-dialog';
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', L.close);
  closeBtn.textContent = '×';
  var img = document.createElement('img');
  img.className = 'lightbox-img';
  dialog.appendChild(closeBtn);
  dialog.appendChild(img);
  document.body.appendChild(dialog);

  function close() { if (dialog.open) dialog.close(); }
  function open(src, alt) {
    img.src = src;
    img.alt = alt || '';
    dialog.showModal();
  }
  closeBtn.addEventListener('click', close);
  // Clic sur le fond (le <dialog> lui-même remplit le viewport via ::backdrop
  // + centrage) : ferme, mais un clic sur l'image ou le bouton ne doit pas
  // se propager jusqu'ici.
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) close();
  });

  targets.forEach(function (el) {
    if (!el.getAttribute('src')) return;
    el.classList.add('lightbox-trigger');
    el.tabIndex = 0;
    el.setAttribute('role', 'button');

    var alt = el.getAttribute('alt');
    var label = alt;
    if (!label) {
      var card = el.closest('.entry-card');
      var heading = card && card.querySelector('h2');
      label = heading ? heading.textContent.trim() : document.title;
    }
    el.setAttribute('aria-label', L.enlarge + label);

    el.addEventListener('click', function () { open(el.currentSrc || el.src, alt); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(el.currentSrc || el.src, alt);
      }
    });
  });
})();
