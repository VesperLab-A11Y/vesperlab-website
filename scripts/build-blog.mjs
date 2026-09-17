// ============================================================================
// build-blog.mjs — génère le blog à partir d'articles Markdown
// ----------------------------------------------------------------------------
// Node natif, aucune dépendance. Lancé après build-site.mjs (npm run build).
//
// Entrées :
//   blog/_posts/AAAA-MM-JJ-slug.md        — articles FR
//   blog/_posts/en/AAAA-MM-JJ-slug.md     — articles EN (mêmes slugs conseillés)
//   src/partials/layout.html + partials + i18n + src/site.json
//
// En-tête d'article (front matter) entre deux lignes « --- » :
//   title:        Titre de l'article
//   description:  Résumé court (meta + liste + flux)
//   updated:      AAAA-MM-JJ         (optionnel)
//   category:     Catégorie affichée en badge sur la galerie (optionnel)
//   tags:         Mots-clefs séparés par des virgules (optionnel)
//   image:        Chemin d'une image de galerie, PAS forcément une
//                 illustration de l'article (optionnel — voir mdToHtml/
//                 parsePost : le parsing du front matter est générique,
//                 aucun changement de code n'est nécessaire pour ajouter
//                 un champ, seule la génération de la galerie plus bas lit
//                 category/tags/image explicitement)
//
// Sorties, à la racine du dépôt :
//   blog/<slug>/index.html            + en/blog/<slug>/index.html
//   blog/index.html (galerie)         + en/blog/index.html
//   blog/feed.xml (RSS, FR)
//
// Le rendu Markdown couvre ce dont un article a besoin (titres, paragraphes,
// gras/italique, liens, images, listes, citations, code, filets). Pour du
// CommonMark complet : `npm i -D marked` puis remplacer mdToHtml() par un appel
// à marked — le reste du script ne change pas.
// ============================================================================

import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, render, i18nVars, OG_LOCALE } from './lib/template.mjs';

