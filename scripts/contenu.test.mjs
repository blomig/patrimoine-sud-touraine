import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { agendaVisibleSi } from '../src/lib/agenda.ts';
import { cleDebut, cleFin, formatDateSouple, formatPlage, periodeTerminee } from '../src/lib/dates.ts';
import { appliquerNombre, nombreFrancais } from '../src/lib/nombres.ts';
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

test('les noms de communes pilotes deviennent des adresses stables', () => {
  assert.equal(slugifier('La Chapelle-Blanche-Saint-Martin'), 'la-chapelle-blanche-saint-martin');
  assert.equal(slugifier('Civray-sur-Esves'), 'civray-sur-esves');
  assert.equal(slugifier('Le Grand-Pressigny'), 'le-grand-pressigny');
});
