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

// Rendu d'un gabarit :
//   {{> nom}}          -> partiel src/partials/<nom>.html (déjà chargé)
//   {{inline:chemin}}  -> contenu brut d'un fichier du dépôt
//   {{cle}} {{a.b}}    -> vars[cle] ; laissé tel quel si absent
export function render(tpl, vars) {
  let out = tpl.replace(/\{\{>\s*(\w+)\s*\}\}/g, (_, name) => partials[name] || '');
  out = out.replace(/\{\{inline:([^}]+)\}\}/g, (_, p) => read(p.trim()).trim());
  out = out.replace(/\{\{([\w.]+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
  return out;
}

// Variables i18n préfixées : { navAccueil: "Accueil" } -> { "i18n.navAccueil": "Accueil" }
export function i18nVars(dict) {
  const v = {};
  for (const [k, val] of Object.entries(dict)) if (k[0] !== '_') v['i18n.' + k] = val;
  return v;
}
