# Instructions pour Gemini CLI et Jules

Appliquer le fichier [AGENTS.md](./AGENTS.md) sans en omettre une règle. Le même texte est recopié ci-dessous pour les outils qui ne suivent pas les liens.

@./AGENTS.md

---

# Instructions pour les assistants

Ce fichier s’adresse à tout assistant (humain ou IA) qui modifie ce dépôt à la demande de François. François n’est pas développeur : les changements de contenu doivent passer par des fichiers qu’il peut relire, pas par du code inutile.

Le site public est https://blomig.github.io/patrimoine-sud-touraine/. Ce n’est pas le site officiel de la communauté de communes.

## Objectif

Cahier documentaire, en français, sur le patrimoine de la communauté de communes Loches Sud Touraine (Indre-et-Loire, EPCI SIREN 200071587, 67 communes). Sept rubriques : Bâtiments disparus, Bâtiments existants, Personnages, Événements historiques, Prochaines animations, Vie économique, Documents. Une page par commune, une carte du territoire, une recherche plein texte.

Une fiche = un fichier Markdown. Le texte ne dit que ce que les sources permettent de dire.

## Stack et commandes

- Astro 7, Node 22 ou plus
- Pagefind (recherche, produite pendant le build)
- Leaflet et tuiles OpenStreetMap
- Sveltia CMS dans `public/admin/` (édition GitHub, pas un serveur à part)

```bash
npm install
npm run dev      # http://localhost:4321/patrimoine-sud-touraine/
npm test
npm run build    # astro build puis pagefind
npm run preview
```

`npm test` vérifie des règles de dates, de thèmes et le GeoJSON du territoire. `npm run build` doit passer avant toute pull request.

## Arborescence

```text
contenu/
  site.yml                  design publié, titre, sous-titre (`{n}` = nombre de fiches hors agenda)
  themes.yml                libellés des rubriques et thèmes
  categories.yml            image de chaque rubrique, et nom affiché (champ titre)
  associations.yml          annuaire
  batiments-anciens-disparus/*.md
  batiments-anciens-existants/*.md
  personnes/*.md
  evenements-historiques/*.md
  agenda/*.md
  vie-economique/*.md       même schéma que les fiches patrimoine
  documents/*.md            fiches + type_document, date_document, cote, fonds, images
public/data/
  communes-loches-sud-touraine.geojson   67 communes
  indre-et-loire.geojson                 contour du département
public/media/categories/    images d’illustration déjà téléchargées
public/admin/               CMS (config.yml, index.html)
src/pages/                  pages du site
src/styles/global.css       l’apparence du site
src/content.config.ts       schéma Zod des fiches
astro.config.mjs            site et chemin de base
.github/workflows/pages.yml build, tests, déploiement
```

Les pages de communes ne sont pas des fichiers à créer à la main. Elles sont générées à partir du GeoJSON et des fiches dont le code INSEE correspond.

## Schéma des fiches

Le schéma est dans `src/content.config.ts`. Le nom du fichier et le champ `id` sont identiques, en minuscules, chiffres et tirets : `bournan-eglise-saint-martin.md` et `id: "bournan-eglise-saint-martin"`.

Champs communs :

| Champ | Règle |
| --- | --- |
| `categorie` | Exactement le nom du dossier. |
| `themes` | Liste d’`id` présents dans `themes.yml` pour cette catégorie. Un id inconnu ne casse pas le build, mais la fiche l’affiche comme « thème non répertorié ». |
| `commune` | Nom officiel, comme dans le GeoJSON. |
| `insee` | Code INSEE entre guillemets (`"37132"`). C’est lui qui rattache la fiche à la page de la commune. |
| `latitude`, `longitude` | Degrés décimaux, les deux ensemble, ou `null`. |
| `periode` | Libellé rédigé, affiché tel quel. |
| `date_debut`, `date_fin` | Chaîne ou `null`. Formes acceptées : `973`, `-2400`, `1429-05`, `2026-12-12`. |
| `merimee` | Code de notice (`PA00097821`) ou `null`. Inutile pour l’agenda. |
| `lieu` | Surtout pour l’agenda. `null` si on ne le connaît pas. |
| `sources` | Liste de `{ titre, url }`. Au moins une source réelle. |
| `image` | `null`, ou `{ url, page_commons, auteur, licence }`. `url` est la page du fichier (Wikimedia ou autre source libre). |
| `statut` | Voir plus bas. |

Le corps Markdown, sous le second `---`, est le texte. Pas de champ `resume` : les listes de fiches utilisent le début du texte. Les listes d’agenda, elles, n’affichent que la date, le titre et le lieu. Le reste est sur la page de l’animation.

Statuts acceptés par le schéma : `à vérifier`, `à valider`, `validé`, `publié`.

