// ============================================================================
// check.mjs — contrôles de structure et d'accessibilité sur TOUTES les pages
// ----------------------------------------------------------------------------
// Node natif, aucune dépendance. Usage : node scripts/check.mjs
// (ou : npm run check). Les pages viennent de sitemap.xml.
//
// Contrôlé sur chaque page : langue (fr ou en selon l'adresse), un seul <h1>,
// titres sans saut de niveau, <title> non vide, images avec alt, aucune
// ressource tierce chargée (scripts, feuilles de style, images, polices),
// liens internes qui existent, ancres #id qui existent.
// Pages du site (pas les exports d'Auditor) : lien d'évitement vers un <main id>,
// repères header / main / footer, meta description, hreflang réciproques.
// Aussi : chaque page présente sur le disque est dans le sitemap.
//
// Le contenu des blocs <script type="application/json"> (diagnostic d'origine
// et annexes embarqués dans les rapports) n'est pas analysé : c'est une archive.
// ============================================================================
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://vesperlab.dev';
let failures = 0, checks = 0;
const fail = (page, m) => { console.error('✗ ' + page + ' — ' + m); failures++; };
const pass = () => { checks++; };

// Pages produites par Vesper Auditor : mêmes exigences de base, mais pas le gabarit du site.
const EXPORTS = new Set(['/declaration-accessibilite/', '/en/accessibility-statement/', '/diagnostic-accessibilite/', '/en/accessibility-diagnosis/']);

const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace(SITE, ''));
const fileOf = (p) => join(ROOT, p.replace(/^\//, ''), p.endsWith('/') ? 'index.html' : '');
const exists = (p) => { const f = fileOf(p); return existsSync(f) && statSync(f).isFile(); };

// 0. Le sitemap décrit des pages qui existent, et toutes les pages existantes y sont.
for (const u of urls) exists(u) ? pass() : fail(u, 'dans le sitemap mais absente du disque');
const onDisk = [];
(function walk(dir, rel) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name.startsWith('_') || ['node_modules', 'docs', 'src', 'scripts', 'assets', 'i18n', 'styles'].includes(e.name)) continue;
    if (e.isDirectory()) walk(join(dir, e.name), rel + e.name + '/');
    else if (e.name === 'index.html' && rel) onDisk.push('/' + rel);
  }
})(ROOT, '');
for (const p of onDisk) urls.includes(p) ? pass() : fail(p, 'existe mais n\'est pas dans le sitemap');

const altOf = (page, html) => {
  const m = html.match(/<link[^>]+rel="alternate"[^>]*>/g) || [];
  return Object.fromEntries(m.map((t) => [(t.match(/hreflang="([^"]+)"/) || [])[1], ((t.match(/href="([^"]+)"/) || [])[1] || '').replace(SITE, '')]));
};
const pages = {};
for (const u of urls) if (exists(u)) pages[u] = readFileSync(fileOf(u), 'utf8');

for (const [u, raw] of Object.entries(pages)) {
  // on retire ce qui n'est pas du HTML du site : scripts, styles et archives JSON embarquées
  const html = raw.replace(/<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/gi, '');
  const scriptless = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const isExport = EXPORTS.has(u);
  const wantLang = u.startsWith('/en/') ? 'en' : 'fr';

  (new RegExp('<html[^>]*\\blang="' + wantLang + '"').test(html)) ? pass() : fail(u, 'lang="' + wantLang + '" attendu');
  const h1 = scriptless.match(/<h1[\s>]/g) || [];
  h1.length === 1 ? pass() : fail(u, h1.length + ' <h1> (attendu 1)');
  const levels = [...scriptless.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  let prev = 0, jump = null;
  for (const l of levels) { if (prev && l > prev + 1) { jump = prev + '→' + l; break; } prev = l; }
  jump ? fail(u, 'saut de titres ' + jump) : pass();
  /<title>[^<]+<\/title>/.test(html) ? pass() : fail(u, '<title> vide ou absent');
  for (const t of scriptless.match(/<img\b[^>]*>/g) || []) /\balt=/.test(t) ? pass() : fail(u, 'image sans alt : ' + t.slice(0, 80));

  // ressources tierces : tout src / href de feuille de style ou d'icône qui part hors du site
  for (const m of scriptless.matchAll(/<(?:script|img|source|iframe|link)\b[^>]*?(?:src|href)="(https?:\/\/[^"]+)"[^>]*>/g)) {
    const tag = m[0];
    if (/<link\b/.test(tag) && !/rel="(?:stylesheet|preload|icon|apple-touch-icon)"/.test(tag)) continue;  // canonical, alternate… ne chargent rien
    if (m[1].startsWith(SITE)) continue;
    fail(u, 'ressource tierce : ' + m[1]);
  }
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="(https?:\/\/[^"]+)"/g)) if (!m[1].startsWith(SITE)) fail(u, 'script tiers : ' + m[1]);

  // liens internes + ancres
  // les ancres des liens d'archive (#annexe-html-N) pointent vers les blocs JSON embarqués : on prend les id du fichier brut
  const ids = new Set([...raw.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of scriptless.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (!href || /^(mailto:|tel:|javascript:|data:)/.test(href)) continue;
    let target = href.replace(SITE, '');
    if (/^https?:/.test(target)) continue;               // lien externe : hors contrôle
    const [pathPart, hash] = target.split('#');
    if (!pathPart) { if (hash && !ids.has(hash)) fail(u, 'ancre #' + hash + ' introuvable'); else pass(); continue; }
    const abs = pathPart.startsWith('/') ? pathPart : new URL(pathPart, 'https://x' + u).pathname;
    const clean = abs.split('?')[0];
    const ok = existsSync(join(ROOT, clean)) && (statSync(join(ROOT, clean)).isFile() || existsSync(join(ROOT, clean, 'index.html')));
    ok ? pass() : fail(u, 'lien interne cassé : ' + href);
  }

  if (isExport) continue;
  // pages du site
  const skip = html.match(/<a[^>]+class="skip-link"[^>]+href="#([\w-]+)"/);
  (skip && new RegExp('id="' + skip[1] + '"').test(html)) ? pass() : fail(u, 'lien d\'évitement absent ou sans cible');
  /<main[^>]+id="main"/.test(html) ? pass() : fail(u, '<main id="main"> manquant');
  for (const t of ['header', 'footer']) new RegExp('<' + t + '[\\s>]').test(html) ? pass() : fail(u, '<' + t + '> manquant');
  /<meta name="description" content="[^"]{10,}"/.test(html) ? pass() : fail(u, 'meta description absente');
  const alt = altOf(u, html), other = wantLang === 'fr' ? 'en' : 'fr';
  if (!alt[other]) { fail(u, 'hreflang ' + other + ' absent'); continue; }
  const back = altOf(alt[other], pages[alt[other]] || '');
  back[wantLang] === u ? pass() : fail(u, 'hreflang non réciproque avec ' + alt[other]);
}

console.log('\n' + Object.keys(pages).length + ' pages, ' + checks + ' contrôles réussis, ' + failures + ' échec(s).');
process.exit(failures ? 1 : 0);
