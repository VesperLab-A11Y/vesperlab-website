import assert from 'node:assert/strict';
import { esc, inline, mdToHtml, parsePost } from './blog-content.mjs';

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
  const html = mdToHtml('## Titre\n\nUn paragraphe.\n\n- Un\n- Deux');
  assert.equal(html, '<h2>Titre</h2>\n<p>Un paragraphe.</p>\n<ul>\n  <li>Un</li>\n  <li>Deux</li>\n</ul>');
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

process.exit(failures ? 1 : 0);
