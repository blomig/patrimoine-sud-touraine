export type Theme = {
  id: string;
  libelle: string;
};

/**
 * Rattache les identifiants de thème d'une fiche au catalogue de sa catégorie.
 * Un identifiant retiré de themes.yml est signalé : il ne casse pas le build.
 */
export function resoudreThemes(identifiants: string[], catalogue: Theme[]) {
  const parId = new Map(catalogue.map((theme) => [theme.id, theme]));
  const connus: Theme[] = [];
  const inconnus: string[] = [];
  for (const identifiant of identifiants) {
    const theme = parId.get(identifiant);
    if (theme) connus.push(theme);
    else inconnus.push(identifiant);
  }
  return { connus, inconnus };
}
