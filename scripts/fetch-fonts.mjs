// Récupère les .woff2 Noto (sous-ensembles latin + latin-ext) depuis l'API
// Google Fonts CSS2, et les enregistre en local. Outil de dev, lancé une fois.
// Usage : node scripts/fetch-fonts.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../assets/fonts/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// UA moderne → Google renvoie du woff2 ; on ne garde que latin et latin-ext.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FAMILIES = [
  { css: 'Noto+Serif:wght@400;600', slug: 'noto-serif' },
  { css: 'Noto+Sans:wght@400;600;700', slug: 'noto-sans' },
];

for (const fam of FAMILIES) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${fam.css}&display=swap`;
  const css = await fetch(cssUrl, { headers: { 'User-Agent': UA } }).then(r => r.text());

  // Chaque @font-face est précédé d'un commentaire /* latin */ ou /* latin-ext */
  const blocks = css.split('@font-face').slice(1);
  for (const block of blocks) {
    // Chercher le dernier commentaire avant ce bloc (sans exiger qu'il soit à la fin)
    const beforeBlock = css.slice(0, css.indexOf(block));
    const allMatches = beforeBlock.match(/\/\*\s*([a-z0-9-]+)\s*\*\//gi);
    const subset = allMatches ? allMatches[allMatches.length - 1].replace(/\/\*\s*|\s*\*\//g, '').toLowerCase() : null;
    if (subset !== 'latin' && subset !== 'latin-ext') continue;
    const weight = (block.match(/font-weight:\s*(\d+)/) || [])[1];
    const url = (block.match(/src:\s*url\(([^)]+)\)/) || [])[1];
    if (!weight || !url) continue;
    const buf = Buffer.from(await fetch(url).then(r => r.arrayBuffer()));
    const name = `${fam.slug}-${subset}-${weight}.woff2`;
    writeFileSync(new URL(name, OUT), buf);
    console.log(`✓ ${name}  (${buf.length} o)`);
  }
}
