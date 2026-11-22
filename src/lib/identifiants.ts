const WIKIDATA = /^Q\d+$/;
const MERIMEE = /^(?:PA|IA|MH)\d+$/;
const PALISSY = /^PM\d+$/;

export type CodesExternes = {
  wikidata?: string | null;
  merimee?: string | null;
  palissy?: string | null;
};

export type LienExterne = {
  href: string;
  label: string;
};

export function codeWikidata(valeur: string): boolean {
  return WIKIDATA.test(valeur);
}

export function codeMerimee(valeur: string): boolean {
  return MERIMEE.test(valeur);
}

export function codePalissy(valeur: string): boolean {
  return PALISSY.test(valeur);
}

export function urlWikidata(code: string): string {
  return `https://www.wikidata.org/wiki/${code}`;
}

export function urlMerimee(code: string): string {
  return `https://www.pop.culture.gouv.fr/notice/merimee/${code}`;
}

export function urlPalissy(code: string): string {
  return `https://www.pop.culture.gouv.fr/notice/palissy/${code}`;
}

/** Liens affichés seulement pour les identifiants déjà écrits dans la fiche. */
export function liensIdentifiants(codes: CodesExternes): LienExterne[] {
  const liens: LienExterne[] = [];
  if (codes.wikidata && codeWikidata(codes.wikidata)) {
    liens.push({ href: urlWikidata(codes.wikidata), label: 'Wikidata' });
  }
  if (codes.merimee && codeMerimee(codes.merimee)) {
    liens.push({ href: urlMerimee(codes.merimee), label: 'Mérimée (POP)' });
  }
  if (codes.palissy && codePalissy(codes.palissy)) {
    liens.push({ href: urlPalissy(codes.palissy), label: 'Palissy (POP)' });
  }
  return liens;
}
