// Récupère les .woff2 Noto statiques (sous-ensembles latin + latin-ext) depuis Fontsource via jsdelivr.
// Chaque fichier est un .woff2 statique distinct pour un poids spécifique.
// Usage : node scripts/fetch-fonts.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const OUT = new URL('../assets/fonts/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Liste explicite des 10 fichiers : famille × sous-ensemble × poids
const FONTS = [
  { family: 'noto-serif', subset: 'latin', weight: 400 },
  { family: 'noto-serif', subset: 'latin', weight: 600 },
  { family: 'noto-serif', subset: 'latin-ext', weight: 400 },
  { family: 'noto-serif', subset: 'latin-ext', weight: 600 },
  { family: 'noto-sans', subset: 'latin', weight: 400 },
  { family: 'noto-sans', subset: 'latin', weight: 600 },
  { family: 'noto-sans', subset: 'latin', weight: 700 },
  { family: 'noto-sans', subset: 'latin-ext', weight: 400 },
  { family: 'noto-sans', subset: 'latin-ext', weight: 600 },
  { family: 'noto-sans', subset: 'latin-ext', weight: 700 },
];

const hashes = new Set();

for (const font of FONTS) {
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${font.family}@latest/${font.subset}-${font.weight}-normal.woff2`;
  const res = await fetch(url);

  // Vérifier que le statut est 200
  if (!res.ok) throw new Error(`Fetch failed: ${url} (status ${res.status})`);

  const buf = Buffer.from(await res.arrayBuffer());

  // Vérifier que le fichier commence par les octets wOF2
  if (buf[0] !== 119 || buf[1] !== 79 || buf[2] !== 70 || buf[3] !== 50) {
    throw new Error(`Invalid woff2 magic bytes in ${url}`);
  }

  // Écrire le fichier
  const name = `${font.family}-${font.subset}-${font.weight}.woff2`;
  writeFileSync(new URL(name, OUT), buf);

  // Calculer et enregistrer le hash sha256
  const hash = createHash('sha256').update(buf).digest('hex');
  if (hashes.has(hash)) {
    throw new Error(`Collision détectée : ${name} a le même hash qu'un fichier précédent`);
  }
  hashes.add(hash);

  console.log(`✓ ${name}  (${buf.length} o)`);
}

// Vérifier que tous les 10 fichiers ont des hashes distincts
console.log(`✓ 10 fichiers, 10 hachages distincts`);
