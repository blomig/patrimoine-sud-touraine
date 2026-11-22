import type { FicheStructurée } from './jsonld';

export type LigneOuverte = {
  slug: string;
  titre: string;
  rubrique: string;
  commune: string;
  insee: string;
  date_debut: string | null;
  date_fin: string | null;
  latitude: number | null;
  longitude: number | null;
  resume: string;
  url: string;
  wikidata: string | null;
  merimee: string | null;
  palissy: string | null;
  credit: string | null;
  licence: string | null;
};

export const COLONNES_CSV = [
  'slug',
  'titre',
  'rubrique',
  'commune',
  'insee',
  'date_debut',
  'date_fin',
  'latitude',
  'longitude',
  'resume',
  'url',
  'wikidata',
  'merimee',
  'palissy',
  'credit',
  'licence',
] as const;

export function ligneOuverte(fiche: FicheStructurée, url: string): LigneOuverte {
  return {
    slug: fiche.id,
    titre: fiche.titre,
    rubrique: fiche.categorie,
    commune: fiche.commune,
    insee: fiche.insee,
    date_debut: fiche.date_debut ?? null,
    date_fin: fiche.date_fin ?? null,
    latitude: fiche.latitude ?? null,
    longitude: fiche.longitude ?? null,
    resume: fiche.periode,
    url,
    wikidata: fiche.wikidata ?? null,
    merimee: fiche.merimee ?? null,
    palissy: fiche.palissy ?? null,
    credit: fiche.image?.auteur ?? null,
    licence: fiche.image?.licence ?? null,
  };
}

function cellule(valeur: string | number | null): string {
  if (valeur == null) return '';
  const texte = String(valeur);
  if (/[",\n\r]/.test(texte)) return `"${texte.replaceAll('"', '""')}"`;
  return texte;
}

export function versCsv(lignes: LigneOuverte[]): string {
  const entete = COLONNES_CSV.join(',');
  const corps = lignes.map((ligne) => COLONNES_CSV.map((colonne) => cellule(ligne[colonne])).join(','));
  return `${entete}\n${corps.join('\n')}\n`;
}
