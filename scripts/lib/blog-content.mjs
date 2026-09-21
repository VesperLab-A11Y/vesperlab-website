// ============================================================================
// blog-content.mjs — transformations pures Markdown/front matter -> HTML.
// Aucune I/O ici (pas de fs) : testable directement, sans exécuter le build.
// ============================================================================
//
// Convention d'échappement HTML :
// - Les fonctions qui reçoivent un fragment déjà extrait d'un texte source
//   passé par esc() (ex. renderFigure, appelée depuis flushPara sur un
//   résultat de esc(para[0])) l'utilisent tel quel : il est déjà échappé.
// - Les fonctions qui reçoivent des valeurs brutes (front matter ou
//   paramètres fournis par l'appelant) appellent esc() elles-mêmes sur
//   chaque valeur insérée dans un attribut ou un texte : renderResources,
//   renderCta, renderBackLink, et renderToc pour son titre de section.
// - calloutLabel (mdToHtml) et icon (renderBackLink) sont des chaînes de
//   confiance fournies par build-blog.mjs (LABEL, et un fichier SVG lu sur
//   disque), jamais du contenu d'article : insérées telles quelles, sans esc().
// ============================================================================

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// --- Markdown -> HTML (sous-ensemble suffisant pour un article) ---------------
export function inline(s) {
  // esc(s) tourne avant le parsing Markdown ci-dessous : un guillemet droit
  // dans le titre d'une image devient donc &quot; avant que la regex
  // n'atteigne cette portion — d'où &quot; (et non ") comme délimiteur ici
  // et dans IMAGE_ONLY_RE plus bas.
  return esc(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;.*?&quot;)?\)/g, (_, a, u) => `<img src="${u}" alt="${a}">`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
}

// --- Slugification et TOC ---------------------------------------------------
export function slugify(s) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- Callout marker regex ---------------------------------------------------
const CALLOUT_MARK_RE = /^\[!INFO\]\s*$/i;

// --- Image-only regex et figure helper ---
// Reçoit une ligne déjà passée par esc() (voir flushPara) : un guillemet
// droit autour du titre est donc déjà &quot;, pas ".
const IMAGE_ONLY_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;(.*)&quot;)?\)$/;

function renderFigure(alt, src, caption) {
  const img = `<img src="${src}" alt="${alt}" loading="lazy">`;
  if (!caption) return `<figure>\n${img}\n</figure>`;
  return `<figure>\n${img}\n<figcaption>${caption}</figcaption>\n</figure>`;
}

