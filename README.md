# Vesper Lab

## English

Landing page for **Vesper Lab**, a digital accessibility studio in Montréal. A
single "coming soon" page for now; the services open in fall 2026.

Static HTML and CSS, no dependencies, no build step. Self-hosted Noto fonts,
**no third-party resources**.

### Accessibility

Targets WCAG 2.2 AA, AAA on body text. Semantic HTML, one dark theme, visible
focus, `prefers-reduced-motion` respected, nothing loaded from a third party.

### Deployment

Served by Cloudflare (Workers static assets), custom domain
<https://vesperlab.dev/>.

```bash
npx wrangler deploy
```

### Structure

| Path | Role |
|---|---|
| `index.html` | The page |
| `404.html` | Not-found page |
| `style.css` | Design tokens and styles |
| `assets/` | Favicons, social icons, logo, Open Graph image, self-hosted fonts |
| `scripts/` | `check.mjs` (content checks), `fetch-fonts.mjs`, `build-images.sh` |
| `_headers`, `robots.txt`, `sitemap.xml` | Static hosting config |
| `wrangler.jsonc` | Cloudflare deploy config |

### License

Code under the [MIT license](LICENSE). The logo and the "Vesper Lab" name are not
covered by it.

### Contact

Found an accessibility barrier or a bug? Open an issue or write to
contact@vesperlab.dev.

## Français

Page vitrine de **Vesper Lab**, atelier d'accessibilité numérique à Montréal. Une
simple page « bientôt en ligne » pour l'instant ; les services ouvrent à
l'automne 2026.

HTML et CSS statiques, sans dépendance ni étape de build. Polices Noto
auto-hébergées, **aucune ressource tierce**.

### Accessibilité

Cible WCAG 2.2 AA, AAA sur le texte courant. HTML sémantique, thème sombre
unique, focus visible, `prefers-reduced-motion` respecté, rien chargé depuis un
tiers.

### Déploiement

Servi par Cloudflare (Workers static assets), domaine <https://vesperlab.dev/>.

```bash
npx wrangler deploy
```

### Structure

| Chemin | Rôle |
|---|---|
| `index.html` | La page |
| `404.html` | Page d'erreur 404 |
| `style.css` | Jetons de design et styles |
| `assets/` | Favicons, icônes sociales, logo, image Open Graph, polices auto-hébergées |
| `scripts/` | `check.mjs` (contrôles de contenu), `fetch-fonts.mjs`, `build-images.sh` |
| `_headers`, `robots.txt`, `sitemap.xml` | Config d'hébergement statique |
| `wrangler.jsonc` | Config de déploiement Cloudflare |

### Licence

Code sous [licence MIT](LICENSE). Le logo et la marque « Vesper Lab » n'en font
pas partie.

### Contact

Une barrière d'accessibilité ou un bug ? Ouvre une issue ou écris à
contact@vesperlab.dev.
