import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { agendaVisibleSi } from '../src/lib/agenda.ts';
import { codeMerimee, codePalissy, codeWikidata, liensIdentifiants } from '../src/lib/identifiants.ts';
import { jsonLdFiche, jsonLdSite, typeSchema } from '../src/lib/jsonld.ts';
import { versCsv, ligneOuverte } from '../src/lib/export-ouvert.ts';
import { cleDebut, cleFin, extraireHoraire, formatDateSouple, formatPlage, periodeTerminee } from '../src/lib/dates.ts';
import { appliquerNombre, nombreFrancais } from '../src/lib/nombres.ts';
import { lienTouteLaRubrique, slugRubrique } from '../src/lib/categories.ts';
import { slugifier } from '../src/lib/slug.ts';
import { resoudreThemes } from '../src/lib/themes.ts';

const catalogue = [
  { id: 'eglises-et-chapelles', libelle: 'Églises et chapelles' },
  { id: 'chateaux-et-forteresses', libelle: 'Châteaux et forteresses' },
];

test('les dates partielles et négatives restent lisibles', () => {
  assert.equal(formatDateSouple('0973'), '973');
  assert.equal(formatDateSouple('1429-05'), 'mai 1429');
  assert.equal(formatDateSouple('1508-05-27'), '27 mai 1508');
  assert.equal(formatDateSouple('-2400'), '2400 av. J.-C.');
  assert.equal(formatPlage('1429-05', '1429-05'), 'mai 1429');
  assert.equal(formatPlage('1358', '1359'), '1358 – 1359');
});

test('l’horaire d’une animation est repris tel qu’il est écrit, ou omis', () => {
  assert.equal(extraireHoraire('Samedi 16 janvier 2027, de 20 h 30 à 23 h 30, Le Forum'), 'de 20 h 30 à 23 h 30');
  assert.equal(extraireHoraire('Vendredi 27 novembre 2026, à 20 h, bibliothèque de Perrusson'), 'à 20 h');
  assert.equal(extraireHoraire('26 novembre 2026, à partir de 18 h'), 'à partir de 18 h');
  assert.equal(extraireHoraire('ouverture en soirée jusqu’à 20 h'), 'jusqu’à 20 h');
  assert.equal(
    extraireHoraire('16 janvier 2027, de 10 h 30 à 12 h 30 puis de 14 h 30 à 18 h'),
    'de 10 h 30 à 12 h 30, de 14 h 30 à 18 h',
  );
  assert.equal(extraireHoraire('27 novembre 2026'), null);
  assert.equal(extraireHoraire(null), null);
});

test('le tri chronologique place la préhistoire avant le XIe siècle', () => {
  assert.ok(cleDebut('-2400') < cleDebut('0973'));
  assert.ok(cleDebut('0973') < cleDebut('1429-05'));
  assert.ok(cleDebut('1429-05') < cleDebut('1429-06'));
  assert.equal(cleFin('2026'), 20261231);
  assert.equal(cleFin('2026-02'), 20260228);
  assert.equal(cleFin('2026-12-12'), 20261212);
});

test('un thème retiré du catalogue ne fait pas échouer la résolution', () => {
  const resultat = resoudreThemes(['theme-retire', 'chateaux-et-forteresses'], catalogue);
  assert.deepEqual(
    resultat.connus.map((theme) => theme.id),
    ['chateaux-et-forteresses'],
  );
  assert.deepEqual(resultat.inconnus, ['theme-retire']);
});

test('l’agenda montre « à valider » tant que la date n’est pas passée', () => {
  const maintenant = new Date('2026-11-21T12:00:00+01:00');
  const visible = (statut, fin, debut) =>
    agendaVisibleSi(statut, periodeTerminee(fin, debut, maintenant));
  assert.equal(visible('à valider', '2026-12-12', '2026-11-28'), true);
  assert.equal(visible('à valider', '2026-10-11', '2026-05-14'), false);
  assert.equal(visible('publié', '2026-12-13', '2026-12-06'), true);
  assert.equal(visible('validé', '2026-12-13', '2026-12-06'), false);
  assert.equal(periodeTerminee('2026-11-21', null, maintenant), false);
  assert.equal(periodeTerminee('2026-11-20', null, maintenant), true);
});

test('le contour de l’Indre-et-Loire est dans le dépôt', () => {
  const data = JSON.parse(readFileSync('public/data/indre-et-loire.geojson', 'utf8'));
  assert.equal(data.features.length, 1);
  assert.equal(data.features[0].properties.code, '37');
  assert.ok(data.features[0].geometry.coordinates.length > 0);
});

test('le territoire compte 67 communes aux codes uniques', () => {
  const data = JSON.parse(readFileSync('public/data/communes-loches-sud-touraine.geojson', 'utf8'));
  assert.equal(data.features.length, 67);
  const codes = data.features.map((feature) => feature.properties.code);
  assert.equal(new Set(codes).size, 67);
  assert.ok(codes.includes('37132'));
  assert.ok(codes.includes('37057'));
});

test('le nombre de fiches s’écrit avec une espace insécable', () => {
  assert.equal(nombreFrancais(143), '143');
  assert.equal(nombreFrancais(1000), '1\u00A0000');
  assert.equal(nombreFrancais(1234567), '1\u00A0234\u00A0567');
  assert.equal(appliquerNombre('{n} fiches sur le Sud Touraine', 143), '143 fiches sur le Sud Touraine');
});

