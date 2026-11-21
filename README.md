# Patrimoine du Sud Touraine

Cahier documentaire statique sur le patrimoine de la communauté de communes Loches Sud Touraine (Indre-et-Loire). Ce n’est pas le site officiel de la collectivité.

Adresse prévue : <https://blomig.github.io/patrimoine-sud-touraine/>. Un nom de domaine propre pourra remplacer cette adresse plus tard.

La démonstration est prévue le 11 décembre 2026. Le corpus actuel est un jeu pilote : 59 fiches sur quatre rubriques, 12 animations, les thèmes et l’annuaire. Cinq communes sont couvertes en priorité : Loches, La Chapelle-Blanche-Saint-Martin, Bournan, Sepmes et Civray-sur-Esves. Les fiches sont au statut « à vérifier ». Les animations « à valider » s’affichent avec la mention « en attente de validation » tant que leur date n’est pas passée.

## Stack

- [Astro](https://astro.build/) 7, site entièrement statique
- Fiches en Markdown, validées par une content collection (Zod)
- Recherche dans le navigateur avec [Pagefind](https://pagefind.app/)
- Carte [Leaflet](https://leafletjs.com/) et tuiles OpenStreetMap
- Administration [Sveltia CMS](https://github.com/sveltia/sveltia-cms), édition directe dans le dépôt GitHub
- Publication par GitHub Actions (`actions/deploy-pages`)

Les trois apparences (revue savante, carnet de voyage, musée) sont le même site. Un seul réglage choisit celle qui est publiée.

## Arborescence

```text
contenu/
  site.yml                      design publié et titre
  themes.yml                    libellés des rubriques et des thèmes
  associations.yml              annuaire
  batiments-anciens-disparus/   une fiche = un fichier .md
  batiments-anciens-existants/
  personnes/
  evenements-historiques/
  agenda/
public/admin/                   Sveltia CMS (config.yml + index.html)
src/                            pages, styles, schéma
.github/workflows/pages.yml     construction et publication
```

## Ajouter ou modifier une fiche

On ne touche pas au code. On ajoute un fichier Markdown dans le dossier de la rubrique, ou on passe par `/admin` une fois la connexion réglée.

Le nom du fichier et le champ `id` doivent être identiques : `loches-porte-picoys.md` et `id: "loches-porte-picoys"`. Minuscules, chiffres et tirets.

Exemple minimal, calqué sur les fiches déjà présentes :

```yaml
---
id: "bournan-exemple"
titre: "Titre lisible"
categorie: "batiments-anciens-existants"
themes:
  - "petit-patrimoine"
commune: "Bournan"
insee: "37032"
latitude: 47.08
longitude: 0.72
periode: "XIXe siècle"
date_debut: "1850"
date_fin: null
merimee: null
statut: "à vérifier"
sources:
  - titre: "Titre de la source"
    url: "https://exemple.fr/source"
image: null
---

Texte détaillé. Rester dans ce que les sources disent.
```

Champs utiles :

| Champ | Rôle |
| --- | --- |
| `categorie` | Doit être le nom du dossier. |
| `themes` | Liste d’identifiants définis dans `themes.yml`. Un identifiant supprimé n’empêche pas le site de se construire : la fiche reste en ligne, avec la mention « thème non répertorié ». |
| `latitude`, `longitude` | Degrés décimaux, les deux ensemble, ou `null`. Sans coordonnées, la fiche n’est pas sur la carte. |
| `date_debut`, `date_fin` | Chaînes : année (`973`, `-2400`), année-mois (`1429-05`) ou date (`2026-12-12`). `null` si on ne sait pas. Elles servent à la frise et, pour l’agenda, à masquer ce qui est terminé. |
| `periode` | Libellé rédigé, affiché tel quel. |
| `merimee` | Code de notice, par exemple `PA00097821`, ou `null`. Absent pour l’agenda. |
| `insee` | Code communal, entre guillemets pour garder les zéros. |
| `image` | Un seul objet (`url`, `page_commons`, `licence`, `auteur`) ou `null`. Uniquement une image libre. |
| `sources` | Liste de `{ titre, url }`. |
| `statut` | `à vérifier` ou `validé` pour une fiche. `à valider` ou `publié` pour une animation. |
| `lieu` | Animations seulement. |

Le corps du fichier, sous les `---`, est le texte de la fiche. Il ne faut pas le réécrire à la légère : c’est le corpus.

Pour une animation, le dossier est `contenu/agenda/`, la catégorie `agenda`, et le statut de départ `à valider`. Elle apparaît tout de même, avec la mention « en attente de validation », jusqu’au dernier jour de `date_fin` (ou de `date_debut` s’il n’y a pas de fin). Le lendemain, elle disparaît des listes au prochain build. Une animation `publié` s’affiche sans cette mention.

## Thèmes et annuaire

`contenu/themes.yml` regroupe, par rubrique, un libellé et une liste de thèmes (`id`, `libelle`). L’ordre de la liste est l’ordre affiché. On peut renommer un libellé, réordonner ou retirer un thème. On évite de changer un `id` déjà cité par des fiches : le lien se perd, mais le build continue.

`contenu/associations.yml` est l’annuaire. Les champs vides restent `null` plutôt que d’être inventés. Les sources y sont de simples adresses web.

`contenu/categories.yml` donne l’image d’illustration de chaque rubrique (légende, fichier, page Wikimedia, auteur, licence). On la change dans l’administration, fichier « Illustrations des rubriques », sans toucher au code. L’image apparaît sur l’accueil et en tête de la rubrique.

La page Communes affiche les contours des 67 communes (EPCI 200071587), stockés dans `public/data/communes-loches-sud-touraine.geojson`. Le fichier vient de geo.api.gouv.fr et a été simplifié pour l’affichage : le site ne rappelle pas l’API à chaque visite.

## Changer de design

Le design publié est la valeur `design` de `contenu/site.yml` :

- `revue` — revue savante, empattements, tuffeau et ardoise
- `carnet` — carnet de voyage, papier chaud, cartes
- `musee` — salle claire, grands titres sans empattement

C’est le seul réglage. On peut le modifier dans le fichier ou dans l’administration, rubrique « Design publié ».

La page [Quatre designs](https://blomig.github.io/patrimoine-sud-touraine/designs/) montre les quatre côte à côte. « Parcourir le site avec ce design » ne change que le navigateur de la personne qui clique. Les autres visiteurs continuent de voir la valeur de `site.yml`. « Revenir au design publié » efface ce choix local.

## Administration

L’interface est sur `/admin` (donc `/patrimoine-sud-touraine/admin/` tant que le site est sur GitHub Pages). Elle est en français dans les formulaires. Rien n’a été déployé chez un prestataire tiers.

Il reste à autoriser l’écriture dans le dépôt. Deux voies, une seule suffit.

### Jeton d’accès personnel (le plus simple pour François)

1. Sur GitHub : Settings → Developer settings → Personal access tokens → Fine-grained token.
2. Dépôt : `blomig/patrimoine-sud-touraine` seulement.
3. Permission : Contents, en lecture et écriture.
4. Ouvrir `/admin`, choisir la connexion par jeton, coller le jeton.
5. Le garder pour soi. Il n’est pas écrit dans le dépôt.

Chaque enregistrement crée un commit sur `main`. Le workflow republie le site.

### Proxy OAuth, si l’on ne veut pas de jeton

Sveltia sait déléguer la connexion GitHub à un petit proxy. Un Cloudflare Worker (ou équivalent) suffit. On ne l’a pas mis en place. Le jour où il existe, ajouter dans `public/admin/config.yml`, sous `backend` :

```yaml
base_url: https://votre-worker.exemple.org
auth_endpoint: auth
```

Le mode d’emploi du worker est celui de Sveltia CMS (« GitHub backend » / OAuth). Tant que ces deux lignes sont absentes, l’écran propose le jeton.

## Pages

- Accueil : territoire, cinq rubriques, communes pilotes, prochaines animations
- Liste, thèmes et frise pour chaque rubrique hors agenda
- Fiche : sources, crédit d’image, badge « à vérifier » ou « en attente de validation »
- Une page par commune citée
- Carte des fiches qui ont des coordonnées
- Recherche plein texte
- Annuaire
- À propos, qui rappelle que le site n’est pas officiel
- Designs

## Construire en local

```bash
npm install
npm test
npm run build
npm run preview
```

Le site local est servi sous `/patrimoine-sud-touraine/`, comme sur GitHub Pages.

## Publication

Le workflow `.github/workflows/pages.yml` lance les tests et le build à chaque pull request, et publie la branche `main` avec `actions/upload-pages-artifact` puis `actions/deploy-pages`.

Réglage manuel, une fois, dans le dépôt GitHub : Settings → Pages → Build and deployment → Source : **GitHub Actions**. Sans cela, le workflow de déploiement n’a pas d’environnement Pages.

Quand un nom de domaine remplacera `blomig.github.io/patrimoine-sud-touraine`, il faudra mettre `base` à `'/'` et `site` au nouveau domaine dans `astro.config.mjs`, puis aligner `site_url`, `display_url` et `public_folder` dans `public/admin/config.yml`.
