# Couverture accessibilité — point de départ pour l'audit

Vérification effectuée le 2026-09-04 sur le code de la branche `build-site`
(`node scripts/check.mjs` vert, passe navigateur complète). Voir aussi
`docs/apercu-desktop.png` / `docs/apercu-mobile.png` (description également
disponible ci-dessous).

## Déjà en place dans le code
- `lang="fr"` ; un seul `<h1>` ; hiérarchie h1→h2→h3→h2 sans saut.
  Confirmé en direct dans le navigateur : `H1 Vesper Lab`, `H2 Arrivée
  prévue à l'automne 2026`, `H3 En attendant le crépuscule`, `H2 Utilisez
  l'écho`.
- Landmarks `header`/`main`/`footer` ; skip-link fonctionnel, visible au
  focus (apparaît en haut à gauche uniquement quand elle reçoit le focus),
  amène bien le focus sur `<main id="main">` (`document.activeElement.id
  === 'main'` confirmé).
- `:focus-visible` 2 px + offset 2 px partout, jamais supprimé. Vérifié sur
  les 7 arrêts de tabulation (skip-link, GitHub, Buy Me a Coffee, LinkedIn,
  lien email texte, bouton « Écrivez-moi », lien footer « open-source ») et
  sur le lien « Revenir à l'accueil » de la page 404 — anneau sauge visible
  à chaque arrêt, aucun `outline:none` sans remplacement.
- Cibles ≥ 44×44 px (bouton, liens-icônes) — non re-mesuré en pixels dans
  cette passe (déjà couvert par `check.mjs` et les tâches précédentes),
  aucune régression visuelle observée.
- Liens de texte soulignés ; liens-icônes avec libellé `.visually-hidden` ;
  SVG décoratifs `aria-hidden` + `focusable="false"` — confirmé par
  `check.mjs` (3 libellés visually-hidden, 3 SVG décoratifs conformes).
- `contact@vesperlab.dev` en clair et cliquable + bouton — le `mailto:`
  n'est pas l'unique chemin. Les deux éléments pointent bien sur
  `mailto:contact@vesperlab.dev` (confirmé par script et par lecture directe
  du DOM).
- `prefers-reduced-motion` respecté (une seule animation, coupée) — la
  règle CSS existe (`style.css` lignes 159-166 et 301-303) et le
  mécanisme de base est confirmé : sans la préférence, `main` a
  `animation-name: lever` et `animation-duration: 0.5s` ; la règle
  `@media (prefers-reduced-motion: reduce)` force `animation-duration:
  0.01ms !important` globalement et `main#main{animation:none}`
  spécifiquement. **Non basculé en direct** : l'outil de pane navigateur
  disponible ici n'expose que l'émulation `prefers-color-scheme`
  (clair/sombre), pas `prefers-reduced-motion` — donc je n'ai pas pu
  déclencher la média-requête réelle et lire `getComputedStyle` sous cette
  préférence. À confirmer par Pauline via les DevTools (Rendering →
  Emulate CSS media feature prefers-reduced-motion) ou son propre
  navigateur/OS.
- Aucune ressource tierce ; aucun script. Confirmé : sur `/`, seules 6
  requêtes réseau ont été observées, toutes vers `localhost:8000`
  (document, `style.css`, 4 polices woff2). Zéro `fonts.gstatic.com`,
  zéro `fonts.googleapis.com`, zéro CDN.
- `prefers-color-scheme: light` émulé → la page ne change pas. Confirmé :
  avec l'émulation forcée sur « light » (`matchMedia('(prefers-color-scheme:
  light)').matches === true`), le fond reste `oklch(0.11 0.006 150)`
  (`--surface-page`), soit le même sombre qu'en mode normal.
- Reflow 320 px, zoom 200 % : vérifiés sans perte. À 320 px et 375 px,
  aucun défilement horizontal (`scrollWidth === clientWidth`), colonnes
  empilées. Colonnes côte à côte confirmées ≥ 720 px (idem-`top`, `left`
  différents à 900 px), empilées en dessous (700 px : `top` différents).
  À zoom 200 % (`document.documentElement.style.zoom='2'`), aucun
  débordement horizontal du document (`scrollWidth === clientWidth`),
  rien de tronqué ni superposé à l'écran.
