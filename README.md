# it-desk-site

Page de présentation d'**IT Desk**, logiciel de helpdesk et de gestion de parc
informatique auto-hébergé : ticketing, inventaire, catalogue de demandes et
workflows d'automatisation visuels.

En ligne : <https://lcanet2.github.io/it-desk-site/>

## Contenu

| Fichier        | Rôle                                                        |
| -------------- | ----------------------------------------------------------- |
| `index.html`   | la page entière (structure, styles, données structurées)     |
| `fonts/`       | Archivo, Inter, IBM Plex Mono en woff2 (sous-ensemble latin) |
| `og-image.png` | image de partage 1200×630 (réseaux sociaux, messageries)     |
| `favicon.svg`  | icône d'onglet                                              |
| `robots.txt`   | autorise l'indexation, déclare le sitemap                    |
| `sitemap.xml`  | une seule URL, à mettre à jour à chaque refonte              |

Aucune dépendance, aucun script tiers, aucune requête vers un CDN.

## À personnaliser

- **Adresse de contact** : remplacer `contact@it-desk.fr` (8 occurrences dans
  `index.html`) par la vraie boîte mail.
- **Nom de domaine** : remplacer `https://lcanet2.github.io/it-desk-site/`
  partout dans `index.html`, `robots.txt` et `sitemap.xml`, puis ajouter un
  fichier `CNAME` à la racine contenant le domaine.
- **Date du sitemap** : mettre `<lastmod>` à jour lors des modifications de fond.

## Référencement

La page déclare des données structurées JSON-LD (`WebSite`, `Organization`,
`SoftwareApplication`, `FAQPage`), les balises Open Graph et Twitter Card, une
URL canonique et une hiérarchie de titres complète (un seul `h1`).

Après un changement de domaine, penser à déclarer le site dans la Google Search
Console et à y soumettre le sitemap.