test('le retour arrière ne passe pas par le routeur de transitions', () => {
  const base = readFileSync('src/layouts/Base.astro', 'utf8');
  const css = readFileSync('src/styles/global.css', 'utf8');
  assert.equal(base.includes('ClientRouter'), false);
  assert.equal(base.includes('astro:transitions'), false);
  assert.match(css, /@view-transition\s*\{\s*navigation:\s*auto;/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)\s*\{\s*@view-transition\s*\{\s*navigation:\s*none;/);
});

test('le JSON-LD d’une fiche est un JSON valide et typé', () => {
  const fiche = {
    categorie: 'batiments-anciens-disparus',
    id: 'exemple-disparu',
    titre: 'Tour disparue',
    periode: 'XIIe siècle',
    commune: 'Loches',
    insee: '37132',
    latitude: 47.12,
    longitude: 0.99,
    date_debut: '1100',
    date_fin: null,
    wikidata: 'Q1',
    merimee: 'PA00097681',
    palissy: null,
    image: { url: 'https://exemple.fr/tour.jpg', auteur: 'Auteur', licence: 'CC BY-SA 4.0' },
    sources: [{ titre: 'Source', url: 'https://exemple.fr/source' }],
  };
  const contexte = {
    origine: 'https://blomig.github.io',
    base: '/patrimoine-sud-touraine/',
    nomSite: 'Patrimoine du Sud-Touraine',
    urlFiche: 'https://blomig.github.io/patrimoine-sud-touraine/batiments-anciens-disparus/exemple-disparu/',
    urlCommune: 'https://blomig.github.io/patrimoine-sud-touraine/communes/loches/',
    urlRubrique: 'https://blomig.github.io/patrimoine-sud-touraine/batiments-anciens-disparus/',
    nomRubrique: 'Bâtiments disparus',
  };
  const blocs = JSON.parse(JSON.stringify(jsonLdFiche(fiche, contexte)));
  assert.equal(blocs[0]['@type'], 'LandmarksOrHistoricalBuildings');
  assert.match(blocs[0].description, /disparu/);
  assert.equal(blocs[0].additionalProperty.value, 'bâtiment disparu');
  assert.deepEqual(blocs[0].sameAs, [
    'https://www.wikidata.org/wiki/Q1',
    'https://www.pop.culture.gouv.fr/notice/merimee/PA00097681',
  ]);
  assert.equal(blocs[0].image.creditText, 'Auteur');
  assert.equal(blocs[1]['@type'], 'BreadcrumbList');
  assert.equal(typeSchema({ ...fiche, categorie: 'personnes' }), 'Person');
  assert.equal(typeSchema({ ...fiche, categorie: 'evenements-historiques' }), 'Event');
  assert.equal(typeSchema({ ...fiche, categorie: 'agenda' }), 'Event');
  assert.equal(typeSchema({ ...fiche, categorie: 'vie-economique' }), 'Organization');
  assert.equal(typeSchema({ ...fiche, categorie: 'documents', type_document: 'archive' }), 'ArchiveComponent');
  assert.equal(typeSchema({ ...fiche, categorie: 'documents', type_document: null }), 'CreativeWork');
  assert.equal(typeSchema({ ...fiche, categorie: 'batiments-anciens-existants' }), 'LandmarksOrHistoricalBuildings');
  assert.deepEqual(liensIdentifiants({ wikidata: null, merimee: 'PA00097681', palissy: 'PM37000123' }).map((lien) => lien.label), [
    'Mérimée (POP)',
    'Palissy (POP)',
  ]);
  assert.equal(codeWikidata('Q42'), true);
  assert.equal(codeWikidata('tour'), false);
  assert.equal(codeMerimee('PA37000028'), true);
  assert.equal(codeMerimee('notice'), false);
  assert.equal(codePalissy('PM37000123'), true);
  const site = JSON.parse(JSON.stringify(jsonLdSite({
    nom: 'Patrimoine du Sud-Touraine',
    url: 'https://blomig.github.io/patrimoine-sud-touraine/',
    recherche: 'https://blomig.github.io/patrimoine-sud-touraine/recherche/?q={search_term_string}',
  })));
  assert.equal(site['@type'], 'WebSite');
  assert.equal(site.potentialAction['@type'], 'SearchAction');
  const csv = versCsv([ligneOuverte(fiche, contexte.urlFiche)]);
  assert.match(csv, /^slug,titre,rubrique,/);
  assert.match(csv, /exemple-disparu/);
});

test('une rubrique de commune s’adresse par le titre public', () => {
  assert.equal(slugRubrique('Personnages'), 'personnages');
  assert.equal(slugRubrique('Bâtiments disparus'), 'batiments-disparus');
  assert.equal(slugRubrique('Prochaines animations'), 'prochaines-animations');
  assert.equal(lienTouteLaRubrique('personnes', 'Personnages'), 'Voir tous les personnages du Sud-Touraine');
  assert.equal(
    lienTouteLaRubrique('agenda', 'Prochaines animations'),
    'Voir toutes les prochaines animations du Sud-Touraine',
  );
  assert.equal(slugifier('Bournan'), 'bournan');
});

test('les noms de communes pilotes deviennent des adresses stables', () => {
  assert.equal(slugifier('La Chapelle-Blanche-Saint-Martin'), 'la-chapelle-blanche-saint-martin');
  assert.equal(slugifier('Civray-sur-Esves'), 'civray-sur-esves');
  assert.equal(slugifier('Le Grand-Pressigny'), 'le-grand-pressigny');
});
