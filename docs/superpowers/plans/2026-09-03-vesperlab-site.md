# Site vitrine Vesper Lab — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une page web statique unique (« Vesper Lab — bientôt en ligne »), accessible et sombre, prête à déployer sur Cloudflare Pages depuis `github.com/VesperLab-A11Y/vesperlab-website`.

**Architecture:** Un seul `index.html` + un seul `style.css`, aucun JavaScript de production, aucune étape de build. Les jetons du design system V2 (sombre uniquement) sont recopiés dans `:root`. Polices Noto auto-hébergées en `.woff2`. Un script Node natif `scripts/check.mjs` (sans dépendance) vérifie les invariants de structure/contenu et sert de « test » à chaque tâche. Vérification visuelle et clavier via le pane navigateur (`python3 -m http.server`).

**Tech Stack:** HTML5, CSS3 (oklch, grid, custom properties), SVG inline, Node ≥ 20 pour `check.mjs`, `rsvg-convert` (Homebrew) pour rasteriser les PNG, `python3 -m http.server` pour l'aperçu local, Cloudflare Pages pour l'hébergement.

**Spec:** `docs/superpowers/specs/2026-09-03-vesperlab-site-design.md` — le plan argumente à partir de la spec ; lire les deux.

## Global Constraints

- **Aucun framework, aucun backend, aucune étape de build.** HTML/CSS statique + un script Node de contrôle uniquement.
- **Aucune ressource tierce à l'exécution.** Zéro requête cross-origin : polices, icônes, styles, images — tout est servi same-origin. Pas de `@import` Google Fonts, pas de CDN.
- **Aucun JavaScript de production.** `scripts/check.mjs` est un outil de dev, jamais chargé par `index.html`.
- **Thème sombre uniquement.** Pas de `@media (prefers-color-scheme)`, pas de bascule. `:root` porte les jetons sombres, point.
- **Langue :** `<html lang="fr">`. Tout le contenu visible en français. Commentaires de code **en français** (préférence utilisatrice).
- **Domaine canonique :** `https://vesperlab.dev/` (avec la barre oblique finale).
- **Comptes / URLs (verbatim) :**
  - Repo : `https://github.com/VesperLab-A11Y/vesperlab-website`
  - Orga GitHub (icône) : `https://github.com/VesperLab-A11Y`
  - Buy Me a Coffee : `https://buymeacoffee.com/vesperlab`
  - LinkedIn : `https://www.linkedin.com/in/paulinechevalliot`
  - Email : `contact@vesperlab.dev`
