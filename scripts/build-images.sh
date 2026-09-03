#!/usr/bin/env bash
# Génère les PNG du site depuis des sources SVG, avec rsvg-convert (Homebrew).
# Reproductible : relancer ce script régénère les 3 PNG à l'identique.
# Usage : bash scripts/build-images.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# Palette de la marque
SAGE="#BDCFA9"   # sauge (le trait du logo / de la chauve-souris)
INK="#0E0F0D"    # encre (le fond sombre)

# Petit utilitaire : extrait la valeur de l'attribut « d » du premier <path> d'un SVG.
# (le « d » seul ne porte jamais de fill ; la couleur est posée par l'enrobage)
extract_d() {
  node -e 'const s=require("fs").readFileSync(process.argv[1],"utf8");const m=s.match(/<path\b[^>]*\bd="([^"]+)"/);if(!m){console.error("tracé introuvable dans "+process.argv[1]);process.exit(1)}process.stdout.write(m[1])' "$1"
}

# Garde-fou : un tracé doit être non vide et commencer par une commande (m/M).
assert_path() {
  case "$1" in
    [mM]*) : ;;
    *) echo "ERREUR : tracé invalide (« ${1:0:20}… »)" >&2; exit 1 ;;
  esac
}

# Tracés sources
F16_PATH=$(extract_d assets/favicon-16.svg)   # silhouette pleine, art sur carré 300x300
assert_path "$F16_PATH"
LOGO_PATH=$(extract_d assets/vesperlab-logo.svg)  # logo complet, viewBox 0 0 1006 974
assert_path "$LOGO_PATH"

# --- favicon-32.png : silhouette pleine en sauge, fond transparent, petite marge ---
# viewBox -12 -12 324 324 = l'art de 300 unités avec ~12 unités de marge (~4 %).
cat > assets/_fav32.svg <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 324 324" width="32" height="32">
  <path fill="$SAGE" fill-rule="nonzero" d="$F16_PATH"/>
</svg>
SVG
rsvg-convert -w 32 -h 32 assets/_fav32.svg -o assets/favicon-32.png

# --- apple-touch-icon.png : silhouette sauge encartée sur fond ink opaque, 180x180 ---
# viewBox -44 -44 388 388 = l'art de 300 unités avec ~44 unités de marge tout autour (~13 %).
cat > assets/_apple.svg <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-44 -44 388 388" width="180" height="180">
  <rect x="-44" y="-44" width="388" height="388" fill="$INK"/>
  <path fill="$SAGE" fill-rule="nonzero" d="$F16_PATH"/>
</svg>
SVG
rsvg-convert -w 180 -h 180 assets/_apple.svg -o assets/apple-touch-icon.png

# --- og-image.png : 1200x630, logo sauge centré au-dessus de deux lignes de texte ---
# Le tracé du logo est repris tel quel de assets/vesperlab-logo.svg (viewBox 0 0 1006 974).
# L'attribut sed du brief supposait un ordre d'attributs précis ; on extrait le « d »
# de façon fiable avec node (le tracé ne doit PAS porter son propre fill, la couleur
# vient du <g fill="#BDCFA9"> parent).
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

# Nettoyage des SVG d'enrobage (matière au rendu, gitignorés)
rm -f assets/_og.svg assets/_apple.svg assets/_fav32.svg

echo "OK : favicon-32.png, apple-touch-icon.png, og-image.png"
