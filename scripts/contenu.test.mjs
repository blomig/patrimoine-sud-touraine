import assert from 'node:assert/strict';
import test from 'node:test';
import { agendaVisibleSi } from '../src/lib/agenda.ts';
import { cleDebut, cleFin, formatDateSouple, formatPlage, periodeTerminee } from '../src/lib/dates.ts';
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

test('les noms de communes pilotes deviennent des adresses stables', () => {
  assert.equal(slugifier('La Chapelle-Blanche-Saint-Martin'), 'la-chapelle-blanche-saint-martin');
  assert.equal(slugifier('Civray-sur-Esves'), 'civray-sur-esves');
  assert.equal(slugifier('Le Grand-Pressigny'), 'le-grand-pressigny');
});
