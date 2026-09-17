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

process.exit(failures ? 1 : 0);
