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

## Bascule sur un nom de domaine

Le script `configurer.sh` fait tout le travail dans le dépôt — URL canonique,
Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`, fichier `CNAME` :

```sh
./configurer.sh it-desk.fr contact@it-desk.fr
```

Le second argument est facultatif : sans lui, seule l'adresse du site change.
Le script est rejouable et affiche ensuite les étapes qui se passent en dehors
du dépôt (enregistrements DNS, HTTPS côté GitHub, Search Console).

## À personnaliser

- **Adresse de contact** : `contact@it-desk.fr` est un texte d'attente
  (8 occurrences dans `index.html`) — le script ci-dessus le remplace partout.
- **Date du sitemap** : `<lastmod>` est remis à jour à chaque exécution du
  script ; à ajuster à la main lors d'une refonte du contenu.

## Référencement

La page déclare des données structurées JSON-LD (`WebSite`, `Organization`,
`SoftwareApplication`, `FAQPage`), les balises Open Graph et Twitter Card, une
URL canonique et une hiérarchie de titres complète (un seul `h1`).

Après un changement de domaine, penser à déclarer le site dans la Google Search
Console et à y soumettre le sitemap.