- Fiche de patrimoine (bâtiment, personne, événement historique) : partir de `à vérifier`. `validé` seulement après relecture de François.
- Animation : partir de `à valider`. Elle s’affiche comme les autres tant que `date_fin` (ou `date_debut`) n’est pas passée. Le statut n’est pas montré sur le site, ni indexé par la recherche. Une animation terminée disparaît des listes au build suivant, le fichier reste.

Exemple minimal, à adapter. Ne pas le copier tel quel dans `contenu/` : les faits et l’URL sont des emplacements.

```yaml
---
id: "bournan-exemple-a-remplacer"
titre: "Titre vérifiable"
categorie: "batiments-anciens-existants"
themes:
  - "eglises-et-chapelles"
commune: "Bournan"
insee: "37032"
latitude: null
longitude: null
periode: "XIXe siècle"
date_debut: "1850"
date_fin: null
merimee: null
statut: "à vérifier"
sources:
  - titre: "Titre exact de la source"
    url: "https://exemple.fr/source-consultée"
image: null
---

Paragraphes qui reformulent uniquement ce que la source permet d’affirmer.
Si une date ou un nom manque, l’écrire, ne pas le combler.
```

Pour une animation, `categorie` vaut `agenda`, le fichier est dans `contenu/agenda/`, et `statut` vaut `à valider`.

### Vie économique

Dossier `contenu/vie-economique/`. `categorie: "vie-economique"`. Même champs que les fiches de patrimoine. Le nom public se change dans `contenu/categories.yml`, champ `titre` de la clé `vie-economique` (aujourd’hui « Vie économique »). Ne pas renommer le dossier ni l’identifiant.

### Documents

Dossier `contenu/documents/`. `categorie: "documents"`. Même champs que les fiches, plus :

| Champ | Contenu |
| --- | --- |
| `type_document` | Optionnel. Une de ces valeurs exactes : `cadastre`, `carte`, `plan`, `photo`, `carte postale`, `archive`, `autre`. |
| `date_document` | Optionnel. Même forme que `date_debut` : `1832`, `1832-04` ou `1832-04-12`. `null` si inconnue. |
| `cote` | Optionnel. Cote d’archives, ou `null`. |
| `fonds` | Optionnel. Nom du fonds, ou `null`. |
| `images` | Galerie. Liste de `{ src, legende, credit }`. `src` est un chemin du dépôt (`/media/documents/fichier.jpg`) ou une adresse web. Liste vide ou absente s’il n’y a pas de galerie. |

Le champ `image` reste l’image d’en-tête, facultative. `images` est la galerie affichée sur la fiche.

## Ajouter du contenu

### Une fiche

1. Choisir le dossier selon la rubrique.
2. Créer le Markdown avec l’`id` égal au nom de fichier.
3. Remplir le schéma ci-dessus. `themes` doit déjà exister dans `themes.yml`.
4. `npm test` puis `npm run build`.

### Une commune

Les 67 communes ont déjà une page. On ne crée pas de fichier de commune. Pour qu’une fiche y apparaisse, `insee` doit être le code du GeoJSON (`public/data/communes-loches-sud-touraine.geojson`) et `commune` le nom officiel (`nom`). Une commune sans fiche affiche « Fiches à venir ». Ne pas ajouter une commune hors de l’EPCI, et ne pas redessiner les contours sans une source géographique.

### Un thème

Dans `contenu/themes.yml`, sous la bonne catégorie, ajouter :

```yaml
- id: petit-patrimoine
  libelle: Petit patrimoine
```

L’`id` est stable : minuscules et tirets. On peut changer le `libelle` et l’ordre de la liste. Ne pas renommer un `id` déjà utilisé par des fiches.

### Un événement

Fichier dans `contenu/agenda/`. `statut: "à valider"` par défaut. Renseigner `date_debut`, `date_fin` si l’événement dure, et `lieu` quand la source le donne. Sans lieu connu : `lieu: null` ; la liste affiche alors la commune. Ne pas mettre le résumé dans la liste : il est dans le corps, lu sur la page de détail.

### Une association

Ajouter un bloc dans `contenu/associations.yml` sans réécrire les autres :

```yaml
- id: identifiant-stable
  nom: Nom public
  commune: Bournan
  insee: "37032"
  site: null
  notes: >
    Ce que les sources disent, en quelques phrases.
  sources:
    - https://exemple.fr/page-consultee
```

`site` reste `null` si aucun site officiel n’a été trouvé. Ne pas inventer d’adresse, de téléphone ou de nom de responsable.

### Une image de rubrique

`contenu/categories.yml` : `legende`, `fichier` (chemin dans `public/`, par exemple `/media/categories/photo.jpg`), `url` (page Wikimedia), `auteur`, `licence`. François peut aussi le faire dans l’administration, fichier « Illustrations des rubriques ».

## Design et styles

