# Spec — Site vitrine Vesper Lab (page unique « bientôt en ligne »)

Date : 2026-09-03
Statut : à valider par Pauline avant le plan d'implémentation.

---

## 1. But et périmètre

Remplacer la page Framer actuelle (`vesperlab.framer.website`) par une **page
unique statique**, hébergée sur un domaine propre (`vesperlab.dev`), servie par
Cloudflare Pages, code public sur GitHub.

**Dans le périmètre :** une seule page (`index.html`), sa feuille de styles, ses
assets (logo, favicon, polices, image Open Graph), une page 404, la mise en
ligne (repo + Cloudflare Pages + DNS), et le HTML de redirection à coller dans
Framer.

**Hors périmètre (reporté, voir `~/Desktop/VesperLab-Site/brief-design-site-vesperlab.md`) :**
le site multi-pages (About, Portfolio, Blog Jekyll, carousel). Rien de tout ça
ici. Pas de framework, pas de build, pas de JS applicatif, pas de backend.

L'audit d'accessibilité de la page livrée est fait par Pauline, pas dans ce
périmètre. Ce document liste seulement ce que le code doit garantir en amont.

---

## 2. Contenu de la page (texte définitif)

### Header
Logo Vesper Lab seul, centré, grande taille.

### Accroche (haut de page, un bloc)
> **L'obscurité ne ferme rien à qui sait _écouter_.**
>
> Vesper Lab passe au crible les sites et les documents numériques, repère ce
> qui bloque, et explique comment le corriger. Normes WCAG 2.2 et SGQRI 008.
> Montréal, en français et en anglais.

« écouter » est en emphase (`<em>`).

### Colonne gauche
**Titre :** Arrivée prévue à l'automne 2026

Diagnostics d'accessibilité, audits techniques, outils pédagogiques et de
nombreux conseils sont en préparation.

**Sous-titre :** En attendant le crépuscule

Trois liens icônes, dans cet ordre : GitHub · Buy Me a Coffee · LinkedIn.

### Colonne droite
**Titre :** Utilisez l'écho

Une question sur mes futurs services ? Une demande pour un article ? Une
question sur les Vesper Tools ? Contactez-moi sur LinkedIn, par email à
l'adresse : contact@vesperlab.dev, ou grâce au formulaire ci-dessous.

> Note : le texte mentionne « le formulaire ci-dessous ». Comme on part sur un
> `mailto:` sans champs, cette dernière proposition est reformulée en
> « … ou en m'écrivant directement. » et un bouton **« Écrivez-moi »**
> (`mailto:contact@vesperlab.dev`) suit le paragraphe. `contact@vesperlab.dev`
> reste écrit en toutes lettres et cliquable dans le paragraphe.

