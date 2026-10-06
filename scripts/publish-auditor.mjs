// ============================================================================
// publish-auditor.mjs — met un export de Vesper Auditor en ligne sur le site
// ----------------------------------------------------------------------------
// Node natif, aucune dépendance. Usage :
//     node scripts/publish-auditor.mjs <declaration|diagnostic> <fr|en> <fichier-exporté.html>
//
// Prend un fichier exporté par Auditor (déclaration ou diagnostic) et l'écrit à
// l'adresse prévue du site. Ces pages sont marquées "generated": true dans
// src/site.json : build-site.mjs ne les écrase donc jamais.
//
// Ce que le script change, et rien d'autre :
//   - polices : le lien Google Fonts est remplacé par les @font-face du site
//     (assets/fonts, déjà hébergées ici : aucune requête vers un tiers) ;
//   - thème : <html data-theme="dark" data-default-theme="dark">, comme le site
//     (sombre par défaut). Le script du document lit ensuite « vl-theme », le
//     même choix que les options d'accessibilité du site, et l'écrit quand on
//     bascule ;
//   - <head> : favicon, color-scheme, canonique et version dans l'autre langue.
// Le contenu du document n'est pas touché.
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT } from './lib/template.mjs';

const PATHS = {
  declaration: { fr: '/declaration-accessibilite/', en: '/en/accessibility-statement/' },
  diagnostic:  { fr: '/diagnostic-accessibilite/',  en: '/en/accessibility-diagnosis/' },
};

const [kind, lang, file] = process.argv.slice(2);
if (!PATHS[kind] || !['fr', 'en'].includes(lang) || !file) {
  console.error('Usage : node scripts/publish-auditor.mjs <declaration|diagnostic> <fr|en> <fichier.html>');
  process.exit(1);
}
const other = lang === 'fr' ? 'en' : 'fr';
const SITE = 'https://vesperlab.dev';

// @font-face du site (style.css), avec des chemins absolus pour fonctionner depuis n'importe quelle page.
const css = readFileSync(join(ROOT, 'style.css'), 'utf8');
const fontFaces = (css.match(/@font-face\s*\{[^}]*\}/g) || [])
  .map((b) => b.replace(/url\('assets\/fonts\//g, "url('/assets/fonts/"))
  .join('\n');
if (!fontFaces) { console.error('✗ @font-face introuvables dans style.css'); process.exit(1); }

let html = readFileSync(file, 'utf8');
const must = (cond, msg) => { if (!cond) { console.error('✗ ' + msg); process.exit(1); } };

// 1. polices
const fontLink = /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/;
must(fontLink.test(html), 'lien Google Fonts introuvable (fichier déjà transformé ?)');
html = html.replace(fontLink, '');
must(html.includes('<style>\n'), '<style> introuvable');
html = html.replace('<style>\n', '<style>\n' + fontFaces + '\n');

// 2. thème sombre par défaut
const htmlTag = new RegExp('<html lang="' + lang + '">');
must(htmlTag.test(html), '<html lang="' + lang + '"> attendu — mauvaise langue ?');
html = html.replace(htmlTag, '<html lang="' + lang + '" data-theme="dark" data-default-theme="dark">');

// 3. <head> : icône, color-scheme, canonique, autre langue
const mine = PATHS[kind][lang], alt = PATHS[kind][other];
const headExtra =
  '<meta name="color-scheme" content="dark light">\n' +
  '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">\n' +
  '<link rel="canonical" href="' + SITE + mine + '">\n' +
  '<link rel="alternate" hreflang="' + lang + '" href="' + SITE + mine + '">\n' +
  '<link rel="alternate" hreflang="' + other + '" href="' + SITE + alt + '">\n';
must(html.includes('<title>'), '<title> introuvable');
html = html.replace('<title>', headExtra + '<title>');

const out = join(ROOT, mine.replace(/^\/|\/$/g, ''), 'index.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log('✓ ' + out.replace(ROOT, '.') + '  (' + Math.round(html.length / 1024) + ' Ko)');
