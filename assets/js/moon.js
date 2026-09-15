// moon.js — lune fixe + éclipse liée au scroll global de la page, et fondu
// des cartes de lisibilité (.mp-card) par bloc.
//   - scrubbed (par défaut) : --moon-phase suit la position de scroll sur
//     TOUTE la hauteur de la page. --card-fade suit, par carte, sa proximité
//     au centre de l'écran.
//   - statique (prefers-reduced-motion, ou option "fondu de lune" désactivée
//     dans le footer) : phase et cartes fixées une fois pour toutes, aucun
//     lien au scroll.
//
// --moon-phase est SIGNÉE (-1 → 0 → 1, pas 0 → 1 → 0) : en première moitié
// de page l'ombre coulisse vers le bas (phase > 0), en seconde moitié vers
// le haut (phase < 0). Avec une seule ombre qui coulisse toujours dans le
// même sens, le haut et le bas de page produisaient EXACTEMENT le même
// croissant (mêmes valeurs de |phase|) — on voyait deux croissants
// identiques au lieu d'un effet qui descend puis remonte en miroir.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.mp-card'));

  function motionAllowed() {
    if (reduceQuery.matches) return false;
    return root.getAttribute('data-moon-motion') !== 'off';
  }

  function setStatic() {
    root.style.setProperty('--moon-phase', .45);
    cards.forEach(function (el) { el.style.setProperty('--card-fade', 1); });
  }

  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    var maxScroll = document.documentElement.scrollHeight - vh;
    if (maxScroll > 0) {
      var s = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      var magnitude = 1 - Math.abs(2 * s - 1);
      var dir = s < .5 ? 1 : -1;
      root.style.setProperty('--moon-phase', (magnitude * dir).toFixed(3));
    }
    cards.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var elCenter = rect.top + rect.height / 2;
      var dist = Math.abs(elCenter - vh / 2);
      var range = vh / 2 + rect.height / 2;
      var progress = Math.max(0, 1 - dist / range);
      el.style.setProperty('--card-fade', progress.toFixed(3));
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  var scrubbing = false;
  function startScrub() {
    if (scrubbing) return;
    scrubbing = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
  function stopScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  }

  function apply() {
    if (motionAllowed()) {
      startScrub();
    } else {
      stopScrub();
      setStatic();
    }
  }

  apply();
  document.addEventListener('vl:motion-change', apply);
  reduceQuery.addEventListener('change', apply);
})();
