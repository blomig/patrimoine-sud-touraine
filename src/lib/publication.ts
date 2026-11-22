import { hrefFiche, type Fiche } from './contenu';
import { dublinCore, jsonLdFiche, structureFiche, type DublinCore } from './jsonld';
import { chargerSite } from './site';
import { slugifier } from './slug';
import { urlPublique } from './urls';

export function publicationFiche(fiche: Fiche, nomRubrique: string): { jsonLd: Record<string, unknown>[]; dublinCore: DublinCore } {
  const site = chargerSite();
  const structure = structureFiche(fiche.data);
  const origine = import.meta.env.SITE ?? 'https://blomig.github.io';
  return {
    jsonLd: jsonLdFiche(structure, {
      origine,
      base: import.meta.env.BASE_URL,
      nomSite: site.titre,
      urlFiche: urlPublique(hrefFiche(fiche)),
      urlCommune: urlPublique(`/communes/${slugifier(fiche.data.commune)}/`),
      urlRubrique: urlPublique(`/${fiche.data.categorie}/`),
      nomRubrique,
    }),
    dublinCore: dublinCore(structure),
  };
}
