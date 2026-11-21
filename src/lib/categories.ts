export const CATEGORIES_FICHES = [
  'batiments-anciens-disparus',
  'batiments-anciens-existants',
  'personnes',
  'evenements-historiques',
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
    legende: string;
    fichier?: string;
    url: string;
    auteur: string;
    licence: string;
  };
};

/** Libellés de repli si themes.yml ne définit plus une catégorie. */
export const MODELES: Categorie[] = [
  {
    id: 'batiments-anciens-disparus',
    titre: 'Bâtiments anciens disparus',
    court: 'Disparus',
    resume: 'Édifices détruits ou arasés, connus par les textes, les images ou les fouilles.',
    frise: true,
  },
  {
    id: 'batiments-anciens-existants',
    titre: 'Bâtiments anciens encore existants',
    court: 'Existants',
    resume:
      'Monuments encore en élévation, y compris le petit patrimoine. Les musées sont rattachés au bâtiment qui les abrite.',
    frise: true,
  },
  {
    id: 'personnes',
    titre: 'Personnes ayant vécu et leur histoire',
    court: 'Personnes',
    resume: 'Femmes et hommes dont la vie éclaire l’histoire du territoire.',
    frise: true,
  },
  {
    id: 'evenements-historiques',
    titre: 'Événements historiques documentés',
    court: 'Événements',
    resume: 'Épisodes datés, appuyés sur des sources.',
    frise: true,
  },
  {
    id: 'agenda',
    titre: 'Animations à venir',
    court: 'Agenda',
    resume:
      'Visites, ateliers et rendez-vous. Les animations « à valider » s’affichent avec la mention « en attente de validation ». Celles dont la date est passée ne s’affichent plus.',
    frise: false,
  },
];

export function estCategorieFiche(id: string): id is CategorieFiche {
  return (CATEGORIES_FICHES as readonly string[]).includes(id);
}

export function estCategorie(id: string): id is CategorieId {
  return MODELES.some((categorie) => categorie.id === id);
}
