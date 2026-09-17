// ============================================================================
// blog-content.mjs — transformations pures Markdown/front matter -> HTML.
// Aucune I/O ici (pas de fs) : testable directement, sans exécuter le build.
// ============================================================================

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- Markdown -> HTML (sous-ensemble suffisant pour un article) ---------------
export function inline(s) {
  return esc(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, a, u) => `<img src="${u}" alt="${a}">`)
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

function uniqueSlug(base, used) {
  const root = base || 'section';
  let slug = root, i = 2;
  while (used.has(slug)) { slug = `${root}-${i}`; i += 1; }
  used.add(slug);
  return slug;
}

export function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  const headings = [];
  const usedIds = new Set();
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
    if (q) { flushPara(); flushList(); quote.push(q[1]); continue; }
    flushList(); flushQuote(); para.push(line.trim());
  }
  flushAll();
  return { html: out.join('\n'), headings };
}

export function renderToc(headings, headingText) {
  if (!headings.length) return '';
  const items = headings.map((h) => `    <li><a href="#${h.id}">${h.text}</a></li>`).join('\n');
  return `<nav class="post-toc" aria-labelledby="post-toc-heading">\n  <h2 id="post-toc-heading">${esc(headingText)}</h2>\n  <ul>\n${items}\n  </ul>\n</nav>`;
}

// --- Front matter -----------------------------------------------------------
export function parsePost(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, body: m[2] };
}