// Rendu du corps d'un callout [!INFO] : paragraphes séparés par une ligne
// « > » vide et listes à puces/numérotées, comme le corps principal, mais
// sans titres/images/citations imbriquées (pas besoin pour l'instant).
function renderCalloutBody(lines) {
  const out = [];
  let para = [], list = null, listTag = '';
  const flushPara = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } };
  const flushList = () => { if (list) { out.push(`<${listTag}>\n` + list.map((li) => '  <li>' + inline(li) + '</li>').join('\n') + `\n</${listTag}>`); list = null; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const tag = ul ? 'ul' : 'ol';
      if (list && listTag !== tag) flushList();
      listTag = tag; (list ||= []).push((ul || ol)[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return out.join('\n');
}

function uniqueSlug(base, used) {
  const root = base || 'section';
  let slug = root, i = 2;
  while (used.has(slug)) { slug = `${root}-${i}`; i += 1; }
  used.add(slug);
  return slug;
}

export function mdToHtml(md, options = {}) {
  const calloutLabel = options.calloutLabel || 'Le saviez-vous ?';
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  const usedIds = new Set();
  let para = [], list = null, listTag = '', quote = [], quoteIsCallout = false, code = null;
  const flushPara = () => {
    if (!para.length) return;
    if (para.length === 1) {
      const imgOnly = esc(para[0]).match(IMAGE_ONLY_RE);
      if (imgOnly) { out.push(renderFigure(imgOnly[1], imgOnly[2], imgOnly[3])); para = []; return; }
    }
    out.push('<p>' + inline(para.join(' ')) + '</p>');
    para = [];
  };
  const flushList = () => { if (list) { out.push(`<${listTag}>\n` + list.map((li) => '  <li>' + inline(li) + '</li>').join('\n') + `\n</${listTag}>`); list = null; } };
  const flushQuote = () => {
    if (!quote.length) { quoteIsCallout = false; return; }
    if (quoteIsCallout) {
      out.push('<aside class="callout" role="note">\n<p class="callout-label">' + calloutLabel + '</p>\n' + renderCalloutBody(quote) + '\n</aside>');
    } else {
      out.push('<blockquote>\n<p>' + inline(quote.join(' ')) + '</p>\n</blockquote>');
    }
    quote = [];
    quoteIsCallout = false;
  };
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
    if (h) {
      flushAll();
      const level = h[1].length;
      const text = h[2];
      if (level === 2) {
        const id = uniqueSlug(slugify(text), usedIds);
        headings.push({ id, text: inline(text) });
        out.push(`<h2 id="${id}">` + inline(text) + `</h2>`);
      } else {
        out.push(`<h${level}>` + inline(text) + `</h${level}>`);
      }
      continue;
    }
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
    if (q) {
      flushPara(); flushList();
      if (!quote.length && CALLOUT_MARK_RE.test(q[1])) { quoteIsCallout = true; }
      else quote.push(q[1]);
      continue;
    }
    flushList(); flushQuote(); para.push(line.trim());
  }
  flushAll();
  return { html: out.join('\n'), headings };
}

export function renderToc(headings, headingText) {
  if (!headings.length) return '';
  // Le texte de l'ancre est du texte simple : h.text est du HTML déjà rendu
  // (inline() sur le titre), qui peut contenir un <a> si le titre contient un
  // lien Markdown. On retire les balises pour éviter un <a> imbriqué dans le
  // <a href="#..."> du sommaire — on perd le formatage (gras/lien) dans le
  // sommaire, mais l'ancre reste du HTML valide.
  const items = headings.map((h) => `    <li><a href="#${h.id}">${h.text.replace(/<[^>]+>/g, '')}</a></li>`).join('\n');
  return `<nav class="post-toc" aria-labelledby="post-toc-heading">\n  <h2 id="post-toc-heading">${esc(headingText)}</h2>\n  <ul>\n${items}\n  </ul>\n</nav>`;
}

// --- Front matter -----------------------------------------------------------
export function parseResourceLine(raw) {
  const parts = raw.split('|');
  const title = (parts[0] || '').trim();
  const url = (parts[1] || '').trim();
  const description = parts.slice(2).join('|').trim();
  return { title, url, description };
}

export function parsePost(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  const frontLines = m[1].split('\n');
  for (let i = 0; i < frontLines.length; i += 1) {
    const line = frontLines[i];
    if (/^resources:\s*$/.test(line)) {
      const items = [];
      while (i + 1 < frontLines.length && /^\s{2}-\s+(.*)$/.test(frontLines[i + 1])) {
        i += 1;
        items.push(frontLines[i].match(/^\s{2}-\s+(.*)$/)[1]);
      }
      meta.resources = items.map(parseResourceLine);
      continue;
    }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}

export function renderResources(resources, headingText) {
  if (!resources || !resources.length) return '';
  const items = resources.map((r) => {
    const titleHtml = r.url ? `<a href="${esc(r.url)}">${esc(r.title)}</a>` : `<span class="resource-title">${esc(r.title)}</span>`;
    const descHtml = r.description ? ` : ${esc(r.description)}` : '';
    return `    <li>${titleHtml}${descHtml}</li>`;
  }).join('\n');
  return `<section class="post-resources" aria-labelledby="post-resources-heading">\n  <h2 id="post-resources-heading">${esc(headingText)}</h2>\n  <ul>\n${items}\n  </ul>\n</section>`;
}

export function renderCta(meta, defaultText, defaultHref) {
  const href = meta.cta_lien || defaultHref;
  const text = meta.cta_texte || defaultText;
  return `<div class="post-cta">\n  <a class="button button-ghost" href="${esc(href)}">${esc(text)}</a>\n</div>`;
}

// `icon` est le SVG déjà lu sur disque par build-blog.mjs (blog-content.mjs
// n'a pas d'accès fichier) : évite de dupliquer assets/icons/back-arrow.svg
// dans le code.
export function renderBackLink(href, label, icon) {
  return `<a class="post-back" href="${esc(href)}" aria-label="${esc(label)}">${icon}</a>`;
}

// --- Assemblage de la page article -------------------------------------------
// Regroupe l'ordre des blocs (spec §6 : retour -> titre -> méta -> sommaire ->
// corps -> ressources -> CTA) dans une fonction pure, testable, au lieu de le
// dupliquer par concaténation directe dans build-blog.mjs. `title` et
// `postMeta` sont déjà du HTML prêt à insérer (title = esc() du titre,
// postMeta = le <p class="post-meta">...</p> déjà construit par l'appelant).
export function renderArticle({ back, title, postMeta, toc, bodyHtml, resources, cta }) {
  return (
    `<article class="post">\n` +
    back + '\n' +
    `<h1>${title}</h1>\n` +
    postMeta + '\n' +
    (toc ? toc + '\n' : '') +
    bodyHtml.trim() + '\n' +
    (resources ? resources + '\n' : '') +
    cta + '\n' +
    `</article>`
  );
}
