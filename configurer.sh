#!/usr/bin/env bash
# Bascule le site sur un nom de domaine (et, si fourni, sur la vraie adresse de
# contact). Met à jour l'URL canonique, l'Open Graph, le JSON-LD, robots.txt,
# sitemap.xml, puis écrit le fichier CNAME attendu par GitHub Pages.
#
#   ./configurer.sh it-desk.fr
#   ./configurer.sh www.it-desk.fr contact@it-desk.fr
#
# Le script est rejouable : il repart toujours de l'URL déclarée dans la balise
# canonical, quelle qu'elle soit.

set -euo pipefail

domaine="${1:-}"
email="${2:-}"

if [ -z "$domaine" ]; then
  echo "usage : $0 <domaine> [adresse-email]" >&2
  echo "exemple : $0 it-desk.fr contact@it-desk.fr" >&2
  exit 1
fi

cd "$(dirname "$0")"

# Tolère qu'on colle une URL complète plutôt qu'un domaine nu.
domaine="${domaine#https://}"
domaine="${domaine#http://}"
domaine="${domaine%/}"

url_actuelle="$(sed -n 's/.*rel="canonical" href="\([^"]*\)".*/\1/p' index.html)"
url_nouvelle="https://${domaine}/"

if [ -z "$url_actuelle" ]; then
  echo "erreur : balise canonical introuvable dans index.html" >&2
  exit 1
fi

if [ "$url_actuelle" = "$url_nouvelle" ]; then
  echo "· URL déjà réglée sur $url_nouvelle"
else
  compte=0
  for fichier in index.html robots.txt sitemap.xml; do
    n="$(grep -c -F "$url_actuelle" "$fichier" || true)"
    compte=$((compte + n))
    sed -i "s|${url_actuelle}|${url_nouvelle}|g" "$fichier"
  done
  echo "· URL : $url_actuelle → $url_nouvelle  ($compte remplacements)"
fi

if [ -n "$email" ]; then
  mail_actuel="$(sed -n 's/.*"email": "\([^"]*\)".*/\1/p' index.html | head -1)"
  if [ "$mail_actuel" = "$email" ]; then
    echo "· Adresse déjà réglée sur $email"
  else
    n="$(grep -c -F "$mail_actuel" index.html || true)"
    sed -i "s|${mail_actuel}|${email}|g" index.html
    echo "· Adresse : $mail_actuel → $email  ($n remplacements)"
  fi
fi

sed -i "s|<lastmod>.*</lastmod>|<lastmod>$(date +%F)</lastmod>|" sitemap.xml
echo "· sitemap.xml daté du $(date +%F)"

printf '%s\n' "$domaine" > CNAME
echo "· CNAME écrit : $domaine"

cat <<INFO

Il reste à faire, en dehors du dépôt :

  1. DNS — chez votre registrar
     · domaine racine (it-desk.fr) : quatre enregistrements A
         185.199.108.153   185.199.109.153   185.199.110.153   185.199.111.153
       et, si vous gérez l'IPv6, quatre AAAA
         2606:50c0:8000::153   2606:50c0:8001::153
         2606:50c0:8002::153   2606:50c0:8003::153
     · sous-domaine (www.it-desk.fr) : un CNAME vers lcanet2.github.io

  2. GitHub — Settings › Pages, saisir le domaine, attendre la vérification,
     puis cocher « Enforce HTTPS » une fois le certificat émis (quelques minutes).

  3. Référencement — déclarer le domaine dans la Google Search Console et y
     soumettre https://${domaine}/sitemap.xml

Ensuite : git add -A && git commit -m "Bascule sur ${domaine}" && git push
INFO
