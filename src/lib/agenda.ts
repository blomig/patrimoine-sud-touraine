export type EntreeAgenda = {
  statut: string;
  date_debut: string | null;
  date_fin: string | null;
};

/**
 * L'agenda public montre les animations non terminées.
 * « à valider », « publié » et « à vérifier » restent visibles.
 * Le statut lui-même n'est pas affiché.
 */
export function agendaVisibleSi(statut: string, terminee: boolean): boolean {
  if (statut !== 'à valider' && statut !== 'publié' && statut !== 'à vérifier') return false;
  return !terminee;
}
