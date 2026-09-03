// Contrôles de structure et d'accessibilité pour le site Vesper Lab.
// Node natif, aucune dépendance. Usage : node scripts/check.mjs
import { readFileSync, existsSync } from 'node:fs';

let failures = 0;
const fail = (m) => { console.error('✗ ' + m); failures++; };
const ok = (m) => console.log('✓ ' + m);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// 1. Langue
/<html[^>]*\blang="fr"/.test(html) ? ok('html lang="fr"') : fail('html lang="fr" manquant');

// 2. Un seul <h1>
const h1s = html.match(/<h1[\s>]/g) || [];
h1s.length === 1 ? ok('un seul <h1>') : fail(h1s.length + ' <h1> (attendu 1)');

// 3. Hiérarchie de titres : h1 puis h2, h2, h3 — aucun saut
const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
const expected = [1, 2, 3, 2]; // logo, « Arrivée… », « En attendant… », « Utilisez l'écho »
JSON.stringify(levels) === JSON.stringify(expected)
  ? ok('hiérarchie de titres ' + levels.join(' '))
  : fail('hiérarchie de titres ' + JSON.stringify(levels) + ' (attendu ' + JSON.stringify(expected) + ')');

// 4. Skip-link vers une ancre existante
const skip = html.match(/<a[^>]+class="skip-link"[^>]+href="#([\w-]+)"/);
if (!skip) fail('skip-link absent');
else if (!new RegExp('id="' + skip[1] + '"').test(html)) fail('cible du skip-link #' + skip[1] + ' introuvable');
else ok('skip-link → #' + skip[1]);

// 5. <main id="main">
/<main[^>]+id="main"/.test(html) ? ok('<main id="main">') : fail('<main id="main"> manquant');

// 6. Landmarks header / main / footer
['header', 'main', 'footer'].forEach(t =>
  new RegExp('<' + t + '[\\s>]').test(html) ? ok('<' + t + '>') : fail('<' + t + '> manquant'));

// 7. Sections reliées à leur titre
for (const id of ['h-prep', 'h-echo']) {
  new RegExp('aria-labelledby="' + id + '"').test(html) && new RegExp('id="' + id + '"').test(html)
    ? ok('section aria-labelledby="' + id + '"')
    : fail('section/labelledby ' + id + ' incohérent');
}

// 8. Aucun target="_blank"
/target="_blank"/.test(html) ? fail('target="_blank" interdit') : ok('aucun target="_blank"');

// 9. Les trois liens sociaux, dans l'ordre, avec libellé visually-hidden
const social = ['https://github.com/VesperLab-A11Y',
                'https://buymeacoffee.com/vesperlab',
                'https://www.linkedin.com/in/paulinechevalliot'];
let last = -1, ordered = true;
for (const url of social) {
  const i = html.indexOf(url);
  if (i === -1) { fail('lien social manquant : ' + url); ordered = false; }
  else if (i < last) ordered = false;
  last = i;
}
ordered ? ok('3 liens sociaux dans l\'ordre GitHub → BMC → LinkedIn') : fail('liens sociaux absents ou mal ordonnés');
const vh = (html.match(/class="visually-hidden"/g) || []).length;
vh >= 3 ? ok(vh + ' libellés visually-hidden') : fail('moins de 3 libellés visually-hidden');

// 10. Contact : mailto en clair + bouton
(html.match(/href="mailto:contact@vesperlab\.dev"/g) || []).length >= 2
  ? ok('mailto:contact@vesperlab.dev présent (lien texte + bouton)')
  : fail('mailto:contact@vesperlab.dev doit apparaître 2 fois (lien texte + bouton)');
/class="button"[^>]*href="mailto:contact@vesperlab\.dev"|href="mailto:contact@vesperlab\.dev"[^>]*class="button"/.test(html)
  ? ok('bouton « Écrivez-moi » en mailto') : fail('bouton .button mailto manquant');

// 11. Icônes SVG décoratives neutralisées
const decoSvg = (html.match(/<svg[^>]+aria-hidden="true"[^>]+focusable="false"|<svg[^>]+focusable="false"[^>]+aria-hidden="true"/g) || []).length;
decoSvg >= 3 ? ok(decoSvg + ' SVG décoratifs (aria-hidden + focusable=false)') : fail('SVG d\'icônes non neutralisés');

// 12. <head> : title, description, canonical, OG
const head = [
  [/<title>Vesper Lab : Accessibilité numérique<\/title>/, 'title exact'],
  [/<meta name="description" content="Laboratoire d'accessibilité numérique, situé à Montréal\. Diagnostics web et PDF, en français et en anglais\.">/, 'meta description exacte'],
  [/<link rel="canonical" href="https:\/\/vesperlab\.dev\/">/, 'canonical'],
  [/<meta property="og:title"/, 'og:title'],
  [/<meta property="og:image" content="https:\/\/vesperlab\.dev\/assets\/og-image\.png">/, 'og:image absolu'],
  [/<meta name="theme-color" content="#0E0F0D">/, 'theme-color'],
  [/<link rel="icon" href="assets\/favicon\.svg" sizes="any">/, 'favicon svg'],
];
for (const [re, label] of head) re.test(html) ? ok(label) : fail(label + ' manquant/incorrect');

// 13. Aucun <script> dans la page
/<script[\s>]/.test(html) ? fail('<script> interdit dans index.html') : ok('aucun <script>');

// 14. Aucune ressource tierce (http/https absolus non vesperlab.dev, hors href de liens <a>)
const thirdParty = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
  .map(m => m[1])
  .filter(u => !u.startsWith('https://vesperlab.dev'))
  .filter(u => !/^https:\/\/(www\.linkedin\.com|github\.com|buymeacoffee\.com)/.test(u)); // liens <a> sociaux OK
thirdParty.length === 0 ? ok('aucune ressource tierce chargée') : fail('ressource tierce : ' + thirdParty.join(', '));

// 15. Fichiers assets référencés présents sur le disque
for (const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
  existsSync(new URL('../' + m[1], import.meta.url)) ? ok('asset ' + m[1]) : fail('asset introuvable : ' + m[1]);
}
// og-image.png n'est référencé que par une URL absolue (og:image) : on le vérifie à part.
existsSync(new URL('../assets/og-image.png', import.meta.url))
  ? ok('asset assets/og-image.png')
  : fail('asset introuvable : assets/og-image.png');

// 16. Textes de contenu obligatoires (verbatim)
const copy = [
  'L’obscurité ne ferme rien à qui sait',
  'Normes WCAG 2.2 et SGQRI 008',
  'Arrivée prévue à l’automne 2026',
  'et de nombreux conseils sont en préparation',
  'En attendant le crépuscule',
  'Utilisez l’écho',
  'ou en m’écrivant directement',
  'Ce site respecte les critères d’accessibilité WCAG 2.2 AA',
  'Créé par Vesper Lab',
];
for (const s of copy) html.includes(s) ? ok('copie : « ' + s.slice(0, 32) + '… »') : fail('copie manquante : « ' + s + ' »');

console.log(failures ? `\n${failures} échec(s)` : '\nTout est vert.');
process.exit(failures ? 1 : 0);
