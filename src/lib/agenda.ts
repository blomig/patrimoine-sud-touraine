export type EntreeAgenda = {
  statut: string;
  date_debut: string | null;
  date_fin: string | null;
};

/** Mention affichée tant que la fiche n'est pas relue ou publiée. */
export function mentionStatut(statut: string): string | null {
  if (statut === 'à vérifier') return 'À vérifier';
  if (statut === 'à valider') return 'En attente de validation';
  return null;
}

/**
 * L'agenda public montre les animations non terminées.
 * « à valider » reste visible, avec la mention d'attente.
 * « publié » aussi. Un statut encore « à vérifier » sur une animation est traité comme en attente.
 */
export function agendaVisibleSi(statut: string, terminee: boolean): boolean {
  if (statut !== 'à valider' && statut !== 'publié' && statut !== 'à vérifier') return false;
  return !terminee;
}
