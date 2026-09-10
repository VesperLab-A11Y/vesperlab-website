// ============================================================================
// build-site.mjs — assemblage des pages « fixes » du site Vesper Lab
// ----------------------------------------------------------------------------
// Node natif, aucune dépendance. Lancé à la main avant un push :
//     node scripts/build-site.mjs      (ou : npm run build)
//
// Entrées :
//   src/site.json               — inventaire des pages (chemins, titres, meta)
//   src/partials/layout.html    — gabarit HTML complet, avec {{variables}}
//   src/partials/{header,footer}.html
//   src/pages/<key>.html         — fragment de contenu FR (l'intérieur de <main>)
//   src/pages/en/<key>.html      — fragment de contenu EN
//   i18n/ui.fr.json / ui.en.json — libellés d'interface
//
// Sorties, écrites à la racine du dépôt :
//   <chemin>/index.html          — une page par entrée × langue
//   index.generated.html         — l'accueil FR. NE remplace PAS index.html tant
//                                  que Pauline n'a pas basculé le site (voir plan).
//   sitemap.generated.xml        — sitemap proposé (ne remplace pas sitemap.xml)
//
// Les entrées marquées "generated": true dans site.json sont ignorées ici
// (le blog est produit par build-blog.mjs), mais leur chemin sert quand même
// à fabriquer les liens de navigation.
// ============================================================================

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT, read, render, i18nVars, OG_LOCALE } from './lib/template.mjs';

const site = JSON.parse(read('src/site.json'));
const ui = { fr: JSON.parse(read('i18n/ui.fr.json')), en: JSON.parse(read('i18n/ui.en.json')) };
const layout = read('src/partials/layout.html');
const LANGS = ['fr', 'en'];

// URL -> chemin de fichier. « / » est dévié pour ne pas écraser l'index.html live.
const outFor = (path, lang) =>
  lang === 'fr' && path === '/' ? 'index.generated.html' : path.replace(/^\/|\/$/g, '') + '/index.html';

const sitemapUrls = [];
let count = 0;

for (const lang of LANGS) {
  const pathByKey = Object.fromEntries(site.pages.map((p) => [p.key, p[lang].path]));

  for (const page of site.pages) {
    const meta = page[lang];
    sitemapUrls.push('https://vesperlab.dev' + meta.path);
    if (page.generated) continue;

    const fragPath = lang === 'fr' ? `src/pages/${page.key}.html` : `src/pages/en/${page.key}.html`;
    if (!existsSync(join(ROOT, fragPath))) {
      console.warn('  (ignoré, fragment absent) ' + fragPath);
      continue;
    }

    const other = lang === 'fr' ? 'en' : 'fr';
    const vars = {
      ...i18nVars(ui[lang]),
      lang,
      ogLocale: OG_LOCALE[lang],
      title: meta.title,
      description: meta.description,
      path: meta.path,
      pathFr: page.fr.path,
      pathEn: page.en.path,
      home: pathByKey.accueil,
      langToggleHref: page[other].path,
      langToggleLang: other,
    };
    for (const key of site.navKeys) {
      vars['nav.' + key] = pathByKey[key] || '#';
      vars['aria.' + key] = page.key === key ? ' aria-current="page"' : '';
    }
    vars.main = render(read(fragPath), vars).trim();

    const outPath = outFor(meta.path, lang);
    mkdirSync(join(ROOT, dirname(outPath)), { recursive: true });
    writeFileSync(join(ROOT, outPath), render(layout, vars), 'utf8');
    console.log('✓ ' + outPath);
    count++;
  }
}

const sm =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls.map((u) => '  <url><loc>' + u + '</loc></url>').join('\n') +
  '\n</urlset>\n';
writeFileSync(join(ROOT, 'sitemap.generated.xml'), sm, 'utf8');

console.log('\n' + count + ' page(s) fixe(s) assemblée(s). sitemap.generated.xml écrit.');
