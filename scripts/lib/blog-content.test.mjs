import assert from 'node:assert/strict';
import { esc, inline, mdToHtml, parsePost, slugify, renderToc } from './blog-content.mjs';

let failures = 0;
function test(name, fn) {
  try { fn(); console.log('✓ ' + name); }
  catch (e) { console.error('✗ ' + name + '\n  ' + e.message); failures += 1; }
}

test('esc : échappe &, < et >', () => {
  assert.equal(esc('a & b < c > d'), 'a &amp; b &lt; c &gt; d');
});

test('inline : gras, italique, code, lien', () => {
  assert.equal(inline('**gras** et *italique* et `code` et [lien](https://x.test)'),
    '<strong>gras</strong> et <em>italique</em> et <code>code</code> et <a href="https://x.test">lien</a>');
});

test('mdToHtml : titres, paragraphes, listes', () => {
  const { html } = mdToHtml('## Titre\n\nUn paragraphe.\n\n- Un\n- Deux');
  assert.equal(html, '<h2 id="titre">Titre</h2>\n<p>Un paragraphe.</p>\n<ul>\n  <li>Un</li>\n  <li>Deux</li>\n</ul>');
});

test('parsePost : sépare front matter et corps', () => {
  const { meta, body } = parsePost('---\ntitle: Mon titre\ncategory: Réflexions\n---\nLe corps.');
  assert.equal(meta.title, 'Mon titre');
  assert.equal(meta.category, 'Réflexions');
  assert.equal(body, 'Le corps.');
});

test('parsePost : sans front matter, tout est corps', () => {
  const { meta, body } = parsePost('Juste du texte.');
  assert.deepEqual(meta, {});
  assert.equal(body, 'Juste du texte.');
});

test('slugify : minuscules, accents retirés, espaces en tirets', () => {
  assert.equal(slugify('Écrire un CV Accessible !'), 'ecrire-un-cv-accessible');
});

test('mdToHtml : les ## reçoivent un id slugifié et sont listés dans headings', () => {
  const { html, headings } = mdToHtml('## Première étape\n\nTexte.\n\n## Deuxième étape\n\nAutre texte.');
  assert.equal(headings.length, 2);
  assert.deepEqual(headings[0], { id: 'premiere-etape', text: 'Première étape' });
  assert.deepEqual(headings[1], { id: 'deuxieme-etape', text: 'Deuxième étape' });
  assert.match(html, /<h2 id="premiere-etape">Première étape<\/h2>/);
});

test('mdToHtml : deux titres identiques produisent des ids distincts', () => {
  const { headings } = mdToHtml('## Introduction\n\nA.\n\n## Introduction\n\nB.');
  assert.deepEqual(headings.map((h) => h.id), ['introduction', 'introduction-2']);
});

test('mdToHtml : les ### ne sont pas dans headings mais restent dans le HTML', () => {
  const { html, headings } = mdToHtml('### Détail');
  assert.equal(headings.length, 0);
  assert.match(html, /<h3>Détail<\/h3>/);
});

test('renderToc : liste vide -> chaîne vide', () => {
  assert.equal(renderToc([], 'Sommaire'), '');
});

test('renderToc : construit un nav accessible avec une ancre par titre', () => {
  const html = renderToc([{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], 'Sommaire');
  assert.match(html, /<nav class="post-toc" aria-labelledby="post-toc-heading">/);
  assert.match(html, /<h2 id="post-toc-heading">Sommaire<\/h2>/);
  assert.match(html, /<a href="#a">A<\/a>/);
  assert.match(html, /<a href="#b">B<\/a>/);
});

test('mdToHtml : > [!INFO] devient un callout "le saviez-vous"', () => {
  const { html } = mdToHtml('> [!INFO]\n> Un fait intéressant.', { calloutLabel: 'Le saviez-vous ?' });
  assert.match(html, /<aside class="callout" role="note">/);
  assert.match(html, /<p class="callout-label">Le saviez-vous \?<\/p>/);
  assert.match(html, /<p>Un fait intéressant\.<\/p>\n<\/aside>/);
  assert.equal(/<blockquote>/.test(html), false);
});

test('mdToHtml : une citation normale reste un blockquote', () => {
  const { html } = mdToHtml('> Une citation ordinaire.');
  assert.match(html, /<blockquote>\n<p>Une citation ordinaire\.<\/p>\n<\/blockquote>/);
});

test('mdToHtml : callout par défaut sans options fournies', () => {
  const { html } = mdToHtml('> [!INFO]\n> Texte.');
  assert.match(html, /<p class="callout-label">Le saviez-vous \?<\/p>/);
});

test('mdToHtml : une image seule sur sa ligne devient une figure avec légende', () => {
  const { html } = mdToHtml('![Un chat](chat.jpg "Mon chat au soleil")');
  assert.match(html, /<figure>\n<img src="chat\.jpg" alt="Un chat" loading="lazy">\n<figcaption>Mon chat au soleil<\/figcaption>\n<\/figure>/);
});

test('mdToHtml : une image seule sans titre devient une figure sans légende', () => {
  const { html } = mdToHtml('![Un chat](chat.jpg)');
  assert.match(html, /<figure>\n<img src="chat\.jpg" alt="Un chat" loading="lazy">\n<\/figure>/);
  assert.equal(/<figcaption>/.test(html), false);
});

test('mdToHtml : une image mêlée à du texte reste inline, sans légende', () => {
  const { html } = mdToHtml('Regarde ce chat ![Un chat](chat.jpg "Légende ignorée") sur la photo.');
  assert.match(html, /<p>Regarde ce chat <img src="chat\.jpg" alt="Un chat"> sur la photo\.<\/p>/);
  assert.equal(/<figure>|<figcaption>/.test(html), false);
});

process.exit(failures ? 1 : 0);