Le site n’a plus qu’une apparence, dans `src/styles/global.css` : la revue en bleu marine (`#1f3a6b` pour le titre, les pavés et le filet ; Prochaines animations en bleu roi `#1a4fbf` ; cadres de la carte, des rubriques et de l’agenda en orange `--orange`, `#b1460a`). Les polices Source Serif 4 et Source Sans 3 sont importées dans `src/layouts/Base.astro`. Ne pas ajouter de routeur de transitions : le retour arrière doit recharger la page. Ne pas réintroduire un sélecteur de design (`?apercu=`, page `/designs/`) sans demande.

## Règles imposées

- Ne jamais inventer un fait, une date, un lieu, un nom ou un chiffre. Si la source est muette, l’écrire (« non précisé dans la source ») ou laisser le champ `null`.
- Chaque fiche a au moins une source consultée, avec son titre et son URL. L’annuaire aussi.
- Ne jamais recopier un article de presse, une page d’office de tourisme ou une notice. Reformuler en peu de phrases, et s’arrêter où la source s’arrête (y compris si la suite est derrière un abonnement).
- Statut par défaut : `à vérifier` pour le patrimoine, `à valider` pour l’agenda. Ne pas passer à `validé` ou `publié` sans l’accord de François. Le champ reste dans le schéma et le CMS. Il n’apparaît pas sur le site public.
- Images : uniquement des fichiers libres (Wikimedia Commons ou équivalent), avec auteur et licence, ou des photos prises par François avec son accord explicite. Télécharger une copie de taille raisonnable dans `public/media/` et garder l’URL d’origine. Pas d’image dont les droits sont inconnus.
- Photos et documents provenant du blog valleedelariolle.fr : le crédit d’image (`auteur` de l’image principale, `credit` des éléments de galerie, et les mêmes champs dans `categories.yml` ou ailleurs) est exactement « Archives privées ». Ne pas écrire « Vallée de la Riolle » comme crédit d’image. Une mention du blog comme source textuelle d’une fiche (lien vers l’article) reste inchangée, de même que les mentions géographiques de la vallée de la Riolle.
- Quand le titre d’une fiche désigne quelque chose qui est illustré dans l’article source, l’image principale (`image`) doit montrer ce sujet. Si l’article ou la galerie contient une image plus directement liée au titre, la promouvoir en image principale et conserver l’ancienne dans la galerie `images`. Pour les fiches Personnages, la règle du portrait reste prioritaire : l’image principale est de préférence un portrait de la personne (photographie, gravure), et non un lieu.
- Pas d’information personnelle sur une personne vivante (adresse, téléphone, état de santé, vie privée). Un nom public d’association ou d’organisateur cité par la source peut rester. En cas de doute, ne pas l’écrire.
- Ne pas présenter le site comme le site de la communauté de communes, d’une mairie ou d’une association. La page « À propos » le dit déjà.

## Workflow Git

- Partir de `main` à jour. Branche dédiée, commits lisibles.
- Ne pas committer sur `main`.
- Ouvrir une pull request. `npm test` et `npm run build` doivent passer en local et dans la CI (workflow Pages).
- La CI sur une pull request lance le build. Le déploiement ne part que lorsque la branche est fusionnée dans `main` (GitHub Pages, mode Actions).
- Fusionner seulement si la demande le dit et si la CI est verte.

## Pièges connus

- Le site est servi sous `/patrimoine-sud-touraine/`. Tous les liens internes passent par `withBase()` (`src/lib/urls.ts`). Un `href="/communes/"` sans ce préfixe est une 404 sur GitHub Pages. Les fichiers GeoJSON et les images de `public/` aussi.
- `npm run dev` et `npm run preview` utilisent ce même préfixe.
- Pagefind enregistre des URL sans le préfixe ; l’interface les recolle à partir de l’emplacement du script. Ne pas casser `data-base` ni `BASE_URL`.
- Un nom de domaine propre remplacera plus tard `blomig.github.io`. Il faudra alors, ensemble : `site` et `base: '/'` dans `astro.config.mjs`, puis `site_url`, `display_url` et `public_folder` dans `public/admin/config.yml`.
- La carte des communes (accueil et `/communes/`) est fixe : ni zoom, ni déplacement, ni boutons. Le cadre est celui des 67 communes, sans tuiles OpenStreetMap et sans le contour de l’Indre-et-Loire. Le conteneur `.plan-communes` a un ratio carré. La carte des fiches (`/carte/`) garde, elle, les tuiles. Après un changement, vérifier contours, survol et clic, sur grand écran et sur écran étroit.
- L’administration (`/admin`) parle au dépôt GitHub. Elle n’est pas branchée à un proxy OAuth : François s’y connecte avec un jeton personnel. Ne pas en créer un, et ne pas le déposer dans le dépôt.
