import type { CategorieId } from './categories';
import { periodeTerminee } from './dates.ts';
import {
  codeMerimee,
  codePalissy,
  codeWikidata,
  urlMerimee,
  urlPalissy,
  urlWikidata,
} from './identifiants.ts';

export type ImageFiche = {
  url: string;
  auteur: string;
  licence: string;
};

export type FicheStructurée = {
  categorie: CategorieId;
  id: string;
  titre: string;
  periode: string;
  commune: string;
  insee: string;
  latitude?: number | null;
  longitude?: number | null;
  date_debut?: string | null;
  date_fin?: string | null;
  date_document?: string | null;
  lieu?: string | null;
  wikidata?: string | null;
  merimee?: string | null;
  palissy?: string | null;
  image?: ImageFiche | null;
  sources?: { titre: string; url: string }[];
  type_document?: string | null;
  cote?: string | null;
  fonds?: string | null;
};

export type ContexteSite = {
  origine: string;
  base: string;
  nomSite: string;
  urlFiche: string;
  urlCommune: string;
  urlRubrique: string;
  nomRubrique: string;
};

const CONTEXTE = 'https://schema.org';

function sansVide(valeur: Record<string, unknown>): Record<string, unknown> {
  for (const cle of Object.keys(valeur)) {
    const contenu = valeur[cle];
    if (contenu == null || contenu === '' || (Array.isArray(contenu) && contenu.length === 0)) {
      delete valeur[cle];
    }
  }
  return valeur;
}

function dateSchema(valeur: string | null | undefined): string | undefined {
  if (!valeur) return undefined;
  return valeur;
}

export function typeSchema(fiche: FicheStructurée): string {
  switch (fiche.categorie) {
    case 'batiments-anciens-disparus':
    case 'batiments-anciens-existants':
      return 'LandmarksOrHistoricalBuildings';
    case 'personnes':
      return 'Person';
    case 'evenements-historiques':
    case 'agenda':
      return 'Event';
    case 'vie-economique':
      return 'Organization';
    case 'documents':
      return fiche.type_document && fiche.type_document !== 'autre' ? 'ArchiveComponent' : 'CreativeWork';
    default:
      return 'Thing';
  }
}

