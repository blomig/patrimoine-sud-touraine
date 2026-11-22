import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');

async function fichiers(dossier) {
  const trouves = [];
  const entrees = await readdir(dossier, { withFileTypes: true });
  for (const entree of entrees) {
    const chemin = path.join(dossier, entree.name);
    if (entree.isDirectory()) trouves.push(...(await fichiers(chemin)));
    else trouves.push(chemin);
  }
  return trouves;
}

const tous = await fichiers(dist);
const pages = tous.filter((fichier) => fichier.endsWith('.html'));
let scripts = 0;
const types = new Set();
for (const fichier of pages) {
  const html = await readFile(fichier, 'utf8');
  const blocs = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const bloc of blocs) {
    let donnees;
    try {
      donnees = JSON.parse(bloc[1]);
    } catch (erreur) {
      throw new Error(`JSON-LD illisible dans ${path.relative(dist, fichier)} : ${erreur.message}`);
    }
    scripts += 1;
    const noeuds = Array.isArray(donnees) ? donnees : [donnees];
    for (const noeud of noeuds) {
      if (!noeud || typeof noeud !== 'object' || !noeud['@type']) {
        throw new Error(`JSON-LD sans @type dans ${path.relative(dist, fichier)}`);
      }
      const liste = Array.isArray(noeud['@type']) ? noeud['@type'] : [noeud['@type']];
      for (const type of liste) types.add(type);
    }
  }
}

if (scripts === 0) throw new Error('Aucune page ne contient de JSON-LD.');

const attendus = ['WebSite', 'BreadcrumbList', 'LandmarksOrHistoricalBuildings', 'Person', 'Event', 'Organization'];
for (const type of attendus) {
  if (!types.has(type)) throw new Error(`Le type Schema.org ${type} n’apparaît dans aucun JSON-LD.`);
}
if (!types.has('CreativeWork') && !types.has('ArchiveComponent')) {
  throw new Error('Aucun CreativeWork ni ArchiveComponent dans les JSON-LD.');
}

const jsonChemin = tous.find((fichier) => fichier.endsWith(`${path.sep}fiches.json`) || fichier.endsWith('/fiches.json'));
const csvChemin = tous.find((fichier) => fichier.endsWith(`${path.sep}fiches.csv`) || fichier.endsWith('/fiches.csv'));
if (!jsonChemin || !csvChemin) {
  throw new Error(`Export introuvable. Fichiers donnees : ${tous.filter((f) => f.includes('donnees')).join(', ') || 'aucun'}`);
}
const exportJson = JSON.parse(await readFile(jsonChemin, 'utf8'));
if (!Array.isArray(exportJson) || exportJson.length < 10) {
  throw new Error('fiches.json ne contient pas la liste des fiches.');
}
const csv = await readFile(csvChemin, 'utf8');
if (!csv.startsWith('slug,titre,rubrique,')) throw new Error('fiches.csv n’a pas l’en-tête attendu.');
const lignes = csv.trim().split('\n').length - 1;
if (lignes !== exportJson.length) {
  throw new Error(`fiches.csv a ${lignes} lignes, fiches.json en a ${exportJson.length}.`);
}

console.log(`JSON-LD : ${scripts} scripts, types ${[...types].sort().join(', ')}.`);
console.log(`Export : ${exportJson.length} fiches.`);