- **`<title>` :** `Vesper Lab : Accessibilité numérique`
- **meta description :** `Laboratoire d'accessibilité numérique, situé à Montréal. Diagnostics web et PDF, en français et en anglais.`
- **Licence :** MIT, titulaire « Pauline Chevalliot ».
- **Liens externes :** jamais de `target="_blank"`. Chaque lien-icône contient un libellé `.visually-hidden`.
- **Cibles tactiles :** ≥ 44 × 44 px (`--min-hit`) sur le bouton et les liens-icônes.
- **Jeton source de vérité :** `~/Desktop/Vesper-Library/style.css` (bloc `:root` sombre). Ne recopier que les jetons réellement utilisés.
- **Sauge de marque :** `#BDCFA9` (valeur hex du logo, cf. `~/Desktop/vesper-logos/LISEZ-MOI.md`).

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `index.html` | La page. Structure sémantique, SVG logo + icônes inlinés, `<head>` complet. Aucun `<script>`. |
| `style.css` | Bloc `:root` (jetons DS V2 sombres utilisés) → `@font-face` (Noto auto-hébergé) → reset léger + utilitaires (`.visually-hidden`, `.skip-link`, `:focus-visible`) → styles de la page → `@media` (largeur + `prefers-reduced-motion`). |
| `404.html` | Page d'erreur. Même `<head>` réduit, même `style.css`, message + lien « Retour à l'accueil ». |
| `assets/vesperlab-logo.svg` | Copie du logo Vesper Lab (`vesperlab-currentcolor.svg`), source de vérité = `~/Desktop/vesper-logos/`. Référence de secours ; le tracé est **inliné** dans `index.html`. |
| `assets/favicon.svg` | Favicon détaillé (jeu Viewer, `fill="#BDCFA9"`, `<title>Vesper Lab</title>`). `sizes="any"`. |
| `assets/favicon-16.svg` | Favicon silhouette pleine (jeu Viewer 16 px, `fill="#BDCFA9"`). `sizes="16x16"`. |
| `assets/favicon-32.png` | Repli PNG 32×32 rasterisé depuis `favicon.svg`. |
| `assets/apple-touch-icon.png` | 180×180, marque sur fond `#0E0F0D` opaque. |
| `assets/og-image.png` | 1200×630, logo + accroche courte sur fond `#0E0F0D`. |
| `assets/fonts/*.woff2` | Noto Serif (400, 600) + Noto Sans (400, 600, 700), sous-ensembles `latin` et `latin-ext`. |
| `scripts/check.mjs` | Contrôles de structure/contenu, Node natif, zéro dépendance. Grandit tâche par tâche. |
| `robots.txt` | Autorise tout, déclare le sitemap. |
| `sitemap.xml` | Une seule URL (l'accueil), écrite à la main. |
| `_headers` | En-têtes Cloudflare Pages (cache assets, sécurité de base). |
| `README.md` | Description, lien site, note accessibilité, comment lancer l'aperçu + `check.mjs`. |
| `LICENSE` | MIT. |
| `docs/redirection-framer.md` | Le bloc HTML à coller dans l'éditeur Framer (livrable pour Pauline). |
| `.gitignore` | `.DS_Store`, `*.log`, `assets/_*` (fichiers de rendu temporaires). |

---

## Task 1 : Assets — logo, favicons, icônes sociales

**Files:**
- Create: `assets/vesperlab-logo.svg` (copie)
- Create: `assets/favicon.svg`, `assets/favicon-16.svg`
- Create: `assets/icons/github.svg`, `assets/icons/buymeacoffee.svg`, `assets/icons/linkedin.svg`
- Modify: `.gitignore` (ajouter `assets/_*`)

**Interfaces:**
- Produces : cinq fichiers SVG propres dont le contenu (`<path d="…">`) sera **inliné** dans `index.html` à la Task 4. Les favicons sont référencés par URL dans `<head>` à la Task 5.

- [ ] **Step 1 : Copier le logo Vesper Lab**

```bash
cd ~/Desktop/vesperlab-website
mkdir -p assets/icons
cp ~/Desktop/vesper-logos/vesperlab/vesperlab-currentcolor.svg assets/vesperlab-logo.svg
```

- [ ] **Step 2 : Copier et adapter les deux favicons (jeu Viewer)**

Le jeu Viewer est choisi parce que la marque s'y lit comme un « V ». Deux adaptations à faire sur chaque copie : mettre une couleur explicite (`currentColor` en favicon rend souvent noir → invisible sur un onglet sombre) et renommer le `<title>`.

```bash
cd ~/Desktop/vesperlab-website
# favicon détaillé (bon dès 32 px)
sed -e 's/fill="currentColor"/fill="#BDCFA9"/' \
    -e 's#<title id="[^"]*">[^<]*</title>#<title>Vesper Lab</title>#' \
    ~/Desktop/vesper-logos/viewer/viewer-favicon-currentcolor.svg > assets/favicon.svg
# favicon silhouette (16–24 px)
sed -e 's/fill="currentColor"/fill="#BDCFA9"/' \
    -e 's#<title id="[^"]*">[^<]*</title>#<title>Vesper Lab</title>#' \
    ~/Desktop/vesper-logos/viewer/viewer-favicon-16-currentcolor.svg > assets/favicon-16.svg
```

- [ ] **Step 3 : Récupérer les trois icônes sociales (Simple Icons, licence CC0)**

```bash
cd ~/Desktop/vesperlab-website
BASE="https://raw.githubusercontent.com/simple-icons/simple-icons/master/icons"
curl -fsSL "$BASE/github.svg"        -o assets/icons/github.svg
curl -fsSL "$BASE/buymeacoffee.svg"  -o assets/icons/buymeacoffee.svg
curl -fsSL "$BASE/linkedin.svg"      -o assets/icons/linkedin.svg
```

Si le réseau bloque `raw.githubusercontent.com` : récupérer les mêmes fichiers depuis `https://cdn.simpleicons.org/github`, `/buymeacoffee`, `/linkedin`. Ce sont des tracés `viewBox="0 0 24 24"` à un seul `<path>`.

- [ ] **Step 4 : Ignorer les fichiers de rendu temporaires**

Éditer `.gitignore`, ajouter la ligne :

```
assets/_*
```

- [ ] **Step 5 : Vérifier**

```bash
cd ~/Desktop/vesperlab-website
for f in assets/vesperlab-logo.svg assets/favicon.svg assets/favicon-16.svg \
         assets/icons/github.svg assets/icons/buymeacoffee.svg assets/icons/linkedin.svg; do
  test -s "$f" && head -c 5 "$f" | grep -q '<svg\|<?xml' && echo "OK   $f" || echo "FAIL $f"
done
grep -q 'Vesper Lab' assets/favicon.svg && grep -q '#BDCFA9' assets/favicon.svg && echo "OK   favicon adapté" || echo "FAIL favicon adapté"
```

Attendu : 7 lignes `OK`.

- [ ] **Step 6 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add assets/ .gitignore
git commit -m "Assets : logo Vesper Lab, favicons (jeu Viewer), icônes sociales"
```

---

## Task 2 : Polices Noto auto-hébergées

**Files:**
- Create: `assets/fonts/` (10 fichiers `.woff2`)
- Create: `scripts/fetch-fonts.mjs` (utilitaire de dev, reproductible)

**Interfaces:**
- Produces : fichiers `.woff2` nommés `noto-serif-{latin,latin-ext}-{400,600}.woff2` et `noto-sans-{latin,latin-ext}-{400,600,700}.woff2`. Les blocs `@font-face` qui les consomment sont écrits à la Task 3.

- [ ] **Step 1 : Écrire le script de récupération**

Créer `scripts/fetch-fonts.mjs` :

```js
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
    const subsetMatch = css.slice(0, css.indexOf(block)).match(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*$/i);
    const subset = subsetMatch ? subsetMatch[1] : null;
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
```

- [ ] **Step 2 : Lancer le script**

```bash
cd ~/Desktop/vesperlab-website
node scripts/fetch-fonts.mjs
```

Attendu : 10 lignes `✓` (`noto-serif` latin/latin-ext × 400/600 = 4 ; `noto-sans` latin/latin-ext × 400/600/700 = 6).

- [ ] **Step 3 : Vérifier les fichiers**

```bash
cd ~/Desktop/vesperlab-website
ls assets/fonts/
count=$(ls assets/fonts/*.woff2 | wc -l | tr -d ' ')
test "$count" = "10" && echo "OK 10 woff2" || echo "FAIL $count woff2"
for f in assets/fonts/*.woff2; do
  head -c 4 "$f" | grep -q 'wOF2' && echo "OK   $f" || echo "FAIL magic $f"
done
```

Attendu : `OK 10 woff2` puis 10 lignes `OK` (les `.woff2` commencent par les octets `wOF2`).

- [ ] **Step 4 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add assets/fonts/ scripts/fetch-fonts.mjs
git commit -m "Polices : Noto Serif + Noto Sans auto-hébergées (latin, latin-ext)"
```

---

## Task 3 : `style.css` — jetons, polices, reset

**Files:**
- Create: `style.css`

**Interfaces:**
- Consumes : les `.woff2` de la Task 2 (`assets/fonts/…`).
- Produces : les classes/variables utilisées par `index.html` — `--surface-page`, `--text-body`, `--accent`, `--focus-ring`, `--font-display`, `--font-body`, `--space-*`, `--radius-md`, `--min-hit`, `.visually-hidden`, `.skip-link`. Les styles de mise en page (`.lead-headline`, `.cols`, `.social`, `.button`, `.site-header`, `.site-footer`) sont ajoutés à la Task 4.

- [ ] **Step 1 : Écrire `style.css` (jetons + polices + reset)**

```css
/* ============================================================================
   Vesper Lab — feuille de styles du site vitrine
   Jetons du design system V2 (sombre uniquement), recopiés depuis
   ~/Desktop/Vesper-Library/style.css. Seuls les jetons utilisés ici sont repris
   (les jetons --severity-*, le thème clair et Noto Sans Mono sont écartés).
   ============================================================================ */

/* ---- Polices auto-hébergées (aucune requête tierce) ---- */
@font-face{
  font-family:'Noto Serif'; font-style:normal; font-weight:400; font-display:swap;
  src:url('assets/fonts/noto-serif-latin-400.woff2') format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face{
  font-family:'Noto Serif'; font-style:normal; font-weight:400; font-display:swap;
  src:url('assets/fonts/noto-serif-latin-ext-400.woff2') format('woff2');
  unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face{
  font-family:'Noto Serif'; font-style:normal; font-weight:600; font-display:swap;
  src:url('assets/fonts/noto-serif-latin-600.woff2') format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face{
  font-family:'Noto Serif'; font-style:normal; font-weight:600; font-display:swap;
  src:url('assets/fonts/noto-serif-latin-ext-600.woff2') format('woff2');
  unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face{
  font-family:'Noto Sans'; font-style:normal; font-weight:400; font-display:swap;
  src:url('assets/fonts/noto-sans-latin-400.woff2') format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face{
  font-family:'Noto Sans'; font-style:normal; font-weight:400; font-display:swap;
  src:url('assets/fonts/noto-sans-latin-ext-400.woff2') format('woff2');
  unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face{
  font-family:'Noto Sans'; font-style:normal; font-weight:600; font-display:swap;
  src:url('assets/fonts/noto-sans-latin-600.woff2') format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face{
  font-family:'Noto Sans'; font-style:normal; font-weight:600; font-display:swap;
  src:url('assets/fonts/noto-sans-latin-ext-600.woff2') format('woff2');
  unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}
@font-face{
  font-family:'Noto Sans'; font-style:normal; font-weight:700; font-display:swap;
  src:url('assets/fonts/noto-sans-latin-700.woff2') format('woff2');
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face{
  font-family:'Noto Sans'; font-style:normal; font-weight:700; font-display:swap;
  src:url('assets/fonts/noto-sans-latin-ext-700.woff2') format('woff2');
  unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF;
}

/* ---- Jetons (design system V2, sombre) ---- */
:root{
  /* Typographie */
  --font-display:'Noto Serif',Georgia,'Times New Roman',serif;
  --font-body:'Noto Sans',Arial,Helvetica,sans-serif;
  --font-size-display:44px;
  --font-size-h2:24px;
  --font-size-h3:19px;
  --font-size-lead:19px;
  --font-size-body:17px;
  --font-size-caption:13px;
  --leading-tight:1.18;
  --leading-heading:1.25;
  --leading-body:1.65;
  --tracking-display:0.005em;
  --tracking-eyebrow:0.12em;

  /* Espacements / rayons */
  --space-3:8px;
  --space-4:10px;
  --space-5:12px;
  --space-6:16px;
  --space-8:24px;
  --space-10:32px;
  --space-16:64px;   /* propre au site : rythme vertical des grands blocs */
  --radius-md:8px;
  --radius-pill:20px;
  --min-hit:44px;

  /* Couleurs — neutres oklch teinte 150 */
  --ink-975:oklch(0.11 0.006 150);
  --cream-100:oklch(0.93 0.018 85);
  --cream-300:oklch(0.85 0.018 85);
  --cream-500:oklch(0.72 0.02 85);
  --hairline:rgba(233,223,200,0.14);
  --hairline-strong:rgba(233,223,200,0.18);

  /* Accent — sauge séchée teinte 128 */
  --sage-300:oklch(0.89 0.05 128);
  --sage-500:oklch(0.83 0.055 128);
  --sage-on:oklch(0.145 0.008 150);

  /* Alias sémantiques */
  --surface-page:var(--ink-975);
  --text-body:var(--cream-100);
  --text-secondary:var(--cream-300);
  --text-muted:var(--cream-500);
  --border-default:var(--hairline);
  --border-strong:var(--hairline-strong);
  --accent:var(--sage-500);
  --accent-hover:var(--sage-300);
  --accent-on:var(--sage-on);
  --focus-ring:var(--sage-500);
  --link:var(--sage-500);
  --link-hover:var(--sage-300);
}

/* ---- Reset léger ---- */
*,*::before,*::after{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{
  margin:0;
  background:var(--surface-page);
  color:var(--text-body);
  font-family:var(--font-body);
  font-size:var(--font-size-body);
  line-height:var(--leading-body);
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
img,svg{max-width:100%;}
[hidden]{display:none !important;}

/* ---- Focus : visible partout, jamais supprimé ---- */
:focus-visible{
  outline:2px solid var(--focus-ring);
  outline-offset:2px;
  border-radius:3px;
}

/* ---- Liens de texte : soulignés (pas d'info portée par la couleur seule) ---- */
a{color:var(--link);text-underline-offset:3px;}
a:hover{color:var(--link-hover);text-decoration-thickness:2px;}

/* ---- Utilitaires ---- */
.visually-hidden{
  position:absolute;width:1px;height:1px;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;border:0;padding:0;margin:-1px;
}
.skip-link{
  position:absolute;left:var(--space-3);top:-60px;z-index:100;
  background:var(--accent);color:var(--accent-on);
  padding:var(--space-3) var(--space-6);font-weight:700;
  border-radius:0 0 var(--radius-md) var(--radius-md);
  text-decoration:none;transition:top .15s;
}
.skip-link:focus{top:0;}

/* ---- Mouvement réduit : on neutralise toute animation/transition ---- */
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto;}
  *,*::before,*::after{
    transition-duration:0.01ms !important;
    animation-duration:0.01ms !important;
    animation-iteration-count:1 !important;
  }
}
```

- [ ] **Step 2 : Vérifier la syntaxe CSS**

```bash
cd ~/Desktop/vesperlab-website
npx --yes csslint@1.0.5 style.css --quiet --errors=errors --format=compact || true
node -e "const c=require('fs').readFileSync('style.css','utf8');const o=(c.match(/{/g)||[]).length,x=(c.match(/}/g)||[]).length;if(o!==x){console.error('FAIL accolades '+o+' vs '+x);process.exit(1)}console.log('OK accolades équilibrées ('+o+')')"
```

Attendu : `OK accolades équilibrées`. (csslint est indicatif ; l'absence d'erreur bloquante suffit.)

- [ ] **Step 3 : Vérifier que les 10 polices sont référencées**

```bash
cd ~/Desktop/vesperlab-website
node -e "
const css=require('fs').readFileSync('style.css','utf8');
const fs=require('fs');
let bad=0;
for(const f of fs.readdirSync('assets/fonts')){
  if(!css.includes(f)){console.error('FAIL non référencée : '+f);bad++;}
}
const faces=(css.match(/@font-face/g)||[]).length;
if(faces!==10){console.error('FAIL '+faces+' @font-face (attendu 10)');bad++;}
process.exit(bad?1:(console.log('OK 10 @font-face, 10 woff2 référencées'),0));
"
```

Attendu : `OK 10 @font-face, 10 woff2 référencées`.

- [ ] **Step 4 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add style.css
git commit -m "style.css : jetons DS V2 sombres, @font-face Noto, reset et focus"
```

---

## Task 4 : `index.html` + styles de mise en page + `scripts/check.mjs`

C'est la tâche centrale : le contenu de la page, sa mise en forme, et le script de contrôle qui verrouille les invariants d'accessibilité.

**Files:**
- Create: `index.html`
- Create: `scripts/check.mjs`
- Modify: `style.css` (ajout du bloc « Styles de la page »)

**Interfaces:**
- Consumes : jetons et utilitaires de la Task 3 ; SVG de la Task 1 (à inliner).
- Produces : `index.html` avec les ancres `#main`, `#h-prep`, `#h-social`, `#h-echo` ; `scripts/check.mjs` exécutable via `node scripts/check.mjs` (code de sortie 0 = OK).

- [ ] **Step 1 : Écrire `scripts/check.mjs` (les assertions échouent d'abord)**

```js
// Contrôles de structure et d'accessibilité pour le site Vesper Lab.
// Node natif, aucune dépendance. Usage : node scripts/check.mjs
import { readFileSync, existsSync } from 'node:fs';

let failures = 0;
const fail = (m) => { console.error('✗ ' + m); failures++; };
const ok = (m) => console.log('✓ ' + m);

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// 1. Langue
/<html[^>]*\blang="fr"/.test(html) ? ok('html lang="fr"') : fail('html lang="fr" manquant');

// 2. Un seul <h1>
const h1s = html.match(/<h1[\s>]/g) || [];
h1s.length === 1 ? ok('un seul <h1>') : fail(h1s.length + ' <h1> (attendu 1)');

// 3. Hiérarchie de titres : h1 puis h2, h2, h3 — aucun saut
const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
const expected = [1, 2, 3, 2]; // logo, « Arrivée… », « En attendant… », « Utilisez l'écho »
JSON.stringify(levels) === JSON.stringify(expected)
  ? ok('hiérarchie de titres ' + levels.join(' '))
  : fail('hiérarchie de titres ' + JSON.stringify(levels) + ' (attendu ' + JSON.stringify(expected) + ')');

// 4. Skip-link vers une ancre existante
const skip = html.match(/<a[^>]+class="skip-link"[^>]+href="#([\w-]+)"/);
if (!skip) fail('skip-link absent');
else if (!new RegExp('id="' + skip[1] + '"').test(html)) fail('cible du skip-link #' + skip[1] + ' introuvable');
else ok('skip-link → #' + skip[1]);

// 5. <main id="main">
/<main[^>]+id="main"/.test(html) ? ok('<main id="main">') : fail('<main id="main"> manquant');

// 6. Landmarks header / main / footer
['header', 'main', 'footer'].forEach(t =>
  new RegExp('<' + t + '[\\s>]').test(html) ? ok('<' + t + '>') : fail('<' + t + '> manquant'));

// 7. Sections reliées à leur titre
for (const id of ['h-prep', 'h-echo']) {
  new RegExp('aria-labelledby="' + id + '"').test(html) && new RegExp('id="' + id + '"').test(html)
    ? ok('section aria-labelledby="' + id + '"')
    : fail('section/labelledby ' + id + ' incohérent');
}

// 8. Aucun target="_blank"
/target="_blank"/.test(html) ? fail('target="_blank" interdit') : ok('aucun target="_blank"');

// 9. Les trois liens sociaux, dans l'ordre, avec libellé visually-hidden
const social = ['https://github.com/VesperLab-A11Y',
                'https://buymeacoffee.com/vesperlab',
                'https://www.linkedin.com/in/paulinechevalliot'];
let last = -1, ordered = true;
for (const url of social) {
  const i = html.indexOf(url);
  if (i === -1) { fail('lien social manquant : ' + url); ordered = false; }
  else if (i < last) ordered = false;
  last = i;
}
ordered ? ok('3 liens sociaux dans l\'ordre GitHub → BMC → LinkedIn') : fail('liens sociaux absents ou mal ordonnés');
const vh = (html.match(/class="visually-hidden"/g) || []).length;
vh >= 3 ? ok(vh + ' libellés visually-hidden') : fail('moins de 3 libellés visually-hidden');

// 10. Contact : mailto en clair + bouton
(html.match(/href="mailto:contact@vesperlab\.dev"/g) || []).length >= 2
  ? ok('mailto:contact@vesperlab.dev présent (lien texte + bouton)')
  : fail('mailto:contact@vesperlab.dev doit apparaître 2 fois (lien texte + bouton)');
/class="button"[^>]*href="mailto:contact@vesperlab\.dev"|href="mailto:contact@vesperlab\.dev"[^>]*class="button"/.test(html)
  ? ok('bouton « Écrivez-moi » en mailto') : fail('bouton .button mailto manquant');

// 11. Icônes SVG décoratives neutralisées
const decoSvg = (html.match(/<svg[^>]+aria-hidden="true"[^>]+focusable="false"|<svg[^>]+focusable="false"[^>]+aria-hidden="true"/g) || []).length;
decoSvg >= 3 ? ok(decoSvg + ' SVG décoratifs (aria-hidden + focusable=false)') : fail('SVG d\'icônes non neutralisés');

// 12. <head> : title, description, canonical, OG
const head = [
  [/<title>Vesper Lab : Accessibilité numérique<\/title>/, 'title exact'],
  [/<meta name="description" content="Laboratoire d'accessibilité numérique, situé à Montréal\. Diagnostics web et PDF, en français et en anglais\.">/, 'meta description exacte'],
  [/<link rel="canonical" href="https:\/\/vesperlab\.dev\/">/, 'canonical'],
  [/<meta property="og:title"/, 'og:title'],
  [/<meta property="og:image" content="https:\/\/vesperlab\.dev\/assets\/og-image\.png">/, 'og:image absolu'],
  [/<meta name="theme-color" content="#0E0F0D">/, 'theme-color'],
  [/<link rel="icon" href="assets\/favicon\.svg" sizes="any">/, 'favicon svg'],
];
for (const [re, label] of head) re.test(html) ? ok(label) : fail(label + ' manquant/incorrect');

// 13. Aucun <script> dans la page
/<script[\s>]/.test(html) ? fail('<script> interdit dans index.html') : ok('aucun <script>');

// 14. Aucune ressource tierce (http/https absolus non vesperlab.dev, hors href de liens <a>)
const thirdParty = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
  .map(m => m[1])
  .filter(u => !u.startsWith('https://vesperlab.dev'))
  .filter(u => !/^https:\/\/(www\.linkedin\.com|github\.com|buymeacoffee\.com)/.test(u)); // liens <a> sociaux OK
thirdParty.length === 0 ? ok('aucune ressource tierce chargée') : fail('ressource tierce : ' + thirdParty.join(', '));

// 15. Fichiers assets référencés présents sur le disque
for (const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) {
  existsSync(new URL('../' + m[1], import.meta.url)) ? ok('asset ' + m[1]) : fail('asset introuvable : ' + m[1]);
}

// 16. Textes de contenu obligatoires (verbatim)
const copy = [
  'L’obscurité ne ferme rien à qui sait',
  'Normes WCAG 2.2 et SGQRI 008',
  'Arrivée prévue à l’automne 2026',
  'et de nombreux conseils sont en préparation',
  'En attendant le crépuscule',
  'Utilisez l’écho',
  'ou en m’écrivant directement',
  'Ce site respecte les critères d’accessibilité WCAG 2.2 AA',
  'Créé par Vesper Lab',
];
for (const s of copy) html.includes(s) ? ok('copie : « ' + s.slice(0, 32) + '… »') : fail('copie manquante : « ' + s + ' »');

console.log(failures ? `\n${failures} échec(s)` : '\nTout est vert.');
process.exit(failures ? 1 : 0);
```

> Note apostrophes : le script attend des apostrophes typographiques `’` (U+2019) dans le contenu. `index.html` doit les utiliser partout dans la prose française.

- [ ] **Step 2 : Lancer `check.mjs` — il doit échouer**

```bash
cd ~/Desktop/vesperlab-website
node scripts/check.mjs; echo "code sortie : $?"
```

Attendu : `ENOENT` sur `index.html` (le fichier n'existe pas encore) → code de sortie ≠ 0.

- [ ] **Step 3 : Écrire `index.html`**

Inliner les tracés : ouvrir `assets/vesperlab-logo.svg` et coller le `<path …>` dans le `<svg>` du logo (garder `viewBox="0 0 1006 974"`) ; faire de même avec `assets/icons/{github,buymeacoffee,linkedin}.svg` (garder `viewBox="0 0 24 24"`, un seul `<path>` chacun).

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Vesper Lab : Accessibilité numérique</title>
<meta name="description" content="Laboratoire d'accessibilité numérique, situé à Montréal. Diagnostics web et PDF, en français et en anglais.">
<link rel="canonical" href="https://vesperlab.dev/">
<meta name="theme-color" content="#0E0F0D">

<!-- Open Graph / partage -->
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_CA">
<meta property="og:url" content="https://vesperlab.dev/">
<meta property="og:title" content="Vesper Lab : Accessibilité numérique">
<meta property="og:description" content="Laboratoire d'accessibilité numérique, situé à Montréal. Diagnostics web et PDF, en français et en anglais.">
<meta property="og:image" content="https://vesperlab.dev/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">

<!-- Favicons -->
<link rel="icon" href="assets/favicon-16.svg" sizes="16x16">
<link rel="icon" href="assets/favicon.svg" sizes="any">
<link rel="icon" href="assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">

<!-- Préchargement des deux faces du premier rendu -->
<link rel="preload" as="font" type="font/woff2" href="assets/fonts/noto-serif-latin-400.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="assets/fonts/noto-sans-latin-400.woff2" crossorigin>

<link rel="stylesheet" href="style.css">
</head>
<body>

<a class="skip-link" href="#main">Aller au contenu</a>

<header class="site-header">
  <h1 class="wordmark">
    <!-- Logo Vesper Lab. Le nom accessible vient du <title> du SVG. -->
    <svg role="img" aria-labelledby="logo-title" viewBox="0 0 1006 974">
      <title id="logo-title">Vesper Lab</title>
      <path fill="currentColor" fill-rule="nonzero" d="… COLLER LE TRACÉ DE assets/vesperlab-logo.svg …"/>
    </svg>
  </h1>
</header>

<main id="main">

  <div class="lead">
    <p class="lead-headline">L’obscurité ne ferme rien à qui sait <em>écouter</em>.</p>
    <p class="lead-body">Vesper Lab passe au crible les sites et les documents
      numériques, repère ce qui bloque, et explique comment le corriger.
      Normes WCAG 2.2 et SGQRI 008. Montréal, en français et en anglais.</p>
  </div>

  <div class="cols">

    <section class="col" aria-labelledby="h-prep">
      <h2 id="h-prep">Arrivée prévue à l’automne 2026</h2>
      <p>Diagnostics d’accessibilité, audits techniques, outils pédagogiques et
        de nombreux conseils sont en préparation.</p>

      <h3 id="h-social">En attendant le crépuscule</h3>
      <ul class="social" aria-labelledby="h-social">
        <li>
          <a href="https://github.com/VesperLab-A11Y">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="… github …"/></svg>
            <span class="visually-hidden">GitHub</span>
          </a>
        </li>
        <li>
          <a href="https://buymeacoffee.com/vesperlab">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="… buymeacoffee …"/></svg>
            <span class="visually-hidden">Buy Me a Coffee</span>
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/paulinechevalliot">
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="… linkedin …"/></svg>
            <span class="visually-hidden">LinkedIn</span>
          </a>
        </li>
      </ul>
    </section>

    <section class="col" aria-labelledby="h-echo">
      <h2 id="h-echo">Utilisez l’écho</h2>
      <p>Une question sur mes futurs services ? Une demande pour un article ?
        Une question sur les Vesper Tools ? Contactez-moi sur LinkedIn, par
        email à l’adresse : <a href="mailto:contact@vesperlab.dev">contact@vesperlab.dev</a>,
        ou en m’écrivant directement.</p>
      <a class="button" href="mailto:contact@vesperlab.dev">Écrivez-moi</a>
    </section>

  </div>
</main>

<footer class="site-footer">
  <p>Ce site respecte les critères d’accessibilité WCAG 2.2 AA.</p>
  <p>Créé par Vesper Lab,
    <a href="https://github.com/VesperLab-A11Y/vesperlab-website">open-source</a>.</p>
</footer>

</body>
</html>
```

- [ ] **Step 4 : Ajouter le bloc « Styles de la page » à la fin de `style.css`**

```css
/* ============================================================================
   Styles de la page
   ============================================================================ */

/* Conteneur : largeur lisible, marges fluides, rythme vertical généreux */
.site-header,
main#main,
.site-footer{
  max-width:64rem;
  margin-inline:auto;
  padding-inline:clamp(var(--space-6), 5vw, var(--space-16));
}

/* En-tête : logo centré, important */
.site-header{
  padding-block:clamp(var(--space-10), 8vw, var(--space-16)) var(--space-10);
  text-align:center;
}
.wordmark{
  margin:0;
  color:var(--accent);              /* sauge de marque, 9,8:1 sur --ink-975 */
  line-height:0;
}
.wordmark svg{
  height:clamp(64px, 12vw, 112px);
  width:auto;
}

/* Accroche */
.lead{
  max-width:42rem;
  margin-block:0 clamp(var(--space-10), 9vw, var(--space-16));
}
.lead-headline{
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(1.75rem, 5.5vw, var(--font-size-display));
  line-height:var(--leading-tight);
  letter-spacing:var(--tracking-display);
  margin:0 0 var(--space-6);
}
.lead-headline em{
  font-style:italic;
}
.lead-body{
  font-size:var(--font-size-lead);
  color:var(--text-secondary);
  margin:0;
}

/* Deux colonnes */
.cols{
  display:grid;
  gap:clamp(var(--space-10), 6vw, var(--space-16));
  align-items:start;
  padding-bottom:clamp(var(--space-16), 12vw, 6rem);
}
@media (min-width:720px){
  .cols{grid-template-columns:1fr 1fr;}
}
.col h2{
  font-family:var(--font-display);
  font-weight:600;
  font-size:var(--font-size-h2);
  line-height:var(--leading-heading);
  margin:0 0 var(--space-5);
}
.col h3{
  font-family:var(--font-display);
  font-weight:600;
  font-size:var(--font-size-h3);
  margin:var(--space-10) 0 var(--space-5);
}
.col p{
  color:var(--text-secondary);
  margin:0;
}

/* Liste des liens sociaux */
.social{
  list-style:none;
  padding:0;
  margin:0;
  display:flex;
  gap:var(--space-4);
}
.social a{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:var(--min-hit);
  min-height:var(--min-hit);
  color:var(--text-secondary);
  border-radius:var(--radius-md);
  text-decoration:none;
}
.social a:hover{color:var(--accent-hover);}
.social svg{width:24px;height:24px;}

/* Bouton « Écrivez-moi » */
.button{
  display:inline-flex;
  align-items:center;
  min-height:var(--min-hit);
  margin-top:var(--space-6);
  padding:var(--space-3) var(--space-8);
  background:var(--accent);
  color:var(--accent-on);
  font-weight:700;
  text-decoration:none;
  border-radius:var(--radius-md);
}
.button:hover{
  background:var(--accent-hover);
  color:var(--accent-on);
}

/* Pied de page */
.site-footer{
  padding-block:var(--space-10) clamp(var(--space-10), 8vw, var(--space-16));
  border-top:1px solid var(--border-default);
  text-align:center;
  color:var(--text-muted);
  font-size:var(--font-size-caption);
}
.site-footer p{margin:var(--space-3) 0;}

/* Une seule animation : arrivée douce du contenu, coupée en reduced-motion */
@keyframes lever{
  from{opacity:0;transform:translateY(8px);}
  to{opacity:1;transform:none;}
}
main#main{animation:lever .5s ease-out both;}
@media (prefers-reduced-motion:reduce){
  main#main{animation:none;}
}
```

- [ ] **Step 5 : Lancer `check.mjs` — il doit passer**

```bash
cd ~/Desktop/vesperlab-website
node scripts/check.mjs; echo "code sortie : $?"
```

Attendu : que des `✓`, `Tout est vert.`, code de sortie `0`. Corriger `index.html` jusqu'au vert (souvent : apostrophes droites au lieu de `’`, tracé SVG non collé, `favicon-32.png` pas encore là → cette ligne échouera tant que la Task 6 n'est pas faite : **c'est attendu**, voir la note ci-dessous).

> `check.mjs` §15 vérifie la présence des assets. `assets/favicon-32.png`,
> `assets/apple-touch-icon.png` et `assets/og-image.png` sont produits à la
> Task 6. Tant que la Task 6 n'est pas faite, lancer plutôt
> `node scripts/check.mjs` en acceptant ces 3 `✗` précis, ou créer des fichiers
> vides temporaires. À la fin de la Task 6, le vert doit être total.

- [ ] **Step 6 : Aperçu visuel + clavier**

```bash
cd ~/Desktop/vesperlab-website
python3 -m http.server 8000
```

Ouvrir le pane navigateur sur `http://localhost:8000/` puis vérifier :
- fond sombre `--ink-975`, logo sauge centré et grand ;
- accroche en Noto Serif, corps en Noto Sans (onglet réseau : les `.woff2` se chargent depuis `localhost`, **aucune** requête `fonts.gstatic.com` / `fonts.googleapis.com`) ;
- à ≥ 720 px les deux `<section>` sont côte à côte ; sous 720 px elles s'empilent ;
- `Tab` : skip-link (visible) → GitHub → Buy Me a Coffee → LinkedIn → lien email → bouton « Écrivez-moi » → lien « open-source ». Anneau de focus net à chaque étape ;
- activer le skip-link déplace le focus au `<main>` ;
- console : zéro erreur.

- [ ] **Step 7 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add index.html style.css scripts/check.mjs
git commit -m "Page : structure sémantique, mise en page 2 colonnes, contrôles check.mjs"
```

---

## Task 5 : Images générées — favicon PNG, apple-touch-icon, image Open Graph

**Files:**
- Create: `assets/favicon-32.png`, `assets/apple-touch-icon.png`, `assets/og-image.png`
- Create: `assets/_favicon-render.svg`, `assets/_og.svg` (gitignorés, matière au rendu)
- Create: `scripts/build-images.sh` (reproductible)

**Interfaces:**
- Consumes : `assets/favicon.svg` (Task 1), tracé du logo (`assets/vesperlab-logo.svg`).
- Produces : les 3 PNG référencés par `<head>` (Task 4 §12/§15 de `check.mjs`).

- [ ] **Step 1 : Écrire `scripts/build-images.sh`**

```bash
#!/usr/bin/env bash
# Génère les PNG du site depuis des sources SVG, avec rsvg-convert (Homebrew).
# Usage : bash scripts/build-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SAGE="#BDCFA9"
INK="#0E0F0D"

# --- favicon-32.png : depuis le favicon détaillé, déjà en sauge ---
rsvg-convert -w 32 -h 32 assets/favicon.svg -o assets/favicon-32.png

# --- apple-touch-icon.png : marque sur fond ink opaque, 180x180 ---
rsvg-convert -w 180 -h 180 --background-color "$INK" assets/favicon.svg -o assets/apple-touch-icon.png

# --- og-image.png : 1200x630, logo + accroche ---
# Le tracé du logo est repris de assets/vesperlab-logo.svg (viewBox 0 0 1006 974).
LOGO_PATH=$(sed -n 's/.*<path \(fill="[^"]*" \)\?fill-rule="nonzero" d="\([^"]*\)".*/\2/p' assets/vesperlab-logo.svg)
cat > assets/_og.svg <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="$INK"/>
  <g transform="translate(430,past) scale(0.34)" fill="$SAGE">
    <path fill-rule="nonzero" d="$LOGO_PATH"/>
  </g>
  <text x="600" y="470" text-anchor="middle" fill="$SAGE"
        font-family="Georgia, 'Times New Roman', serif" font-size="46" font-style="italic">
    L’obscurité ne ferme rien à qui sait écouter.
  </text>
  <text x="600" y="540" text-anchor="middle" fill="#D9D2C4"
        font-family="Arial, Helvetica, sans-serif" font-size="28">
    Laboratoire d’accessibilité numérique — Montréal
  </text>
</svg>
SVG
# centrage vertical du logo : viewBox 1006x974 * 0.34 ≈ 331 de haut ; y = (330 - 331/2)
sed -i '' 's/translate(430,past)/translate(430,70)/' assets/_og.svg
rsvg-convert -w 1200 -h 630 assets/_og.svg -o assets/og-image.png

echo "OK : favicon-32.png, apple-touch-icon.png, og-image.png"
```

> Si `sed -i ''` (syntaxe macOS/BSD) pose problème, remplacer par une écriture directe de la valeur `translate(430,70)` dans le heredoc.

- [ ] **Step 2 : Lancer le script**

```bash
cd ~/Desktop/vesperlab-website
bash scripts/build-images.sh
```

- [ ] **Step 3 : Vérifier les dimensions**

```bash
cd ~/Desktop/vesperlab-website
sips -g pixelWidth -g pixelHeight assets/favicon-32.png assets/apple-touch-icon.png assets/og-image.png
```

Attendu : `32×32`, `180×180`, `1200×630`.

- [ ] **Step 4 : Contrôle visuel**

Ouvrir les 3 PNG (dans le pane navigateur via `http://localhost:8000/assets/og-image.png`, etc.). L'`og-image` doit montrer le logo sauge centré en haut et les deux lignes de texte lisibles, sur fond ink. Ajuster `scale`/`translate` dans `build-images.sh` et relancer si le logo est décentré ou rogné.

- [ ] **Step 5 : `check.mjs` doit maintenant être vert à 100 %**

```bash
cd ~/Desktop/vesperlab-website
node scripts/check.mjs; echo "code sortie : $?"
```

Attendu : `Tout est vert.`, code `0`.

- [ ] **Step 6 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add assets/favicon-32.png assets/apple-touch-icon.png assets/og-image.png scripts/build-images.sh
git commit -m "Images : favicon PNG, apple-touch-icon, image Open Graph (rsvg-convert)"
```

---

## Task 6 : `404.html`, `robots.txt`, `sitemap.xml`, `_headers`

**Files:**
- Create: `404.html`, `robots.txt`, `sitemap.xml`, `_headers`
- Modify: `scripts/check.mjs` (ajout d'un contrôle `404.html`)

**Interfaces:**
- Consumes : `style.css` (Task 3/4).
- Produces : les fichiers de configuration Cloudflare Pages et la page d'erreur.

- [ ] **Step 1 : Écrire `404.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page introuvable — Vesper Lab</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0E0F0D">
<link rel="icon" href="assets/favicon.svg" sizes="any">
<link rel="stylesheet" href="style.css">
</head>
<body>
<a class="skip-link" href="#main">Aller au contenu</a>
<header class="site-header">
  <p class="wordmark" aria-hidden="true">
    <svg viewBox="0 0 1006 974"><path fill="currentColor" fill-rule="nonzero" d="… même tracé que le logo …"/></svg>
  </p>
</header>
<main id="main">
  <div class="lead">
    <h1 class="lead-headline">Cette page s’est éteinte.</h1>
    <p class="lead-body">L’adresse demandée n’existe pas ou n’existe plus.
      <a href="/">Revenir à l’accueil</a>.</p>
  </div>
</main>
<footer class="site-footer">
  <p>Créé par Vesper Lab,
    <a href="https://github.com/VesperLab-A11Y/vesperlab-website">open-source</a>.</p>
</footer>
</body>
</html>
```

> Sur `404.html` le logo est **décoratif** (le titre visible porte le message) → `aria-hidden="true"` sur le SVG, pas de `role`/`<title>`. Ici le `<h1>` est « Cette page s’est éteinte. » (contexte différent de l'accueil, un `<h1>` textuel est justifié).

- [ ] **Step 2 : Écrire `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://vesperlab.dev/sitemap.xml
```

- [ ] **Step 3 : Écrire `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vesperlab.dev/</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
```

- [ ] **Step 4 : Écrire `_headers`**

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
```

- [ ] **Step 5 : Ajouter le contrôle `404.html` à `scripts/check.mjs`**

Avant la ligne `console.log(failures ? …)`, insérer :

```js
// 17. 404.html : présent, lien retour accueil, feuille de styles partagée
if (!existsSync(new URL('../404.html', import.meta.url))) fail('404.html manquant');
else {
  const e = readFileSync(new URL('../404.html', import.meta.url), 'utf8');
  /<html[^>]*\blang="fr"/.test(e) ? ok('404 lang="fr"') : fail('404 lang manquant');
  /href="\/"/.test(e) ? ok('404 → lien accueil') : fail('404 sans lien accueil');
  /rel="stylesheet" href="style\.css"/.test(e) ? ok('404 utilise style.css') : fail('404 sans style.css');
  /<meta name="robots" content="noindex">/.test(e) ? ok('404 noindex') : fail('404 sans noindex');
  (e.match(/<h1[\s>]/g) || []).length === 1 ? ok('404 un seul <h1>') : fail('404 : nombre de <h1> incorrect');
}

// 18. Fichiers de déploiement
for (const f of ['robots.txt', 'sitemap.xml', '_headers']) {
  existsSync(new URL('../' + f, import.meta.url)) ? ok(f) : fail(f + ' manquant');
}
/https:\/\/vesperlab\.dev\/sitemap\.xml/.test(readFileSync(new URL('../robots.txt', import.meta.url), 'utf8'))
  ? ok('robots.txt déclare le sitemap') : fail('robots.txt sans sitemap');
```

- [ ] **Step 6 : Vérifier**

```bash
cd ~/Desktop/vesperlab-website
node scripts/check.mjs; echo "code sortie : $?"
node -e "new (require('xml2js').Parser)()" 2>/dev/null || npx --yes fast-xml-parser@4 assets/../sitemap.xml >/dev/null 2>&1 || xmllint --noout sitemap.xml && echo "OK sitemap.xml bien formé"
```

Attendu : `check.mjs` vert (code `0`) ; `sitemap.xml` bien formé (utiliser `xmllint --noout sitemap.xml`, présent sur macOS).

- [ ] **Step 7 : Aperçu de la 404**

Avec `python3 -m http.server 8000` lancé, ouvrir `http://localhost:8000/404.html` : même identité visuelle que l'accueil, titre « Cette page s’est éteinte. », lien « Revenir à l’accueil » fonctionnel, focus visible.

- [ ] **Step 8 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add 404.html robots.txt sitemap.xml _headers scripts/check.mjs
git commit -m "Config : 404, robots.txt, sitemap.xml, _headers Cloudflare Pages"
```

---

## Task 7 : `README.md`, `LICENSE`, doc de redirection Framer

**Files:**
- Create: `README.md`, `LICENSE`, `docs/redirection-framer.md`

**Interfaces:**
- Aucune dépendance de code. Livrables documentaires.

- [ ] **Step 1 : `LICENSE` (MIT)**

```
MIT License

Copyright (c) 2026 Pauline Chevalliot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2 : `README.md`**

```markdown
# vesperlab.dev

Site vitrine de **Vesper Lab** — laboratoire d'accessibilité numérique, Montréal.
Page unique « bientôt en ligne », en attendant l'ouverture des services à
l'automne 2026.

## Pile

HTML/CSS statique, zéro dépendance, zéro build. Polices Noto auto-hébergées.
Design system Vesper Lab V2 (thème sombre). Hébergé sur Cloudflare Pages.

## Développement

```bash
python3 -m http.server 8000     # aperçu sur http://localhost:8000/
node scripts/check.mjs          # contrôles de structure et d'accessibilité
```

Régénérer les assets dérivés :

```bash
node scripts/fetch-fonts.mjs    # récupère les .woff2 Noto
bash scripts/build-images.sh    # favicon PNG, apple-touch-icon, image OG
```

## Accessibilité

Cible WCAG 2.2 AA (AAA sur le texte courant). HTML sémantique, thème sombre
unique assumé, focus visible, `prefers-reduced-motion` respecté, aucune
ressource tierce chargée.

## Licence

Code sous [licence MIT](LICENSE). Le logo et la marque « Vesper Lab » ne sont
pas couverts par cette licence.
```

- [ ] **Step 3 : `docs/redirection-framer.md`**

```markdown
# Rediriger l'ancien site Framer vers vesperlab.dev

Le plan Framer gratuit ne permet pas de vraie redirection 301. On remplace donc
le **contenu** de la page `vesperlab.framer.website` par le bloc ci-dessous
(section « Embed » / HTML dans l'éditeur Framer, ou page vidée de tout autre
contenu).

```html
<meta http-equiv="refresh" content="0; url=https://vesperlab.dev/">
<link rel="canonical" href="https://vesperlab.dev/">
<p style="font-family: sans-serif; text-align: center; padding: 2rem;">
  Vesper Lab a déménagé : <a href="https://vesperlab.dev/">vesperlab.dev</a>.
  Vous allez être redirigé·e automatiquement.
</p>
```

Si Framer permet de régler les métadonnées SEO de la page : cocher « noindex »
sur l'ancienne page pour éviter le contenu dupliqué.

Ce n'est pas un 301 (Framer gratuit ne l'autorise pas) mais c'est suffisant :
la cible est le lien inscrit sur le CV IAAP, pas le référencement Google.
```

- [ ] **Step 4 : Vérifier**

```bash
cd ~/Desktop/vesperlab-website
for f in README.md LICENSE docs/redirection-framer.md; do test -s "$f" && echo "OK $f" || echo "FAIL $f"; done
grep -q 'MIT License' LICENSE && grep -q 'Pauline Chevalliot' LICENSE && echo "OK licence"
grep -q 'http-equiv="refresh" content="0; url=https://vesperlab.dev/"' docs/redirection-framer.md && echo "OK bloc Framer"
```

Attendu : 3 `OK` + `OK licence` + `OK bloc Framer`.

- [ ] **Step 5 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add README.md LICENSE docs/redirection-framer.md
git commit -m "Docs : README, licence MIT, bloc de redirection Framer"
```

---

## Task 8 : Vérification finale et remise à Pauline

**Files:** aucun fichier de code. Produit des captures + une checklist de couverture.

**Interfaces:** consomme l'ensemble du site. Produit `docs/couverture-accessibilite.md` et des captures d'écran.

- [ ] **Step 1 : `check.mjs` vert**

```bash
cd ~/Desktop/vesperlab-website
node scripts/check.mjs
```

Attendu : `Tout est vert.` / code `0`.

- [ ] **Step 2 : Passe navigateur complète (pane navigateur, serveur local)**

Avec `python3 -m http.server 8000`, sur `http://localhost:8000/` :

1. **Rendu** desktop, puis `resize_window` mobile (375) puis 320 de large : aucun défilement horizontal, colonnes empilées sous 720.
2. **Réseau** : `read_network_requests` — uniquement des URL `localhost:8000` (polices, CSS, favicons, images). Zéro `fonts.gstatic.com`, zéro `githubusercontent`, zéro CDN.
3. **Console** : `read_console_messages` — zéro erreur, zéro avertissement.
4. **Titres** : extraire l'outline (`document.querySelectorAll('h1,h2,h3')`) → `Vesper Lab` (h1), `Arrivée prévue à l'automne 2026` (h2), `En attendant le crépuscule` (h3), `Utilisez l'écho` (h2). Aucun saut.
5. **Clavier** : ordre de tabulation skip-link → 3 liens sociaux → lien email → bouton → lien footer ; anneau visible partout ; skip-link amène à `#main`.
6. **Zoom** : `document.body.style.zoom='2'` (ou zoom navigateur 200 %) — rien de tronqué ni superposé.
7. **`prefers-reduced-motion`** : `resize_window` ne le fait pas ; utiliser l'émulation du pane (ou `matchMedia`) — vérifier via `getComputedStyle(document.querySelector('main')).animationDuration` ≈ `0.01ms` quand la préférence est active.
8. **`prefers-color-scheme: light`** émulé : la page **ne change pas** (aucun style clair).
9. **`mailto:`** : le bouton et le lien texte pointent bien sur `mailto:contact@vesperlab.dev`.
10. **Contraste** (DevTools ou calcul) : `--text-body` sur `--surface-page` ≥ 7:1 ; `--link` (sauge) sur `--surface-page` ≥ 4,5:1 ; logo sauge sur fond ≥ 3:1. Si le lien sauge passe sous 4,5:1, assombrir `--link` localement (ex. `oklch(0.72 0.06 128)`) — le soulignement reste de toute façon.
11. **404** : `http://localhost:8000/rien` via le serveur Python ne sert pas `404.html` automatiquement — ouvrir `http://localhost:8000/404.html` directement pour le rendu ; le vrai routage 404 sera validé sur Cloudflare (Task 9).

- [ ] **Step 3 : (Optionnel) axe-core en ligne de commande**

```bash
cd ~/Desktop/vesperlab-website
npx --yes @axe-core/cli@4 http://localhost:8000/ --exit || true
```

Indicatif : Pauline fait son propre audit. Noter les éventuels retours dans la checklist sans forcément les corriger tous ici.

- [ ] **Step 4 : Captures**

Via le pane navigateur : capture desktop pleine page + capture mobile (375). Les enregistrer dans `~/Desktop/vesperlab-website/docs/apercu-desktop.png` et `docs/apercu-mobile.png`.

- [ ] **Step 5 : Écrire `docs/couverture-accessibilite.md`**

Lister ce que le code garantit déjà (repris de la spec §5) et ce qui reste au jugement de Pauline :

```markdown
# Couverture accessibilité — point de départ pour l'audit

## Déjà en place dans le code
- `lang="fr"` ; un seul `<h1>` ; hiérarchie h1→h2→h3→h2 sans saut.
- Landmarks `header`/`main`/`footer` ; skip-link fonctionnel, visible au focus.
- `:focus-visible` 2 px + offset partout, jamais supprimé.
- Cibles ≥ 44×44 px (bouton, liens-icônes).
- Liens de texte soulignés ; liens-icônes avec libellé `.visually-hidden` ;
  SVG décoratifs `aria-hidden` + `focusable="false"`.
- `contact@vesperlab.dev` en clair et cliquable + bouton — le `mailto:` n'est
  pas l'unique chemin.
- `prefers-reduced-motion` respecté (une seule animation, coupée).
- Aucune ressource tierce ; aucun script.
- Reflow 320 px, zoom 200 % : vérifiés sans perte.
- Contrastes mesurés : corps __:1, lien sauge __:1, logo __:1 (compléter).

## À vérifier / trancher par Pauline
- Jugement final sur le contraste de l'accent sauge en usage lien.
- Formulation et ton des textes.
- Test lecteur d'écran réel (NVDA, VoiceOver) — non fait ici.
- Pertinence de l'`alt`/`<title>` du logo (« Vesper Lab ») en contexte.
```

Renseigner les valeurs de contraste mesurées au Step 2.10.

- [ ] **Step 6 : Commit**

```bash
cd ~/Desktop/vesperlab-website
git add docs/couverture-accessibilite.md docs/apercu-desktop.png docs/apercu-mobile.png
git commit -m "Vérification : passe finale, captures, checklist de couverture a11y"
```

- [ ] **Step 7 : Remettre à Pauline**

Envoyer les deux captures + `docs/couverture-accessibilite.md`. Annoncer que le code est prêt pour son audit et pour le déploiement (Task 9, étapes manuelles).

---

## Task 9 : Runbook de déploiement (piloté par Pauline)

Étapes hors-code, nécessitant les accès de Pauline (GitHub, Cloudflare, Framer).
L'agent prépare/explique, Pauline exécute et confirme.

- [ ] **Step 1 : Créer le dépôt GitHub et pousser**

Sur `github.com/VesperLab-A11Y` → New repository → nom `vesperlab-website`,
**public**, sans README/licence/gitignore (déjà présents en local). Puis :

```bash
cd ~/Desktop/vesperlab-website
git remote add origin https://github.com/VesperLab-A11Y/vesperlab-website.git
git push -u origin main
```

- [ ] **Step 2 : Créer le projet Cloudflare Pages**

Cloudflare → Workers & Pages → Create → **Pages** → Connect to Git → autoriser
l'app GitHub sur `VesperLab-A11Y` → choisir `vesperlab-website`.
Réglages de build : **Framework preset = None**, Build command = *(vide)*,
Build output directory = `/`. Déployer. Une URL `vesperlab-website.pages.dev`
apparaît → vérifier que la page s'affiche.

- [ ] **Step 3 : Vérifier le routage 404 sur Pages**

Ouvrir `https://vesperlab-website.pages.dev/nimportequoi` → `404.html` doit
être servi (Cloudflare Pages le fait automatiquement s'il est à la racine).

- [ ] **Step 4 : Rattacher le domaine**

Projet Pages → Custom domains → Add → `vesperlab.dev`, puis à nouveau →
`www.vesperlab.dev`. Cloudflare crée les enregistrements (le domaine est déjà
sur le compte) et provisionne le certificat. Attendre le statut « Active ».

- [ ] **Step 5 : Redirection `www` → apex**

Cloudflare → le domaine `vesperlab.dev` → Rules → Redirect Rules → Create :
- Si `Hostname` `equals` `www.vesperlab.dev`
- Alors `Static redirect` → `https://vesperlab.dev/${http.request.uri.path}`, code **301**.

Tester : `https://www.vesperlab.dev/` redirige vers `https://vesperlab.dev/`.

- [ ] **Step 6 : Vérifs post-mise en ligne**

```bash
curl -sI https://vesperlab.dev/ | grep -i '^HTTP\|^content-type\|^cache-control'
curl -sI https://www.vesperlab.dev/ | grep -i '^HTTP\|^location'
curl -s https://vesperlab.dev/robots.txt
curl -s https://vesperlab.dev/sitemap.xml
```

Attendu : `200` sur l'apex, `301` + `Location: https://vesperlab.dev/` sur `www`,
`robots.txt` et `sitemap.xml` servis. Reprendre la passe navigateur (Task 8
Step 2) sur l'URL de production, y compris l'OG (coller
`https://vesperlab.dev/` dans un validateur de partage).

- [ ] **Step 7 : Rediriger l'ancien site Framer**

Ouvrir l'éditeur Framer de `vesperlab.framer.website`, remplacer le contenu de
la page par le bloc de `docs/redirection-framer.md`, publier. Tester :
`vesperlab.framer.website` renvoie vers `vesperlab.dev`.

- [ ] **Step 8 : Fin**

Le lien du CV IAAP (`vesperlab.framer.website`) aboutit désormais sur le
nouveau site. Marquer le projet comme livré ; le multi-pages (blog, portfolio)
reste un chantier distinct.

---

## Auto-revue du plan

**Couverture de la spec :**
- §2 contenu → Task 4 (HTML + `check.mjs` §16 vérifie chaque phrase verbatim).
- §3 paramètres figés → Global Constraints + Tasks 4/5/7.
- §4.1 fichiers → table « Structure des fichiers » + toutes les tâches.
- §4.2 structure sémantique → Task 4 Step 3 + `check.mjs` §1-13.
- §4.3 styles / thème sombre → Task 3 + Task 4 Step 4.
- §4.4 polices auto-hébergées → Task 2 + Task 3 (`@font-face`) + `check.mjs` §14.
- §4.5 favicon (jeu Viewer) → Task 1 Step 2 + Task 5 + Task 4 `<head>`.
- §4.6 métadonnées → Task 4 Step 3 + `check.mjs` §12.
- §5 accessibilité → `check.mjs` §1-13, Task 8 Step 2, `docs/couverture-accessibilite.md`.
- §6 cas limites → Task 3 (repli polices), Task 6 (404), Task 4 (mailto + adresse en clair).
- §7 déploiement → Task 9.
- §8 tests → Task 8.
- §9 points d'implémentation → Tasks 1, 2, 5 ; reformulation colonne droite → Task 4 Step 3.
- §10 décisions confirmées → intégrées (thème sombre, favicon Viewer, h1=logo, MIT, polices).

**Scan des placeholders :** les `…` dans les blocs HTML de la Task 4/6 sont des
points d'insertion **explicites** (« COLLER LE TRACÉ DE … », « même tracé que
le logo », « github »/« linkedin »/« buymeacoffee ») dont la source est nommée
et disponible depuis la Task 1 — pas des TODO. Aucun « TBD », « add error
handling », « write tests for the above ».

**Cohérence des types/noms :** ancres `#main`, `#h-prep`, `#h-social`,
`#h-echo` identiques entre Task 4 (HTML), `check.mjs` (§4, §7) et Task 8.
Classes `.lead-headline`, `.lead-body`, `.cols`, `.col`, `.social`, `.button`,
`.wordmark`, `.site-header`, `.site-footer`, `.skip-link`, `.visually-hidden`
définies en Task 3/4 et réutilisées en Task 6. Noms de fichiers polices
`noto-(serif|sans)-(latin|latin-ext)-(400|600|700).woff2` identiques entre
Task 2 (génération), Task 3 (`@font-face`), Task 4 (`preload`), `check.mjs` §14.
Jeton `--space-16` (propre au site) défini une fois en Task 3, utilisé en
Task 4. Deux teintes seulement en dur : sauge `#BDCFA9` (logo + favicons) et
ink `#0E0F0D` (`--void-950`, utilisé pour `theme-color`, le fond
`apple-touch-icon` et le fond `og-image`). La spec §4.6 mentionnait `#100F0D`
(valeur historique de la marque) — remplacé partout par `#0E0F0D` pour coller
au jeton V2 `--void-950` ; écart de 2 unités, imperceptible.
