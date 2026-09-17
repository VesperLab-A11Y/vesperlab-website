import assert from 'node:assert/strict';
import { esc, inline, mdToHtml, parsePost, slugify, renderToc, parseResourceLine, renderResources, renderCta, renderBackLink, renderArticle } from './blog-content.mjs';

let failures = 0;
function test(name, fn) {
  try { fn(); console.log('✓ ' + name); }
  catch (e) { console.error('✗ ' + name + '\n  ' + e.message); failures += 1; }
}

test('esc : échappe &, <, > et "', () => {
  assert.equal(esc('a & b < c > d "e"'), 'a &amp; b &lt; c &gt; d &quot;e&quot;');
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

test('renderToc : un titre contenant un lien Markdown ne produit pas de <a> imbriqué', () => {
  // h.text est du HTML déjà rendu par inline() ; s'il contient un <a>
  // (titre "## Voir [WCAG](https://w3.org)"), renderToc ne doit pas
  // l'insérer tel quel dans son propre <a href="#...">.
  const html = renderToc([{ id: 'voir-wcag', text: 'Voir <a href="https://w3.org">WCAG</a>' }], 'Sommaire');
  assert.match(html, /<a href="#voir-wcag">Voir WCAG<\/a>/);
  assert.equal(/<a href="#voir-wcag">.*<a /.test(html), false);
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
  assert.match(html, /<p class="callout-label">Le saviez-vous \?<\/p>/);
});

test('mdToHtml : un [!INFO] vidé sans contenu ne contamine pas la citation suivante', () => {
  // Un marqueur [!INFO] suivi immédiatement d'une ligne vide (bloc vide,
  // flushé sans jamais recevoir de contenu) ne doit pas laisser
  // quoteIsCallout à true pour la citation normale qui suit.
  const { html } = mdToHtml('> [!INFO]\n\n> Une citation.');
  assert.match(html, /<blockquote>\n<p>Une citation\.<\/p>\n<\/blockquote>/);
  assert.equal(/<aside class="callout"/.test(html), false);
});

test('mdToHtml : un callout peut contenir plusieurs paragraphes séparés par une ligne "> " vide', () => {
  const { html } = mdToHtml('> [!INFO]\n> Premier paragraphe.\n>\n> Second paragraphe.');
  assert.match(html, /<aside class="callout" role="note">\n<p class="callout-label">Le saviez-vous \?<\/p>\n<p>Premier paragraphe\.<\/p>\n<p>Second paragraphe\.<\/p>\n<\/aside>/);
});

test('mdToHtml : un callout peut contenir une liste à puces', () => {
  const { html } = mdToHtml('> [!INFO]\n> Intro.\n>\n> - Premier terme\n>\n> Explication du premier terme.\n>\n> - Second terme\n>\n> Explication du second terme.');
  assert.match(html, /<p>Intro\.<\/p>\n<ul>\n  <li>Premier terme<\/li>\n<\/ul>\n<p>Explication du premier terme\.<\/p>\n<ul>\n  <li>Second terme<\/li>\n<\/ul>\n<p>Explication du second terme\.<\/p>/);
});

test('mdToHtml : un callout à un seul paragraphe garde le rendu inchangé', () => {
  const { html } = mdToHtml('> [!INFO]\n> Un fait intéressant.', { calloutLabel: 'Le saviez-vous ?' });
  assert.match(html, /<aside class="callout" role="note">\n<p class="callout-label">Le saviez-vous \?<\/p>\n<p>Un fait intéressant\.<\/p>\n<\/aside>/);
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

test('parseResourceLine : titre, lien et description', () => {
  assert.deepEqual(
    parseResourceLine('WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Référence normative'),
    { title: 'WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/', description: 'Référence normative' }
  );
});

test('parseResourceLine : sans lien', () => {
  assert.deepEqual(
    parseResourceLine("VoiceOver | | Lecteur d'écran utilisé pour les tests"),
    { title: 'VoiceOver', url: '', description: "Lecteur d'écran utilisé pour les tests" }
  );
});

test('parseResourceLine : une description peut contenir un "|"', () => {
  assert.deepEqual(
    parseResourceLine('Titre | https://x.test | avant | après'),
    { title: 'Titre', url: 'https://x.test', description: 'avant | après' }
  );
});

test('parsePost : bloc resources multi-lignes, mêlé à des champs simples', () => {
  const src = '---\ntitle: Test\nresources:\n  - WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Référence normative\n  - VoiceOver | | Lecteur utilisé\ncategory: Réflexions\n---\nCorps.';
  const { meta, body } = parsePost(src);
  assert.equal(meta.title, 'Test');
  assert.equal(meta.category, 'Réflexions');
  assert.equal(body, 'Corps.');
  assert.deepEqual(meta.resources, [
    { title: 'WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/', description: 'Référence normative' },
    { title: 'VoiceOver', url: '', description: 'Lecteur utilisé' },
  ]);
});

test('parsePost : sans bloc resources, meta.resources est absent', () => {
  const { meta } = parsePost('---\ntitle: Test\n---\nCorps.');
  assert.equal('resources' in meta, false);
});

test('renderResources : absent ou vide -> chaîne vide', () => {
  assert.equal(renderResources(undefined, 'Ressources'), '');
  assert.equal(renderResources([], 'Ressources'), '');
});

test('renderResources : lien -> texte cliquable, sans lien -> texte simple', () => {
  const html = renderResources([
    { title: 'WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/', description: 'Référence normative' },
    { title: 'VoiceOver', url: '', description: '' },
  ], 'Ressources');
  assert.match(html, /<section class="post-resources" aria-labelledby="post-resources-heading">/);
  assert.match(html, /<h2 id="post-resources-heading">Ressources<\/h2>/);
  assert.match(html, /<a href="https:\/\/www\.w3\.org\/TR\/WCAG22\/">WCAG 2\.2<\/a> — Référence normative/);
  assert.match(html, /<li><span class="resource-title">VoiceOver<\/span><\/li>/);
});

test('renderResources : sans URL, le titre est dans un span.resource-title', () => {
  const html = renderResources([
    { title: 'VoiceOver', url: '', description: "Lecteur d'écran utilisé pour les tests" },
  ], 'Ressources');
  assert.match(html, /<li><span class="resource-title">VoiceOver<\/span> — Lecteur d'écran utilisé pour les tests<\/li>/);
});

test('renderCta : utilise les valeurs par défaut si le front matter est vide', () => {
  const html = renderCta({}, 'Texte par défaut', '/contact/');
  assert.match(html, /<div class="post-cta">/);
  assert.match(html, /<a class="button button-ghost" href="\/contact\/">Texte par défaut<\/a>/);
});

test('renderCta : le front matter peut surcharger texte et lien', () => {
  const html = renderCta({ cta_texte: 'Essaie mes outils', cta_lien: '/le-lab/outils/' }, 'Texte par défaut', '/contact/');
  assert.match(html, /<a class="button button-ghost" href="\/le-lab\/outils\/">Essaie mes outils<\/a>/);
});

test('renderBackLink : construit le lien de retour, icône décorative + aria-label', () => {
  assert.equal(
    renderBackLink('/blog/', 'Tous les articles', '<svg>icône</svg>'),
    '<a class="post-back" href="/blog/" aria-label="Tous les articles"><svg>icône</svg></a>'
  );
});

test('pipeline complet : un article avec tout produit les blocs dans le bon ordre', () => {
  const src = [
    '---',
    'title: Article de test',
    'resources:',
    '  - WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Référence normative',
    'cta_texte: Essaie mes outils',
    'cta_lien: /le-lab/outils/',
    '---',
    '## Première section',
    '',
    'Un paragraphe.',
    '',
    '![Un schéma](schema.svg "Le parcours, simplifié")',
    '',
    '> [!INFO]',
    '> Un fait intéressant.',
    '',
    '## Deuxième section',
    '',
    'Encore du texte.',
  ].join('\n');

  const { meta, body } = parsePost(src);
  const { html: bodyHtml, headings } = mdToHtml(body, { calloutLabel: 'Zoom sur…' });
  const toc = renderToc(headings, 'Sommaire');
  const resources = renderResources(meta.resources, 'Ressources');
  const back = renderBackLink('/blog/', 'Tous les articles', '<svg>icône</svg>');
  const cta = renderCta(meta, 'Texte par défaut', '/contact/');
  const title = esc(meta.title);
  const postMeta = '<p class="post-meta"><time datetime="2026-09-17">Publié le 17 septembre 2026</time></p>';

  // Assemblage via renderArticle, la même fonction que build-blog.mjs appelle
  // réellement dans sa boucle principale — pas une reconstruction locale.
  const page = renderArticle({ back, title, postMeta, toc, bodyHtml, resources, cta });

  // Ordre attendu, spec §6 : retour -> titre -> sommaire -> corps -> ressources -> CTA
  const iBack = page.indexOf('post-back');
  const iH1 = page.indexOf('<h1>');
  const iToc = page.indexOf('post-toc');
  const iFigure = page.indexOf('<figure>');
  const iCallout = page.indexOf('callout');
  const iResources = page.indexOf('post-resources');
  const iCta = page.indexOf('post-cta');

  assert.ok(iBack < iH1, 'le bouton retour précède le titre');
  assert.ok(iH1 < iToc, 'le titre précède le sommaire');
  assert.ok(iToc < iFigure, 'le sommaire précède le corps');
  assert.ok(iFigure < iCallout, 'la figure précède le callout');
  assert.ok(iCallout < iResources, 'le callout précède les ressources');
  assert.ok(iResources < iCta, 'les ressources précèdent le CTA');

  assert.equal(headings.length, 2);
  assert.match(bodyHtml, /<figcaption>Le parcours, simplifié<\/figcaption>/);
  assert.match(page, /<a class="button button-ghost" href="\/le-lab\/outils\/">Essaie mes outils<\/a>/);
});

process.exit(failures ? 1 : 0);
