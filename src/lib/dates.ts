const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export type DateDecomposee = {
  annee: number;
  mois: number | null;
  jour: number | null;
};

/** Année, année-mois ou date complète. Les années négatives sont acceptées. */
export function decomposerDate(valeur: string): DateDecomposee | null {
  const correspondance = valeur.trim().match(/^(-?\d+)(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!correspondance) return null;
  const mois = correspondance[2] ? Number(correspondance[2]) : null;
  const jour = correspondance[3] ? Number(correspondance[3]) : null;
  if (mois != null && (mois < 1 || mois > 12)) return null;
  if (jour != null && (jour < 1 || jour > 31)) return null;
  return { annee: Number(correspondance[1]), mois, jour };
}

function pack(annee: number, mois: number, jour: number): number {
  return annee * 10000 + mois * 100 + jour;
}

function joursDansMois(annee: number, mois: number): number {
  return new Date(Date.UTC(annee, mois, 0)).getUTCDate();
}

/** Année décimale. `fin` place une date partielle en fin de mois ou d’année. */
export function anneeDecimale(valeur: string | null | undefined, fin = false): number | null {
  if (!valeur) return null;
  const date = decomposerDate(valeur);
  if (!date) return null;
  const mois = date.mois ?? (fin ? 12 : 1);
  const jour = date.jour ?? (fin ? 28 : 1);
  return date.annee + (mois - 1) / 12 + (Math.min(jour, 28) - 1) / 365.25;
}

/** Clé de tri : début de la période (jour 1 si le jour manque). */
export function cleDebut(valeur: string | null | undefined): number {
  if (!valeur) return Number.POSITIVE_INFINITY;
  const date = decomposerDate(valeur);
  if (!date) return Number.POSITIVE_INFINITY;
  return pack(date.annee, date.mois ?? 1, date.jour ?? 1);
}

/** Dernier jour couvert par une date partielle. Null si la date est vide. */
export function cleFin(valeur: string | null | undefined): number | null {
  if (!valeur) return null;
  const date = decomposerDate(valeur);
  if (!date) return null;
  if (date.mois && date.jour) return pack(date.annee, date.mois, date.jour);
  if (date.mois) return pack(date.annee, date.mois, joursDansMois(date.annee, date.mois));
  return pack(date.annee, 12, 31);
}

export function aujourdhuiISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function formatDateSouple(valeur: string | null | undefined): string {
  if (!valeur) return 'non précisée';
  const date = decomposerDate(valeur);
  if (!date) return valeur;
  const annee = date.annee < 0 ? `${Math.abs(date.annee)} av. J.-C.` : String(date.annee);
  if (date.mois && date.jour) return `${date.jour} ${MOIS[date.mois - 1]} ${annee}`;
  if (date.mois) return `${MOIS[date.mois - 1]} ${annee}`;
  return annee;
}

export function formatPlage(debut: string | null | undefined, fin: string | null | undefined): string {
  if (!debut && !fin) return 'Date non précisée';
  if (debut && fin && debut !== fin) return `${formatDateSouple(debut)} – ${formatDateSouple(fin)}`;
  return formatDateSouple(debut || fin);
}

/** Vrai quand la fin de période est strictement avant aujourd’hui (fuseau de Paris). */
export function periodeTerminee(
  dateFin: string | null | undefined,
  dateDebut: string | null | undefined,
  maintenant: Date = new Date(),
): boolean {
  const fin = cleFin(dateFin) ?? cleFin(dateDebut);
  if (fin == null) return false;
  const aujourd = cleDebut(aujourdhuiISO(maintenant));
  return fin < aujourd;
}
