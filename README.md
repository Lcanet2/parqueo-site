# parqueo-site

Page de présentation de **Parqueo**, logiciel de helpdesk et de gestion de parc
informatique auto-hébergé : ticketing, inventaire, catalogue de demandes et
workflows d'automatisation visuels.

En ligne : <https://lcanet2.github.io/parqueo-site/>

## Contenu

| Fichier        | Rôle                                                        |
| -------------- | ----------------------------------------------------------- |
| `index.html`   | la page entière (structure, styles, données structurées)     |
| `fonts/`       | Archivo, Inter, IBM Plex Mono en woff2 (sous-ensemble latin) |
| `og-image.png` | image de partage 1200×630 (réseaux sociaux, messageries)     |
| `og-image.svg` | la source de l'image ci-dessus — voir « Regénérer l'image »  |
| `favicon.svg`  | icône d'onglet                                              |
| `robots.txt`   | autorise l'indexation, déclare le sitemap                    |
| `sitemap.xml`  | **généré** — voir « Documentation » ci-dessous               |
| `docs/`        | **généré** — les trois documents en HTML                     |
| `docs/docs.css`| la charte des pages de documentation (écrite à la main)      |

Aucune dépendance, aucun script tiers, aucune requête vers un CDN.

## Bascule sur un nom de domaine

Le script `configurer.sh` fait tout le travail dans le dépôt — URL canonique,
Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`, fichier `CNAME` :

```sh
./configurer.sh parqueo.fr contact@parqueo.fr
```

Le second argument est facultatif : sans lui, seule l'adresse du site change.
Le script est rejouable et affiche ensuite les étapes qui se passent en dehors
du dépôt (enregistrements DNS, HTTPS côté GitHub, Search Console).

## Documentation (`/docs/`)

Les pages de `docs/` **ne se modifient pas ici** : elles sont produites à partir
des trois markdown du dépôt du logiciel, qui restent la source unique.

```sh
cd ../parqueo/docs && npm install && npm run build:web
```

Le script `build-web.mjs` écrit `docs/index.html`, les trois
`docs/<slug>/index.html` et régénère `sitemap.xml` avec les cinq URL. Il attend
le dépôt du site rangé à côté de celui du logiciel ; sinon, donnez le chemin
dans `SITE_DIR`.

Seul `docs/docs.css` est écrit à la main — c'est la charte des pages générées,
calquée sur celle de `index.html`.

## À personnaliser

- **Adresse de contact** : `contact@parqueo.fr` est un texte d'attente
  (9 occurrences dans `index.html`, dont l'attribut `data-copy` du bouton
  « Copier ») — le script ci-dessus le remplace partout.
- **Date du sitemap** : `<lastmod>` est remis à jour à chaque exécution du
  script ; à ajuster à la main lors d'une refonte du contenu.

## Regénérer l'image de partage

`og-image.svg` est la source ; le PNG en est le rendu. Les polices ne sont pas
installées sur le système, il faut donc les décompresser depuis `fonts/` et les
donner à fontconfig :

```sh
npm install sharp wawoff2
node -e "const w=require('wawoff2'),f=require('fs');(async()=>{for(const[s,o]of\
[['archivo','Archivo'],['inter','Inter'],['plexmono','IBM Plex Mono']])\
f.writeFileSync('/tmp/pf/'+o+'.ttf',Buffer.from(await w.decompress(f.readFileSync('fonts/'+s+'.woff2'))))})()"
printf '<fontconfig><dir>/tmp/pf</dir><cachedir>/tmp/pf/c</cachedir></fontconfig>' > /tmp/pf/fonts.conf
FONTCONFIG_FILE=/tmp/pf/fonts.conf node -e "require('sharp')('og-image.svg',{density:144})\
.resize(1200,630,{fit:'fill'}).png({compressionLevel:9}).toFile('og-image.png')"
```

Le rendu se fait à 2× puis se réduit à 1200×630 — à 1× le texte bave.

## Référencement

La page déclare des données structurées JSON-LD (`WebSite`, `Organization`,
`SoftwareApplication`, `FAQPage`), les balises Open Graph et Twitter Card, une
URL canonique et une hiérarchie de titres complète (un seul `h1`).

Après un changement de domaine, penser à déclarer le site dans la Google Search
Console et à y soumettre le sitemap.
