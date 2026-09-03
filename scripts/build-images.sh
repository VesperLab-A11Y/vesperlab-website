#!/usr/bin/env bash
# Génère les PNG du site depuis des sources SVG, avec rsvg-convert (Homebrew).
# Reproductible : relancer ce script régénère les 3 PNG à l'identique.
# Usage : bash scripts/build-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# Palette de la marque
SAGE="#BDCFA9"   # sauge (le trait du logo / de la chauve-souris)
INK="#0E0F0D"    # encre (le fond sombre)

# --- favicon-32.png : depuis le favicon détaillé, déjà en sauge, fond transparent ---
rsvg-convert -w 32 -h 32 assets/favicon.svg -o assets/favicon-32.png

# --- apple-touch-icon.png : même marque sur un carré ink opaque, 180x180 ---
rsvg-convert -w 180 -h 180 --background-color "$INK" assets/favicon.svg -o assets/apple-touch-icon.png

# --- og-image.png : 1200x630, logo sauge centré au-dessus de deux lignes de texte ---
# Le tracé du logo est repris tel quel de assets/vesperlab-logo.svg (viewBox 0 0 1006 974).
# L'attribut sed du brief supposait un ordre d'attributs précis ; on extrait le « d »
# de façon fiable avec node (le tracé ne doit PAS porter son propre fill, la couleur
# vient du <g fill="#BDCFA9"> parent).
LOGO_PATH=$(node -e 'const s=require("fs").readFileSync("assets/vesperlab-logo.svg","utf8");const m=s.match(/<path\b[^>]*\bd="([^"]+)"/);if(!m){console.error("tracé du logo introuvable");process.exit(1)}process.stdout.write(m[1])')

# Garde-fou : le tracé doit être non vide et commencer par une commande de chemin (m/M).
case "$LOGO_PATH" in
  [mM]*) : ;;
  *) echo "ERREUR : tracé du logo invalide (« ${LOGO_PATH:0:20}… »)" >&2; exit 1 ;;
esac

# Transformation du logo :
#   scale 0.30  -> 1006x974 devient ~302x292
#   translate x -> (1200 - 302) / 2 = 449  (centrage horizontal)
#   translate y -> 60                        (marge haute, le texte occupe le bas)
cat > assets/_og.svg <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="$INK"/>
  <g transform="translate(449,60) scale(0.30)" fill="$SAGE">
    <path fill-rule="nonzero" d="$LOGO_PATH"/>
  </g>
  <text x="600" y="470" text-anchor="middle" fill="$SAGE"
        font-family="Georgia, 'Times New Roman', serif" font-size="46" font-style="italic">
    L&#8217;obscurit&#233; ne ferme rien &#224; qui sait &#233;couter.
  </text>
  <text x="600" y="540" text-anchor="middle" fill="#D9D2C4"
        font-family="Arial, Helvetica, sans-serif" font-size="28">
    Laboratoire d&#8217;accessibilit&#233; num&#233;rique &#8212; Montr&#233;al
  </text>
</svg>
SVG

rsvg-convert -w 1200 -h 630 assets/_og.svg -o assets/og-image.png

echo "OK : favicon-32.png, apple-touch-icon.png, og-image.png"