### Footer (centré, deux lignes)
1. Ce site respecte les critères d'accessibilité WCAG 2.2 AA.
2. Créé par Vesper Lab, [open-source](https://github.com/VesperLab-A11Y/vesperlab-website).

---

## 3. Paramètres figés

| Paramètre | Valeur |
|---|---|
| Domaine | `vesperlab.dev` ; `www.vesperlab.dev` → redirection 301 vers l'apex |
| Repo GitHub | `VesperLab-A11Y/vesperlab-website` (public) |
| Dossier local | `~/Desktop/vesperlab-website/` |
| Hébergement | Cloudflare Pages, connecté au repo, **sans étape de build** (upload direct du dossier racine) |
| Design system | V2 — jetons repris de `~/Desktop/Vesper-Library/style.css` |
| Logo | `~/Desktop/vesper-logos/vesperlab/vesperlab-currentcolor.svg`, **inliné** dans le HTML |
| LinkedIn | `https://www.linkedin.com/in/paulinechevalliot` |
| Buy Me a Coffee | `https://buymeacoffee.com/vesperlab` |
| Icône GitHub | `https://github.com/VesperLab-A11Y` |
| Contact | bouton `mailto:contact@vesperlab.dev`, aucun champ |
| `<title>` | `Vesper Lab : Accessibilité numérique` |
| meta description | `Laboratoire d'accessibilité numérique, situé à Montréal. Diagnostics web et PDF, en français et en anglais.` |
| Licence | MIT |

---

## 4. Architecture technique

### 4.1 Fichiers du repo

```
index.html          Page unique. HTML sémantique, SVG logo inliné, styles liés.
style.css           Jetons DS V2 en :root + styles de la page + @media.
404.html            Message court + lien retour vers l'accueil. Même gabarit visuel.
robots.txt          Autorise tout, déclare le sitemap.
sitemap.xml         Une seule URL (l'accueil). Écrit à la main.
assets/
  vesperlab-currentcolor.svg   Copie du logo (source de vérité = ~/Desktop/vesper-logos).
  favicon.svg                  = logo currentColor, pour sizes="any" (net ≥ 32 px).
  favicon-16.svg               Silhouette pleine 16 px (dérivée, voir 4.5).
  favicon-32.png               Repli PNG.
  apple-touch-icon.png         180×180, fond ink opaque.
  og-image.png                 1200×630, logo + accroche courte, fond ink.
  fonts/
    noto-serif-latin-{400,600}.woff2
    noto-serif-latin-ext-{400,600}.woff2
    noto-sans-latin-{400,600,700}.woff2
    noto-sans-latin-ext-{400,600,700}.woff2
README.md
LICENSE             MIT
.gitignore          .DS_Store, etc.
_headers            En-têtes Cloudflare Pages (cache assets, sécurité de base).
```

Pas de `main.js` : la page n'a aucun comportement dynamique.

### 4.2 Structure sémantique de `index.html`

```
<!DOCTYPE html>
<html lang="fr">
<head> … charset, viewport, title, meta description, Open Graph, favicons, style.css …
<body>
  <a class="skip-link" href="#main">Aller au contenu</a>

  <header class="site-header">
    <h1 class="wordmark">
      <svg role="img" aria-labelledby="logo-title" viewBox="0 0 1006 974">
        <title id="logo-title">Vesper Lab</title> … tracé …
      </svg>
    </h1>
  </header>

  <main id="main">
    <p class="lead">
      <strong>L'obscurité ne ferme rien à qui sait <em>écouter</em>.</strong>
      Vesper Lab passe au crible …
    </p>

    <div class="cols">
      <section aria-labelledby="h-prep">
        <h2 id="h-prep">Arrivée prévue à l'automne 2026</h2>
        <p>Diagnostics d'accessibilité, audits techniques, …</p>
        <h3 id="h-social">En attendant le crépuscule</h3>
        <ul class="social" aria-labelledby="h-social">
          <li><a href="https://github.com/VesperLab-A11Y">
            <svg aria-hidden="true" focusable="false">…</svg>
            <span class="visually-hidden">GitHub</span></a></li>
          <li><a href="https://buymeacoffee.com/vesperlab"> … Buy Me a Coffee … </a></li>
          <li><a href="https://www.linkedin.com/in/paulinechevalliot"> … LinkedIn … </a></li>
        </ul>
      </section>

      <section aria-labelledby="h-echo">
        <h2 id="h-echo">Utilisez l'écho</h2>
        <p>Une question sur mes futurs services ? … par email à l'adresse :
           <a href="mailto:contact@vesperlab.dev">contact@vesperlab.dev</a>,
           ou en m'écrivant directement.</p>
        <a class="button" href="mailto:contact@vesperlab.dev">Écrivez-moi</a>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <p>Ce site respecte les critères d'accessibilité WCAG 2.2 AA.</p>
    <p>Créé par Vesper Lab,
       <a href="https://github.com/VesperLab-A11Y/vesperlab-website">open-source</a>.</p>
  </footer>
</body>
```

**Décisions de structure :**

- **`<h1>` = le logo.** Son nom accessible vient du `<title>` du SVG
  (« Vesper Lab »). On garde `role="img"` + `aria-labelledby` (le mot
  « Vesper Lab » n'est écrit nulle part ailleurs en texte).
- **L'accroche est un `<p class="lead">`, pas un titre.** C'est une phrase
  d'ambiance ; la hiérarchie de titres n'a pas à la porter.
- Hiérarchie : `h1` (logo) → `h2` × 2 (« Arrivée prévue… », « Utilisez l'écho »)
  → `h3` × 1 (« En attendant le crépuscule »). Aucun niveau sauté.
- Les liens sociaux forment une **liste** (`<ul>`). Chaque `<a>` contient une
  icône SVG `aria-hidden="true" focusable="false"` **et** un libellé
  `visually-hidden` (« GitHub », « Buy Me a Coffee », « LinkedIn »).
- **Pas de `target="_blank"`.** Les liens s'ouvrent dans le même onglet — pas
  d'avertissement lecteur d'écran à gérer, pas de perte de contexte forcée.
- Un seul lien par élément de la liste sociale (pas d'imbrication de cliquables).
- Landmarks : `header`, `main`, `footer`. Skip-link vers `#main`, visible au
  focus (motif repris de `Vesper-Library/style.css` : `.skip-links a`).

### 4.3 Styles (`style.css`)

- **Jetons DS V2 recopiés en `:root`** depuis `Vesper-Library/style.css` :
  couleurs (neutres teinte 150, accent sauge), typo (Noto Serif / Noto Sans,
  échelle éditoriale — display 44, h1 32, h2 24, lead/body 17), espacements,
  rayons, ombres. Les jetons `--severity-*` ne sont **pas** repris (pas un outil
  d'audit).
- Reset léger + `:focus-visible { outline: 2px solid var(--focus-ring);
  outline-offset: 2px; }` (identique à la Library).
- **Thème :** sombre par défaut (le `:root`). On **honore `prefers-color-scheme:
  light`** via `@media`, en recopiant les valeurs de jetons clairs déjà définies
  dans `Vesper-Library/style.css` (bloc `[data-theme="light"]`). **Pas de
  bouton de bascule** en v1 — on suit le système, comme le fait la Library
  (« un site d'accessibilité ne peut pas imposer le mode sombre »). En thème
  clair, la couleur du logo passe au noir (`--void-950`) : la sauge claire ne
  tient pas le contraste sur fond papier (voir `vesper-logos/LISEZ-MOI.md`).
- **Logo :** SVG inliné dans un conteneur dont on pilote `color:` —
  `var(--sage-500)` en sombre (9,8:1 sur `--ink-975`), `var(--void-950)` en
  clair. Aucune `width`/`height` fixée sur le SVG (zoom 400 % OK) ; on borne via
  `.wordmark svg { height: clamp(64px, 12vw, 112px); width: auto; }`.
- **Mise en page :**
  - Mobile-first, une colonne.
  - `.lead` : `max-width: ~42rem`, centré, texte un cran plus grand.
  - `.cols` : `display: grid; gap: var(--space-10);` — une colonne sous ~720 px,
    `grid-template-columns: 1fr 1fr;` au-dessus. `align-items: start` (la colonne
    droite est plus courte, pas de faux remplissage).
  - Conteneur global : `max-width: ~64rem`, marges latérales fluides,
    `padding-block` généreux.
  - Header et footer : contenu centré (`text-align: center` + `justify-items`).
- **Bouton « Écrivez-moi » :** style bouton primaire du DS — fond
  `var(--accent)`, texte `var(--accent-on)`, `border-radius: var(--radius-md)`,
  `min-height: var(--min-hit)` (44 px), `padding` confortable, `:hover` →
  `var(--accent-hover)`, `:focus-visible` comme le reste.
- **Liens icônes :** zone cible ≥ 44 × 44 px (`display: inline-flex;
  padding: var(--space-3);`), `gap` entre eux ≥ `var(--space-4)`, `color`
  héritée, `:hover`/`:focus-visible` → `var(--accent-hover)` + anneau visible.
- **Animation :** un seul effet — fondu + léger décalage vertical à l'arrivée
  (`@keyframes`), appliqué au `main`. Neutralisé sous
  `@media (prefers-reduced-motion: reduce)` (bloc identique à la Library :
  `transition`/`animation-duration: 0.01ms !important`). `scroll-behavior:
  smooth` seulement hors reduced-motion.

### 4.4 Polices — auto-hébergées

- Familles : **Noto Serif** (400, 600) et **Noto Sans** (400, 600, 700).
  Noto Sans Mono n'est pas utilisée sur cette page → non embarquée.
- Fichiers `.woff2` seulement, sous-ensembles `latin` + `latin-ext`
  (le `latin-ext` couvre les diacritiques FR — « é à ç œ » — au cas où le sujet
  déborde du `latin` de base). Source : fichiers woff2 de Google Fonts (CSS2) ou
  paquets `@fontsource`.
- `@font-face` avec `font-display: swap` et `unicode-range` par sous-ensemble.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` sur les 2 faces
  du premier rendu (Noto Serif 400 pour l'accroche/titres, Noto Sans 400 pour le
  corps).
- Motivation : pas de requête tierce vers Google (cohérent avec le
  positionnement), pas de `@import` bloquant, contrôle du `font-display`.
- Pile de repli dans les jetons : `'Noto Serif', Georgia, 'Times New Roman',
  serif` et `'Noto Sans', Arial, Helvetica, sans-serif` (déjà ainsi dans le DS).

### 4.5 Favicon

- `assets/favicon.svg` = le logo `currentColor` — déclaré `rel="icon"
  sizes="any"`. Net à partir de ~32 px.
- `assets/favicon-16.svg` = **silhouette pleine** pour 16–24 px (le tracé au
  trait devient illisible sous 24 px — voir `LISEZ-MOI.md`). Il n'existe pas de
  favicon Vesper Lab pré-fait (seuls les *outils* en ont). Option retenue :
  réutiliser `~/Desktop/vesper-logos/library/library-favicon-16-currentcolor.svg`
  (même marque chauve-souris, cohérente avec la Library) ; à défaut, en dériver
  un par fermeture morphologique. **À confirmer avec Pauline.**
- `assets/favicon-32.png` : repli PNG pour les vieux agents.
- `assets/apple-touch-icon.png` : 180×180, marque sur fond `--void-950` opaque
  (pas de transparence sur iOS).
- Déclarations dans `<head>` :
  ```html
  <link rel="icon" href="assets/favicon-16.svg" sizes="16x16">
  <link rel="icon" href="assets/favicon.svg" sizes="any">
  <link rel="icon" href="assets/favicon-32.png" sizes="32x32">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
  ```

### 4.6 Métadonnées `<head>`

- `<title>Vesper Lab : Accessibilité numérique</title>`
- `<meta name="description" content="Laboratoire d'accessibilité numérique, situé à Montréal. Diagnostics web et PDF, en français et en anglais.">`
- Open Graph : `og:type=website`, `og:title`, `og:description`, `og:url`
  (`https://vesperlab.dev/`), `og:image` (`https://vesperlab.dev/assets/og-image.png`),
  `og:locale=fr_CA`.
- `<meta name="twitter:card" content="summary_large_image">`
- `<link rel="canonical" href="https://vesperlab.dev/">`
- `<meta name="theme-color">` : `--void-950` en sombre, valeur claire via
  `media="(prefers-color-scheme: light)"`.
- Pas de JSON-LD en v1 (optionnel, peut s'ajouter plus tard).

---

## 5. Accessibilité — ce que le code garantit en amont

(L'audit complet reste fait par Pauline.)

- `lang="fr"` sur `<html>`.
- Un seul `h1`, hiérarchie sans saut, chaque `section` reliée à son titre par
  `aria-labelledby`.
- Skip-link fonctionnel et visible au focus.
- `:focus-visible` net partout (outline 2 px + offset), jamais supprimé.
- Cibles tactiles ≥ 44 × 44 px (bouton, liens icônes).
- Contraste : corps `--text-body` sur `--surface-page` bien au-delà de AAA ;
  logo ≥ 3:1 sur son fond dans les deux thèmes ; à **vérifier au build**
  l'accent sauge en tant que **texte de lien** (`--link` = `--sage-500`) sur
  `--surface-page` → viser 4,5:1, sinon assombrir le lien localement ou ajouter
  un soulignement systématique (le soulignement est de toute façon conservé sur
  les liens de texte).
- Aucune information portée par la couleur seule (les liens de texte sont
  soulignés ; les liens icônes ont un libellé).
- `prefers-reduced-motion` respecté (une seule animation, désactivable).
- Zoom 200 % et reflow à 320 px de large : pas de perte de contenu, pas de
  défilement à deux axes (layout fluide, `max-width` en `rem`, pas de largeur
  fixe en `px`).
- Icônes SVG décoratives : `aria-hidden="true" focusable="false"`.
- Le `mailto:` : `contact@vesperlab.dev` est **aussi** en texte cliquable dans
  le paragraphe → si le client mail n'est pas configuré, l'adresse reste
  lisible et copiable ; le bouton n'est pas le seul chemin.

---

## 6. Gestion des erreurs / cas limites

- **Pas de JS** → rien ne « casse » côté script. La page est du contenu statique.
- **Polices non chargées** → repli Georgia / Arial via la pile de jetons ;
  `font-display: swap` évite le texte invisible.
- **SVG logo non rendu** (très vieux agent) → le `<title>` « Vesper Lab » du
  `role="img"` reste annoncé ; visuellement, prévoir `.wordmark { min-height }`
  pour ne pas effondrer le header. Pas de texte de repli visible demandé.
- **`mailto:` sans client mail** → cf. §5, l'adresse en clair sert de repli.
- **404** → `404.html` servi par Cloudflare Pages : titre court, phrase, lien
  « Retour à l'accueil » vers `/`. Même `<head>` minimal, même feuille de styles.
- **JS tiers bloqués / DNT** → aucun script tiers, aucun analytics en v1. Rien à
  dégrader.

---

## 7. Déploiement

### 7.1 Repo → GitHub
1. Dossier `~/Desktop/vesperlab-website/` déjà `git init` (branche `main`,
   `user.email = paulinecvt2021@gmail.com`).
2. Commits : d'abord la spec, puis l'implémentation.
3. Pauline crée `VesperLab-A11Y/vesperlab-website` sur GitHub (public) et
   `git push -u origin main`. **C'est Pauline qui pousse** (publication publique).

### 7.2 Cloudflare Pages
1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → autoriser
   l'app GitHub sur le compte `VesperLab-A11Y` → choisir `vesperlab-website`.
2. Build settings : **framework preset = None**, build command = *(vide)*,
   output directory = `/` (racine). Déploie à chaque push sur `main`.
3. Premier déploiement → URL `*.pages.dev` de test.

### 7.3 Domaine (DNS déjà chez Cloudflare)
1. Projet Pages → Custom domains → ajouter `vesperlab.dev` **et**
   `www.vesperlab.dev`. Cloudflare crée les enregistrements (CNAME) et le
   certificat automatiquement.
2. Redirection `www` → apex : **Redirect Rule** (Rules → Redirect Rules) —
   `Hostname equals www.vesperlab.dev` → `https://vesperlab.dev/${path}`,
   301 statique. (Ou « Bulk Redirect ». Pas via `_redirects`, qui est
   propre au projet Pages et pas au hostname.)
3. Vérifier : HTTPS forcé, HSTS optionnel plus tard.

### 7.4 `_headers` (Cloudflare Pages)
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```
(CSP possible plus tard ; en v1, page sans script ni ressource tierce, faible
surface.)

### 7.5 Redirection de l'ancien site Framer (plan gratuit)
Pauline n'a accès qu'à l'édition de la page. On lui fournit un bloc à coller
(section HTML embed Framer, ou remplacement du contenu) :
```html
<meta http-equiv="refresh" content="0; url=https://vesperlab.dev/">
<p>Vesper Lab a déménagé : <a href="https://vesperlab.dev/">vesperlab.dev</a>.
   Vous allez être redirigé·e.</p>
```
Idéalement aussi : `<link rel="canonical" href="https://vesperlab.dev/">` et,
si Framer le permet, retirer l'indexation de l'ancienne page. Ce n'est pas un
vrai 301 (Framer gratuit ne le permet pas) mais suffisant : la cible est le CV
IAAP, pas le référencement Google.

---

## 8. Tests / vérification (avant remise à Pauline pour son audit)

Fait via l'aperçu navigateur local (`python3 -m http.server` puis le pane
navigateur) :

1. **Rendu** : desktop + mobile (375 px) + 320 px de large — pas de scroll
   horizontal, colonnes qui s'empilent au bon breakpoint.
2. **Thème** : forcer `prefers-color-scheme: dark` puis `light` — lisibilité et
   contraste du logo dans les deux.
3. **Clavier** : Tab traverse skip-link → liens sociaux → lien email → bouton
   « Écrivez-moi » → lien footer, focus visible à chaque étape ; skip-link
   amène bien à `#main`.
4. **Titres** : extraire l'outline (h1 → h2 → h2 → h3), aucun saut.
5. **Zoom 200 %** : aucun contenu tronqué ou superposé.
6. **reduced-motion** : activer la préférence → aucune animation.
7. **Sans script** : la page est déjà sans JS — vérifier qu'aucune ressource
   tierce n'est requêtée (onglet réseau : seulement des ressources same-origin).
8. **`mailto:`** : le bouton et le lien texte ouvrent un brouillon vers
   `contact@vesperlab.dev`.
9. **Métadonnées** : `<title>`, description, OG présents ; favicon chargé ;
   `og:image` accessible en absolu.
10. **404** : servir une URL inexistante en local, vérifier le rendu de
    `404.html`.
11. Console : zéro erreur, zéro avertissement.

Captures desktop + mobile fournies à Pauline avec une checklist de ce qui est
couvert, pour qu'elle enchaîne son audit.

---

## 9. Points laissés à l'implémentation

- Extraction/minification exacte du sous-ensemble de jetons DS V2 réellement
  utilisés (ne pas recopier les jetons morts).
- Récupération des `.woff2` Noto (sous-ensembles latin / latin-ext) et
  génération des `@font-face`.
- Dessin de `og-image.png` (1200×630) et de `apple-touch-icon.png`.
- Choix final du `favicon-16` (réutilisation Library vs dérivation) — §4.5.
- Reformulation fine du dernier membre de phrase de la colonne droite
  (« … ou en m'écrivant directement. »).
- Copies SVG des icônes GitHub / Buy Me a Coffee / LinkedIn (jeux d'icônes
  libres, ex. Simple Icons — vérifier la licence, les recopier en local, pas de
  CDN).

---

## 10. Décisions à confirmer par Pauline

1. **`<h1>` = le logo** (nom accessible « Vesper Lab »), l'accroche reste un
   paragraphe. OK ?
2. **Thème clair automatique** via `prefers-color-scheme`, sans bouton de
   bascule, comme la Library. OK ? (Le brief 2026-08-20 disait « sombre
   uniquement » — ce point le contredit volontairement.)
3. **Polices auto-hébergées** plutôt que Google Fonts `@import`. OK ?
4. **Licence MIT.** OK ?
5. **`favicon-16` réutilisé depuis le jeu Library** (marque chauve-souris
   commune) faute de favicon Vesper Lab dédié. OK, ou tu veux un pictogramme
   Vesper Lab dessiné pour les petites tailles (tâche séparée) ?
6. Reformuler « … grâce au formulaire ci-dessous » en « … ou en m'écrivant
   directement. » puisqu'il n'y a plus de formulaire. OK ?
