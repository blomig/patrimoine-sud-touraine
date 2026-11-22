import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { codeMerimee, codePalissy, codeWikidata } from './lib/identifiants';

function codeOptionnel(valide: (valeur: string) => boolean, message: string) {
  return z
    .union([z.string(), z.null()])
    .optional()
    .transform((valeur) => {
      if (typeof valeur !== 'string') return null;
      const texte = valeur.trim();
      return texte.length > 0 ? texte : null;
    })
    .refine((valeur) => valeur == null || valide(valeur), { message });
}

const dateChamp = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((valeur) => {
    if (valeur == null || valeur === '') return null;
    return String(valeur);
  })
  .refine((valeur) => valeur == null || /^-?\d+(?:-\d{2}){0,2}$/.test(valeur), {
    message: 'Date attendue : année (973 ou -2400), année-mois (1429-05) ou date (2026-12-12).',
  });

const imageSchema = z
  .object({
    url: z.string().url(),
    page_commons: z.string().url().nullable().optional(),
    licence: z.string().min(1),
    auteur: z.string().min(1),
  })
  .nullable()
  .optional();

const fiches = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './contenu',
  }),
  schema: z
    .object({
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      titre: z.string().min(1),
      categorie: z.enum([
        'batiments-anciens-disparus',
        'batiments-anciens-existants',
        'personnes',
        'evenements-historiques',
        'agenda',
        'vie-economique',
        'documents',
      ]),
      themes: z.array(z.string()).default([]),
      commune: z.string().min(1),
      insee: z.string().min(1),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      periode: z.string().min(1),
      date_debut: dateChamp,
      date_fin: dateChamp,
      lieu: z.string().nullable().optional(),
      wikidata: codeOptionnel(codeWikidata, 'Wikidata : Q suivi de chiffres, par exemple Q12345.'),
      merimee: codeOptionnel(codeMerimee, 'Mérimée : PA, IA ou MH suivi de chiffres, par exemple PA00097681.'),
      palissy: codeOptionnel(codePalissy, 'Palissy : PM suivi de chiffres, par exemple PM37000123.'),
      statut: z.enum(['à vérifier', 'à valider', 'validé', 'publié']),
      type_document: z
        .union([
          z.enum(['cadastre', 'carte', 'plan', 'photo', 'carte postale', 'archive', 'autre']),
          z.literal(''),
          z.null(),
        ])
        .optional()
        .transform((valeur) => (valeur ? valeur : null)),
      date_document: dateChamp,
      cote: z
        .union([z.string(), z.null()])
        .optional()
        .transform((valeur) => (typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null)),
      fonds: z
        .union([z.string(), z.null()])
        .optional()
        .transform((valeur) => (typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null)),
      images: z
        .array(
          z.object({
            src: z.string().min(1),
            legende: z.string().min(1),
            credit: z.string().min(1),
          }),
        )
        .optional()
        .default([]),
      sources: z
        .array(
          z.object({
            titre: z.string().min(1),
            url: z.string().url(),
          }),
        )
        .default([]),
      image: imageSchema,
    })
    .superRefine((fiche, ctx) => {
      const aLatitude = fiche.latitude != null;
      const aLongitude = fiche.longitude != null;
      if (aLatitude !== aLongitude) {
        ctx.addIssue({
          code: 'custom',
          message: 'Renseignez la latitude et la longitude ensemble, ou laissez les deux vides.',
          path: ['latitude'],
        });
      }
    }),
});

export const collections = { fiches };