const site = JSON.parse(read('src/site.json'));
const ui = { fr: JSON.parse(read('i18n/ui.fr.json')), en: JSON.parse(read('i18n/ui.en.json')) };
const layout = read('src/partials/layout.html');
const blogPage = site.pages.find((p) => p.key === 'blog');
const DATE_FMT = { fr: 'fr-CA', en: 'en-CA' };
const LABEL = {
  fr: { published: 'Publié le', updated: 'Mis à jour le', empty: 'Aucun article pour le moment.' },
  en: { published: 'Published', updated: 'Updated', empty: 'No articles yet.' },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- Markdown -> HTML (sous-ensemble suffisant pour un article) ---------------
function inline(s) {
  return esc(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, a, u) => `<img src="${u}" alt="${a}">`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}
function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let para = [], list = null, listTag = '', quote = [], code = null;
  const flushPara = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
  const flushList = () => { if (list) { out.push(`<${listTag}>\n` + list.map((li) => '  <li>' + inline(li) + '</li>').join('\n') + `\n</${listTag}>`); list = null; } };
  const flushQuote = () => { if (quote.length) { out.push('<blockquote>\n<p>' + inline(quote.join(' ')) + '</p>\n</blockquote>'); quote = []; } };
  const flushAll = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (code !== null) {
      if (line.trim() === '```') { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; }
      else code.push(raw);
      continue;
    }
    if (line.trim() === '```') { flushAll(); code = []; continue; }
    if (!line.trim()) { flushAll(); continue; }
    const h = line.match(/^(#{2,6})\s+(.*)$/); // h1 = titre de l'article, pas dans le corps
    if (h) { flushAll(); out.push(`<h${h[1].length}>` + inline(h[2]) + `</h${h[1].length}>`); continue; }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { flushAll(); out.push('<hr>'); continue; }
    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara(); flushQuote();
      const tag = ul ? 'ul' : 'ol';
      if (list && listTag !== tag) flushList();
      listTag = tag; (list ||= []).push((ul || ol)[1]);
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { flushPara(); flushList(); quote.push(q[1]); continue; }
    flushList(); flushQuote(); para.push(line.trim());
  }
  flushAll();
  return out.join('\n');
}

// --- Front matter -----------------------------------------------------------
function parsePost(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}

function readPosts(dir) {
  if (!existsSync(join(ROOT, dir))) return [];
  return readdirSync(join(ROOT, dir))
    .filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f))
    .map((f) => {
      const { meta, body } = parsePost(read(join(dir, f)));
      const date = f.slice(0, 10);
      const slug = f.slice(11, -3);
      return { date, slug, meta, body };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // plus récent d'abord
}

// --- Assemblage -----------------------------------------------------------
function navVars(lang, activePath) {
  const pathByKey = Object.fromEntries(site.pages.map((p) => [p.key, p[lang].path]));
  const v = { ...i18nVars(ui[lang]), lang, ogLocale: OG_LOCALE[lang], home: pathByKey.accueil };
  // Toutes les pages (pas seulement navKeys) : le header a besoin du sous-menu LAB.
  for (const p of site.pages) {
    v['nav.' + p.key] = pathByKey[p.key] || '#';
    v['aria.' + p.key] = pathByKey[p.key] === activePath ? ' aria-current="page"' : '';
  }
  return v;
}

let count = 0;
const feedItems = [];

for (const lang of ['fr', 'en']) {
  const postsDir = lang === 'fr' ? 'blog/_posts' : 'blog/_posts/en';
  const posts = readPosts(postsDir);
  const blogRoot = blogPage[lang].path; // /blog/ ou /en/blog/
  const L = LABEL[lang];

  // Pages d'articles
  for (const post of posts) {
    const url = blogRoot + post.slug + '/';
    const human = new Date(post.date + 'T12:00:00Z').toLocaleDateString(DATE_FMT[lang], { year: 'numeric', month: 'long', day: 'numeric' });
    let article =
      `<article class="post">\n` +
      `<h1>${esc(post.meta.title || post.slug)}</h1>\n` +
      `<p class="post-meta"><time datetime="${post.date}">${L.published} ${human}</time>` +
      (post.meta.updated ? ` · <time datetime="${post.meta.updated}">${L.updated} ${post.meta.updated}</time>` : '') +
      `</p>\n` +
      mdToHtml(post.body).trim() + `\n</article>`;

    const other = lang === 'fr' ? 'en' : 'fr';
    const vars = {
      ...navVars(lang, blogRoot),
      pageKey: 'blog',
      title: `${post.meta.title || post.slug} — Vesper Lab`,
      description: post.meta.description || '',
      path: url,
      pathFr: (lang === 'fr' ? blogRoot : site.pages.find((p) => p.key === 'blog').fr.path) + post.slug + '/',
      pathEn: (lang === 'en' ? blogRoot : site.pages.find((p) => p.key === 'blog').en.path) + post.slug + '/',
      langToggleHref: (blogPage[other].path) + post.slug + '/',
      langToggleLang: other,
      main: article,
    };
    const outPath = url.replace(/^\/|\/$/g, '') + '/index.html';
    mkdirSync(join(ROOT, outPath.replace(/\/index\.html$/, '')), { recursive: true });
    writeFileSync(join(ROOT, outPath), render(layout, vars), 'utf8');
    console.log('✓ ' + outPath);
    count++;

    if (lang === 'fr') {
      feedItems.push(
        `  <item>\n    <title>${esc(post.meta.title || post.slug)}</title>\n` +
        `    <link>https://vesperlab.dev${url}</link>\n` +
        `    <guid>https://vesperlab.dev${url}</guid>\n` +
        `    <pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate>\n` +
        (post.meta.description ? `    <description>${esc(post.meta.description)}</description>\n` : '') +
        `  </item>`
      );
    }
  }

  // Page liste : galerie destructurée (voir style.css, ".blog-gallery"). Les
  // variantes de taille des cartes sont gérées en CSS pur (nth-child), pas de
  // champ à remplir dans le front matter pour ça.
  const gallery = posts.length
    ? `<ul class="blog-gallery">\n` + posts.map((p) => {
        const human = new Date(p.date + 'T12:00:00Z').toLocaleDateString(DATE_FMT[lang], { year: 'numeric', month: 'long', day: 'numeric' });
        const tags = (p.meta.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
        // data-search : texte à plat pour le filtre client (assets/js/blog-search.js),
        // pas juste le innerText de la carte (qui inclurait la date affichée).
        const searchText = [p.meta.title, p.meta.description, p.meta.category, tags.join(' ')]
          .filter(Boolean).join(' ').toLowerCase();
        return `  <li class="blog-entry mp-card" data-search="${esc(searchText)}">\n` +
          (p.meta.image ? `    <div class="blog-entry-image"><img src="${esc(p.meta.image)}" alt="" loading="lazy"></div>\n` : '') +
          `    <div class="blog-entry-body">\n` +
          (p.meta.category ? `      <span class="entry-badge entry-badge--category">${esc(p.meta.category)}</span>\n` : '') +
          `      <h2><a href="${blogRoot}${p.slug}/">${esc(p.meta.title || p.slug)}</a></h2>\n` +
          `      <p class="post-meta"><time datetime="${p.date}">${human}</time></p>\n` +
          (p.meta.description ? `      <p class="blog-entry-desc">${esc(p.meta.description)}</p>\n` : '') +
          (tags.length ? `      <ul class="blog-tags">\n` + tags.map((t) => `        <li class="blog-tag">${esc(t)}</li>`).join('\n') + `\n      </ul>\n` : '') +
          `    </div>\n  </li>`;
      }).join('\n') + `\n</ul>`
    : `<p>${L.empty}</p>`;

  // L'accroche/intro vit dans src/pages/blog.html (FR) — pas dans
  // build-site.mjs, qui ne construit jamais /blog/ puisque ce script écrase
  // sa sortie : voir le commentaire en tête de src/pages/blog.html.
  const heroHtml = lang === 'fr'
    ? read('src/pages/blog.html').replace(/<!--[\s\S]*?-->/g, '').trim()
    : `<section class="hero">\n  <h1>Blog</h1>\n</section>`;

  const other = lang === 'fr' ? 'en' : 'fr';
  const listVars = {
    ...navVars(lang, blogRoot),
    pageKey: 'blog',
    title: blogPage[lang].title,
    description: blogPage[lang].description,
    path: blogRoot,
    pathFr: blogPage.fr.path,
    pathEn: blogPage.en.path,
    langToggleHref: blogPage[other].path,
    langToggleLang: other,
    main: `${heroHtml}\n${gallery}`,
  };
  const listOut = blogRoot.replace(/^\/|\/$/g, '') + '/index.html';
  mkdirSync(join(ROOT, listOut.replace(/\/index\.html$/, '')), { recursive: true });
  writeFileSync(join(ROOT, listOut), render(layout, listVars), 'utf8');
  console.log('✓ ' + listOut + ' (liste, ' + posts.length + ' article(s))');
  count++;
}

// Flux RSS (FR)
const feed =
  `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n` +
  `  <title>Vesper Lab — Blog</title>\n  <link>https://vesperlab.dev/blog/</link>\n` +
  `  <description>Articles sur l'accessibilité numérique.</description>\n  <language>fr-CA</language>\n` +
  feedItems.join('\n') + `\n</channel>\n</rss>\n`;
writeFileSync(join(ROOT, 'blog/feed.xml'), feed, 'utf8');

console.log('\n' + count + ' fichier(s) blog. blog/feed.xml écrit.');
