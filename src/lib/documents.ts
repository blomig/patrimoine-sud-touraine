export const TYPES_DOCUMENT = {
  cadastre: 'Cadastre',
  carte: 'Carte',
  plan: 'Plan',
  photo: 'Photo',
  'carte postale': 'Carte postale',
  archive: 'Archive',
  autre: 'Autre',
} as const;

export function libelleTypeDocument(type: string | null | undefined): string | null {
  if (!type) return null;
  return TYPES_DOCUMENT[type as keyof typeof TYPES_DOCUMENT] ?? type;
}
