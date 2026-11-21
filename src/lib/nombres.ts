/** Entier avec un espace insécable entre les milliers : 1 234. */
export function nombreFrancais(valeur: number): string {
  const entier = Math.trunc(valeur);
  const signe = entier < 0 ? '-' : '';
  const chiffres = String(Math.abs(entier));
  return signe + chiffres.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

/** Remplace chaque {n} du gabarit par le nombre formaté. */
export function appliquerNombre(gabarit: string, valeur: number): string {
  return gabarit.replaceAll('{n}', nombreFrancais(valeur));
}
