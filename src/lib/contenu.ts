import { getCollection, type CollectionEntry } from 'astro:content';
import { agendaVisibleSi } from './agenda';
import { estCategorie, type CategorieId } from './categories';
import { cleDebut, formatPlage, periodeTerminee } from './dates';
import { slugifier } from './slug';
import { themesDe } from './site';
import { communesDuTerritoire, type CommuneTerritoire } from './territoire';
import { resoudreThemes, type Theme } from './themes';

export type Fiche = CollectionEntry<'fiches'>;

function nomFichier(entry: { id: string }): string {
  const morceau = entry.id.split('/').pop() ?? entry.id;
  return morceau.replace(/\.md$/, '');
}

export async function toutesLesFiches(): Promise<Fiche[]> {
  const fiches = await getCollection('fiches');
  const vus = new Set<string>();
  for (const fiche of fiches) {
    const dossier = fiche.id.split('/')[0] ?? '';
    if (!estCategorie(dossier) || dossier !== fiche.data.categorie) {
      throw new Error(
        `La fiche « ${fiche.data.titre} » (${fiche.id}) est dans le dossier « ${dossier} » mais déclare la catégorie « ${fiche.data.categorie} ».`,
      );
    }
    if (nomFichier(fiche) !== fiche.data.id) {
      throw new Error(
        `L'identifiant « ${fiche.data.id} » ne correspond pas au nom de fichier « ${nomFichier(fiche)} ».`,
      );
    }
    if (vus.has(fiche.data.id)) {
      throw new Error(`L'identifiant « ${fiche.data.id} » est utilisé deux fois.`);
    }
    vus.add(fiche.data.id);
  }
  return fiches;
}

export function hrefFiche(fiche: Fiche): string {
  return `/${fiche.data.categorie}/${fiche.data.id}/`;
}

export function comparerTitre(a: Fiche, b: Fiche): number {
  return a.data.titre.localeCompare(b.data.titre, 'fr');
}

export function comparerChrono(a: Fiche, b: Fiche): number {
  const debut = cleDebut(a.data.date_debut) - cleDebut(b.data.date_debut);
  if (debut !== 0) return debut;
  const fin = cleDebut(a.data.date_fin) - cleDebut(b.data.date_fin);
  if (fin !== 0) return fin;
  return comparerTitre(a, b);
}

export async function fichesDe(categorie: CategorieId): Promise<Fiche[]> {
  const fiches = await toutesLesFiches();
  return fiches.filter((fiche) => fiche.data.categorie === categorie).sort(comparerTitre);
}

export function themesConnus(fiche: Fiche, catalogue: Theme[]) {
  return resoudreThemes(fiche.data.themes, catalogue);
}

export function plage(fiche: Fiche): string {
  return formatPlage(fiche.data.date_debut, fiche.data.date_fin);
}

export function extrait(markdown: string | undefined, max = 240): string {
  const texte = (markdown ?? '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max).replace(/\s+\S*$/, '');
  return `${coupe}…`;
}

export type CommuneGroupe = {
  nom: string;
  slug: string;
  insee: string;
  fiches: Fiche[];
};

export async function communes(): Promise<CommuneGroupe[]> {
  const fiches = await toutesLesFiches();
  const groupes = new Map<string, CommuneGroupe>();
  for (const fiche of fiches) {
    const slug = slugifier(fiche.data.commune);
    const existant = groupes.get(slug);
    if (existant) {
      if (existant.nom !== fiche.data.commune) {
        throw new Error(
          `Les communes « ${existant.nom} » et « ${fiche.data.commune} » produisent la même adresse (${slug}).`,
        );
      }
      existant.fiches.push(fiche);
    } else {
      groupes.set(slug, {
        nom: fiche.data.commune,
        slug,
        insee: fiche.data.insee,
        fiches: [fiche],
      });
    }
  }
  return [...groupes.values()]
    .map((groupe) => ({ ...groupe, fiches: groupe.fiches.sort(comparerTitre) }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

export type CommuneComplete = CommuneTerritoire & { fiches: Fiche[] };

/** Les 67 communes, avec les fiches rattachées par code INSEE. */
export async function communesCompletes(): Promise<CommuneComplete[]> {
  const fiches = await toutesLesFiches();
  const parCode = new Map<string, Fiche[]>();
  for (const fiche of fiches) {
    const liste = parCode.get(fiche.data.insee) ?? [];
    liste.push(fiche);
    parCode.set(fiche.data.insee, liste);
  }
  return communesDuTerritoire().map((commune) => ({
    ...commune,
    fiches: (parCode.get(commune.code) ?? []).sort(comparerTitre),
  }));
}

export async function agendaVisibleMaintenant(now: Date = new Date()): Promise<Fiche[]> {
  const fiches = await fichesDe('agenda');
  return fiches
    .filter((fiche) =>
      agendaVisibleSi(
        fiche.data.statut,
        periodeTerminee(fiche.data.date_fin, fiche.data.date_debut, now),
      ),
    )
    .sort(comparerChrono);
}

export function pointsCarte(fiches: Fiche[]) {
  return fiches
    .filter((fiche) => fiche.data.latitude != null && fiche.data.longitude != null)
    .map((fiche) => ({
      titre: fiche.data.titre,
      categorie: fiche.data.categorie,
      commune: fiche.data.commune,
      href: hrefFiche(fiche),
      lat: fiche.data.latitude as number,
      lon: fiche.data.longitude as number,
    }));
}

export function catalogueDe(categorie: string): Theme[] {
  return themesDe(categorie);
}
