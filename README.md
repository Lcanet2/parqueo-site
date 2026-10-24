# parqueo-site

Page de présentation de **Parqueo**, logiciel de helpdesk et de gestion de parc
informatique auto-hébergé : ticketing, inventaire, catalogue de demandes et
workflows d'automatisation visuels.

En ligne : <https://lcanet2.github.io/parqueo-site/>

## Contenu

| Fichier        | Rôle                                                        |
| -------------- | ----------------------------------------------------------- |
| `index.html`   | la page d'accueil (structure et données structurées)         |
| `styles.css`   | la charte, partagée par `index.html` et `services/`          |
| `services/`    | services, tarifs et licence commerciale — écrit à la main    |
| `install.sh`   | **copie** — servi sur `parqueo.fr/install.sh`, voir ci-dessous |
| `site.js`      | comportements partagés : thème, menu, parcours d'un ticket, offres, formulaire |
| `fonts/`       | Overpass (OFL) pour tout le texte, IBM Plex Mono pour le code |
| `img/`         | **généré** — captures et courte vidéo de l'application — voir « Captures » ; `baies-serveurs-*.webp` : photo NOIRLab/NSF/AURA/T. Slovinský, CC BY 4.0, créditée en pied de page |
| `og-image.png` | image de partage 1200×630 (réseaux sociaux, messageries)     |
| `og-image.svg` | la source de l'image ci-dessus — voir « Regénérer l'image »  |
| `favicon.svg`  | icône d'onglet                                              |
| `robots.txt`   | autorise l'indexation, déclare le sitemap                    |
| `sitemap.xml`  | **généré** — voir « Documentation » ci-dessous               |
| `docs/`        | **généré** — les trois documents en HTML                     |
| `docs/docs.css`| la charte des pages de documentation (écrite à la main)      |

Aucune dépendance, aucun script tiers, aucune requête vers un CDN.

## `install.sh`

Le fichier servi sur <https://parqueo.fr/install.sh> est une **copie** de celui
du dépôt du logiciel, qui reste la source :

```sh
cp ../parqueo/install.sh install.sh   # puis remettre le bandeau « COPIE »
```

Il permet l'installation en une commande, sans cloner le dépôt :

```sh
curl -fsSL https://parqueo.fr/install.sh | sh -s -- --domaine support.entreprise.fr
```

Pour vérifier que la copie n'a pas dérivé :

```sh
diff <(grep -v '^# │\|^# ┌\|^# └' install.sh) ../parqueo/install.sh
```

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

## Captures de l'application (`/img/`)

La section « L'application » et la bande de l'éditeur de workflow affichent de
vraies captures, converties en WebP depuis `docs/img/` (les PNG 2560 px servis
tels quels pesaient dix fois plus). Elles se régénèrent depuis ce dépôt :

```sh
npm install sharp
node -e "const s=require('sharp');(async()=>{for(const[n,w]of[\
['tableau-de-bord',[1600,800]],['liste-tickets',[1600,800]],['inventaire',[1600,800]],\
['detail-ticket',[1600,800]],['editeur-workflow',[1800,900]]])for(const x of w)\
await s('docs/img/'+n+'.png').resize({width:x,withoutEnlargement:true})\
.webp({quality:74,effort:6}).toFile('img/'+n+'-'+x+'.webp')})()"
```

Les deux largeurs alimentent le `srcset` de chaque image. Si vous changez une
capture, gardez les dimensions déclarées dans `width`/`height` à jour : elles
réservent la place avant le chargement et évitent que la page ne saute.

## Regénérer l'image de partage

`og-image.svg` est la source ; le PNG en est le rendu. Le SVG charge Overpass
depuis `fonts/` : il faut donc le rendre dans un navigateur, servi depuis la
racine du site, et en faire une capture à 1200×630 :

```sh
python3 -m http.server 8090 &
npx playwright screenshot --viewport-size=1200,630 http://localhost:8090/og-image.svg og-image.png
```

## Référencement

La page déclare des données structurées JSON-LD (`WebSite`, `Organization`,
`SoftwareApplication`, `FAQPage`), les balises Open Graph et Twitter Card, une
URL canonique et une hiérarchie de titres complète (un seul `h1`).

Après un changement de domaine, penser à déclarer le site dans la Google Search
Console et à y soumettre le sitemap.
