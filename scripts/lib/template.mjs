// ============================================================================
// template.mjs — briques communes aux assembleurs (build-site, build-blog)
// Node natif, aucune dépendance.
// ============================================================================

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const read = (p) => readFileSync(join(ROOT, p), 'utf8');

export const OG_LOCALE = { fr: 'fr_CA', en: 'en_CA' };

// Partiels disponibles pour {{> nom}}
export const partials = {
  header: read('src/partials/header.html'),
  footer: read('src/partials/footer.html'),
};

// Rend les id="..." d'un fragment inliné (et leurs références internes :
// aria-labelledby/aria-describedby="...", href="#...", url(#...)) uniques
// dans la page en leur ajoutant un suffixe — sinon deux copies du même SVG
// (logo en-tête + logo pied de page, par ex.) se retrouvent avec le même id
// deux fois dans le même document, ce qui est invalide en HTML et rend
// l'aria-labelledby ambigu pour les technologies d'assistance. N'affecte que
// les id trouvés DANS ce fragment (pas de risque de renommer un id sans
// rapport ailleurs sur la page).
let inlineCounter = 0;
function uniquifyInlineIds(fragment) {
  const ids = [...fragment.matchAll(/\bid="([\w-]+)"/g)].map((m) => m[1]);
  if (ids.length === 0) return fragment;
  inlineCounter += 1;
  let out = fragment;
  for (const id of [...new Set(ids)]) {
    const suffixed = id + '-inline' + inlineCounter;
    out = out.split('id="' + id + '"').join('id="' + suffixed + '"');
    out = out.split('="' + id + '"').join('="' + suffixed + '"'); // aria-labelledby / aria-describedby
    out = out.split('(#' + id + ')').join('(#' + suffixed + ')'); // url(#id)
    out = out.split('href="#' + id + '"').join('href="#' + suffixed + '"');
  }
  return out;
}

// Rendu d'un gabarit :
//   {{> nom}}          -> partiel src/partials/<nom>.html (déjà chargé)
//   {{inline:chemin}}  -> contenu brut d'un fichier du dépôt, id internes uniquifiés
//   {{cle}} {{a.b}}    -> vars[cle] ; laissé tel quel si absent
export function render(tpl, vars) {
  let out = tpl.replace(/\{\{>\s*(\w+)\s*\}\}/g, (_, name) => partials[name] || '');
  out = out.replace(/\{\{inline:([^}]+)\}\}/g, (_, p) => uniquifyInlineIds(read(p.trim()).trim()));
  // [\w.-] : autorise les tirets dans les clés (ex. nav.lelab-outils).
  out = out.replace(/\{\{([\w.-]+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
  return out;
}

// Variables i18n préfixées : { navAccueil: "Accueil" } -> { "i18n.navAccueil": "Accueil" }
export function i18nVars(dict) {
  const v = {};
  for (const [k, val] of Object.entries(dict)) if (k[0] !== '_') v['i18n.' + k] = val;
  return v;
}

// Un fragment EN est considéré non traduit s'il porte encore ce marqueur de
// squelette (voir tous les src/pages/en/*.html générés jusqu'ici). Pauline
// le retire naturellement en écrivant le vrai contenu, rien à cocher à la
// main ailleurs.
const UNTRANSLATED_MARKER = '<!-- TODO : contenu -->';
export const isUntranslated = (frag) => frag.includes(UNTRANSLATED_MARKER);

// Domaine translate.goog (proxy de traduction que Chrome utilise lui-même
// pour son bouton "Traduire") : le domaine d'origine, points remplacés par
// des tirets, sous-domaine de translate.goog. Permet de traduire une page
// précise d'un clic, sans widget ni script tiers embarqué sur le site (voir
// discussion Pauline du 2026-09-18).
const TRANSLATE_HOST = 'vesperlab-dev.translate.goog';

// Bandeau affiché à la place d'un fragment EN non traduit : contenu FR
// replié en dessous (voir build-site.mjs/build-blog.mjs), ce bandeau
// explique pourquoi et propose une traduction automatique via Google.
// Statique (présent au chargement, pas injecté par JS) : lu dans l'ordre
// naturel par un lecteur d'écran, aucune gestion de focus/annonce à coder.
export function renderTranslationBanner(frPath) {
  const translateUrl = `https://${TRANSLATE_HOST}${frPath}?_x_tr_sl=fr&_x_tr_tl=en&_x_tr_hl=en`;
  return `<div class="translation-notice">
  <p>This page hasn't been translated into English yet. You're reading the French original below.</p>
  <p>I translate each page by hand, so it takes a while. Want it now?</p>
  <a class="button button-ghost" href="${translateUrl}">Translate this page with Google Translate</a>
</div>`;
}
