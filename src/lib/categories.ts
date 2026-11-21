export const CATEGORIES_FICHES = [
  'batiments-anciens-disparus',
  'batiments-anciens-existants',
  'personnes',
  'evenements-historiques',
  'vie-economique',
  'documents',
] as const;

export type CategorieFiche = (typeof CATEGORIES_FICHES)[number];

export type CategorieId = CategorieFiche | 'agenda';

export type Categorie = {
  id: CategorieId;
  titre: string;
  court: string;
  resume: string;
  frise: boolean;
  illustration?: {
    titre?: string;
    legende: string;
    fichier?: string;
    url?: string;
    auteur: string;
    licence?: string;
  };
};

/** Libellés de repli si themes.yml ne définit plus une catégorie. */
export const MODELES: Categorie[] = [
  {
    id: 'batiments-anciens-disparus',
    titre: 'Bâtiments disparus',
    court: 'Bâtiments disparus',
    resume: 'Édifices détruits ou arasés, connus par les textes, les images ou les fouilles.',
    frise: true,
  },
  {
    id: 'batiments-anciens-existants',
    titre: 'Bâtiments existants',
    court: 'Bâtiments existants',
    resume:
      'Monuments encore en élévation, y compris le petit patrimoine. Les musées sont rattachés au bâtiment qui les abrite.',
    frise: true,
  },
  {
    id: 'personnes',
    titre: 'Personnages',
    court: 'Personnages',
    resume: 'Femmes et hommes dont la vie éclaire l’histoire du territoire.',
    frise: true,
  },
  {
    id: 'evenements-historiques',
    titre: 'Événements historiques',
    court: 'Événement historique',
    resume: 'Épisodes datés, appuyés sur des sources.',
    frise: true,
  },
  {
    id: 'agenda',
    titre: 'Animations',
    court: 'Animations',
    resume: 'Visites, ateliers et rendez-vous. Une animation dont la date est passée ne s’affiche plus.',
    frise: false,
  },
  {
    id: 'vie-economique',
    titre: 'Vie économique',
    court: 'Vie économique',
    resume: 'Moulins, commerces, ateliers, foires et autres activités qui ont fait vivre le territoire.',
    frise: true,
  },
  {
    id: 'documents',
    titre: 'Documents',
    court: 'Documents',
    resume: 'Cadastres, cartes, plans, photographies anciennes, cartes postales et archives rattachés à une commune.',
    frise: true,
  },
];

export function estCategorieFiche(id: string): id is CategorieFiche {
  return (CATEGORIES_FICHES as readonly string[]).includes(id);
}

export function estCategorie(id: string): id is CategorieId {
  return MODELES.some((categorie) => categorie.id === id);
}