- Contrastes mesurés (calcul WCAG relative luminance, sur les valeurs
  `oklch()` réellement calculées par le navigateur, converties en sRGB) :
  - corps de texte (`--text-body` `oklch(0.93 0.018 85)` →
    `rgb(237,231,219)`) sur `--surface-page` (`oklch(0.11 0.006 150)` →
    `rgb(3,5,4)`) : **16,60:1** — **PASS AAA** (seuil 7:1 largement dépassé).
  - lien sauge (`--link` = `--sage-500` = `--accent`, `oklch(0.83 0.055
    128)` → `rgb(189,207,169)`) sur `--surface-page` : **12,32:1** —
    **PASS** (seuil AA 4,5:1 largement dépassé, dépasse même AAA 7:1).
  - logo sauge (le `<path>` du SVG du logo utilise la même couleur
    `oklch(0.83 0.055 128)` que `--link`/`--accent`) sur `--surface-page` :
    **12,32:1** — **PASS** (seuil non-texte 3:1 largement dépassé).
  - Aucun ajustement de `--link` n'est nécessaire : le sauge est déjà très
    au-dessus du seuil de 4,5:1, contrairement à ce que la checklist de la
    tâche envisageait comme risque possible.

## À vérifier / trancher par Pauline
- Jugement final sur le ton et ambiance de l'accent sauge (contraste
  largement suffisant, donc c'est une question de goût/branding, pas de
  conformité).
- Formulation et ton des textes.
- Test lecteur d'écran réel (NVDA, VoiceOver) — non fait ici.
- Pertinence de l'`alt`/`<title>` du logo (« Vesper Lab ») en contexte.
- `prefers-reduced-motion` : le mécanisme CSS est en place et son
  fonctionnement de base (variables/valeurs) est vérifié, mais je n'ai pas
  pu émuler la média-requête elle-même dans le pane navigateur utilisé ici
  (seule l'émulation `prefers-color-scheme` y est exposée). À confirmer par
  Pauline via DevTools ou un test manuel OS (Réduire les animations dans
  les Préférences Système / Windows).
- `npx @axe-core/cli` n'a pas pu tourner dans cet environnement
  (ChromeDriver 152 requis, Chrome installé en 151 ; erreur `session not
  created`). Pas de retour axe-core disponible pour cette passe — à lancer
  par Pauline dans son propre environnement si elle le souhaite, ou via
  son outil d'audit habituel.
- Captures d'écran : je n'ai pas pu enregistrer `docs/apercu-desktop.png`
  ni `docs/apercu-mobile.png` en fichiers PNG réels — l'outil de pane
  navigateur disponible ici renvoie l'image affichée dans la conversation
  mais ne fournit aucun moyen d'écrire ces octets sur disque. Description
  de ce qui a été vu :
  - **Desktop (~1280×720)** : fond noir/anthume uniforme
    (`--surface-page`), logo chauve-souris stylisé en sauge clair centré
    en haut avec « VESPER • LAB » dessous, titre en deux lignes « L'obscurité
    ne ferme rien à qui sait *écouter*. » en crème, paragraphe d'intro en
    dessous, puis deux colonnes côte à côte : « Arrivée prévue à l'automne
    2026 » (gauche) et « Utilisez l'écho » (droite) avec les 3 icônes
    sociales (GitHub, Buy Me a Coffee, LinkedIn) et le bouton « Écrivez-moi »
    sous la colonne de droite.
  - **Mobile (375 px)** : même identité visuelle, colonnes empilées
    verticalement (logo → titre → intro → « Arrivée prévue… » → icônes
    sociales → « Utilisez l'écho » → bouton), aucun débordement horizontal,
    texte qui se réajuste proprement sur plusieurs lignes.

---

Résultat global : le code est prêt pour l'audit de Pauline et pour le
déploiement (tâche 9, étapes manuelles). Aucun défaut réel trouvé dans
cette passe — seulement des limites d'outillage de cette session
(émulation `prefers-reduced-motion`, capture PNG, axe-core CLI local),
listées ci-dessus pour que Pauline sache quoi re-vérifier de son côté si
elle le souhaite.
