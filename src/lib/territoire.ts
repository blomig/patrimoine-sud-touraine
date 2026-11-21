import fs from 'node:fs';
import path from 'node:path';
import { slugifier } from './slug';

export type CommuneTerritoire = {
  nom: string;
  code: string;
  slug: string;
};

type Feature = {
  properties: { nom: string; code: string };
};

/** Les 67 communes de l'EPCI, d'après le GeoJSON simplifié du dépôt. */
export function communesDuTerritoire(): CommuneTerritoire[] {
  const fichier = path.join(process.cwd(), 'public/data/communes-loches-sud-touraine.geojson');
  const data = JSON.parse(fs.readFileSync(fichier, 'utf8')) as { features: Feature[] };
  const vues = new Map<string, CommuneTerritoire>();
  for (const feature of data.features) {
    const nom = feature.properties.nom;
    const code = feature.properties.code;
    const slug = slugifier(nom);
    const deja = vues.get(slug);
    if (deja && deja.code !== code) {
      throw new Error(`Les communes « ${deja.nom} » et « ${nom} » produisent la même adresse (${slug}).`);
    }
    vues.set(slug, { nom, code, slug });
  }
  if (vues.size !== 67) {
    throw new Error(`Le GeoJSON des communes devrait en contenir 67, pas ${vues.size}.`);
  }
  return [...vues.values()].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}
