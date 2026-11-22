import type { APIRoute } from 'astro';
import { hrefFiche, toutesLesFiches } from '../../lib/contenu';
import { ligneOuverte, versCsv } from '../../lib/export-ouvert';
import { structureFiche } from '../../lib/jsonld';
import { urlPublique } from '../../lib/urls';

export const prerender = true;

export const GET: APIRoute = async () => {
  const fiches = await toutesLesFiches();
  const lignes = fiches.map((fiche) => ligneOuverte(structureFiche(fiche.data), urlPublique(hrefFiche(fiche))));
  return new Response(versCsv(lignes), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8' },
  });
};
