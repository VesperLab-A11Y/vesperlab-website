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