function urlImage(url: string, origine: string): string {
  if (/^https?:\/\//.test(url)) return url;
  const chemin = url.startsWith('/') ? url : `/${url}`;
  return new URL(chemin, origine).href;
}

function geo(fiche: FicheStructurée): Record<string, unknown> | undefined {
  if (fiche.latitude == null || fiche.longitude == null) return undefined;
  return {
    '@type': 'GeoCoordinates',
    latitude: fiche.latitude,
    longitude: fiche.longitude,
  };
}

function commune(fiche: FicheStructurée, contexte: ContexteSite): Record<string, unknown> {
  return sansVide({
    '@type': 'Place',
    name: fiche.commune,
    url: contexte.urlCommune,
    identifier: fiche.insee,
  });
}

function sameAs(fiche: FicheStructurée): string[] {
  const liens: string[] = [];
  if (fiche.wikidata && codeWikidata(fiche.wikidata)) liens.push(urlWikidata(fiche.wikidata));
  if (fiche.merimee && codeMerimee(fiche.merimee)) liens.push(urlMerimee(fiche.merimee));
  if (fiche.palissy && codePalissy(fiche.palissy)) liens.push(urlPalissy(fiche.palissy));
  return liens;
}

function image(fiche: FicheStructurée, origine: string): Record<string, unknown> | undefined {
  if (!fiche.image?.url) return undefined;
  return sansVide({
    '@type': 'ImageObject',
    contentUrl: urlImage(fiche.image.url, origine),
    creditText: fiche.image.auteur,
    copyrightNotice: fiche.image.licence,
    creator: fiche.image.auteur ? { '@type': 'Person', name: fiche.image.auteur } : undefined,
  });
}

function description(fiche: FicheStructurée): string {
  if (fiche.categorie === 'batiments-anciens-disparus') {
    return `${fiche.periode} Bâtiment aujourd’hui disparu.`;
  }
  return fiche.periode;
}

export function entiteSchema(fiche: FicheStructurée, contexte: ContexteSite): Record<string, unknown> {
  const type = typeSchema(fiche);
  const visuel = image(fiche, contexte.origine);
  const coordonnees = geo(fiche);
  const entite: Record<string, unknown> = {
    '@context': CONTEXTE,
    '@type': type,
    '@id': contexte.urlFiche,
    name: fiche.titre,
    description: description(fiche),
    url: contexte.urlFiche,
    inLanguage: 'fr',
    image: visuel,
    geo: coordonnees,
    containedInPlace: commune(fiche, contexte),
    isPartOf: {
      '@type': 'WebSite',
      name: contexte.nomSite,
      url: new URL(contexte.base, contexte.origine).href,
    },
    sameAs: sameAs(fiche),
  };

  if (fiche.categorie === 'batiments-anciens-disparus') {
    entite.additionalProperty = {
      '@type': 'PropertyValue',
      name: 'état',
      value: 'bâtiment disparu',
    };
  }

  if (fiche.categorie === 'personnes') {
    entite.birthDate = dateSchema(fiche.date_debut);
    entite.deathDate = dateSchema(fiche.date_fin);
    entite.homeLocation = commune(fiche, contexte);
  }

  if (fiche.categorie === 'evenements-historiques' || fiche.categorie === 'agenda') {
    entite.startDate = dateSchema(fiche.date_debut);
    entite.endDate = dateSchema(fiche.date_fin);
    entite.location = sansVide({
      '@type': 'Place',
      name: fiche.lieu || fiche.commune,
      address: {
        '@type': 'PostalAddress',
        addressLocality: fiche.commune,
        addressCountry: 'FR',
      },
      geo: coordonnees,
    });
  }

  if (fiche.categorie === 'agenda' && !periodeTerminee(fiche.date_fin, fiche.date_debut)) {
    entite.eventStatus = 'https://schema.org/EventScheduled';
  }

  if (type === 'CreativeWork' || type === 'ArchiveComponent') {
    entite.creditText = fiche.image?.auteur;
    entite.copyrightNotice = fiche.image?.licence;
    entite.dateCreated = dateSchema(fiche.date_document) ?? dateSchema(fiche.date_debut);
    entite.identifier = fiche.cote ?? undefined;
    if (fiche.fonds) {
      entite.isPartOf = [
        entite.isPartOf,
        { '@type': 'ArchiveComponent', name: fiche.fonds },
      ];
    }
  }

  if (fiche.categorie === 'vie-economique') {
    entite.location = commune(fiche, contexte);
  }

  return sansVide(entite);
}

export function filArianeSchema(fiche: FicheStructurée, contexte: ContexteSite): Record<string, unknown> {
  const accueil = new URL(contexte.base, contexte.origine).href;
  return {
    '@context': CONTEXTE,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: accueil },
      { '@type': 'ListItem', position: 2, name: contexte.nomRubrique, item: contexte.urlRubrique },
      { '@type': 'ListItem', position: 3, name: fiche.titre, item: contexte.urlFiche },
    ],
  };
}

export function jsonLdFiche(fiche: FicheStructurée, contexte: ContexteSite): Record<string, unknown>[] {
  return [entiteSchema(fiche, contexte), filArianeSchema(fiche, contexte)];
}

export function structureFiche(data: FicheStructurée): FicheStructurée {
  return {
    ...data,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    date_debut: data.date_debut ?? null,
    date_fin: data.date_fin ?? null,
    date_document: data.date_document ?? null,
    lieu: data.lieu ?? null,
    wikidata: data.wikidata ?? null,
    merimee: data.merimee ?? null,
    palissy: data.palissy ?? null,
    image: data.image?.url
      ? { url: data.image.url, auteur: data.image.auteur, licence: data.image.licence }
      : null,
    sources: data.sources ?? [],
    type_document: data.type_document ?? null,
    cote: data.cote ?? null,
    fonds: data.fonds ?? null,
  };
}

export function jsonLdSite(contexte: { nom: string; url: string; recherche: string }): Record<string, unknown> {
  return {
    '@context': CONTEXTE,
    '@type': 'WebSite',
    name: contexte.nom,
    url: contexte.url,
    inLanguage: 'fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: contexte.recherche,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export type DublinCore = {
  title: string;
  date?: string;
  sources: string[];
  rights?: string;
  creator?: string;
  coverage: string;
};

export function dublinCore(fiche: FicheStructurée): DublinCore {
  const debut = fiche.date_document || fiche.date_debut;
  const fin = fiche.date_fin;
  let date: string | undefined;
  if (debut && fin && fin !== debut) date = `${debut}/${fin}`;
  else date = debut || fin || undefined;
  return {
    title: fiche.titre,
    date,
    sources: (fiche.sources ?? []).map((source) => source.url).filter(Boolean),
    rights: fiche.image?.licence || undefined,
    creator: fiche.image?.auteur || undefined,
    coverage: fiche.commune,
  };
}
