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
