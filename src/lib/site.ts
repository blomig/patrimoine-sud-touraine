import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { z } from 'astro/zod';
import { MODELES, type Categorie, type CategorieFiche, type CategorieId } from './categories';
import type { Theme } from './themes';

const themeSchema = z.object({
  id: z.string().min(1),
  libelle: z.string().min(1),
});

const themesSchema = z
  .object({
    categories: z
      .record(
        z.string(),
        z.object({
          libelle: z.string().min(1),
          themes: z.array(themeSchema).default([]),
        }),
      )
      .default({}),
  })
  .passthrough();

const siteSchema = z.object({
  titre: z.string().min(1),
  design: z.enum(['revue', 'carnet', 'musee']),
});

const associationSchema = z.object({
  id: z.string().min(1),
  nom: z.string().min(1),
  commune: z.string().min(1),
  insee: z.string().nullable().optional(),
  site: z.string().url().nullable().optional(),
  notes: z.string().min(1),
  sources: z.array(z.string().min(1)).default([]),
});

const associationsSchema = z.object({
  associations: z.array(associationSchema),
});

export type SiteConfig = z.infer<typeof siteSchema>;
export type Association = z.infer<typeof associationSchema>;
export type CatalogueThemes = Record<string, { libelle: string; themes: Theme[] }>;

function lireYaml(relatif: string): unknown {
  const fichier = path.join(process.cwd(), relatif);
  return loadYaml(fs.readFileSync(fichier, 'utf8'));
}

function echec(fichier: string, error: z.ZodError): never {
  const details = error.issues
    .map((issue) => `${issue.path.join('.') || '(racine)'} : ${issue.message}`)
    .join('\n');
  throw new Error(`Le fichier ${fichier} n'est pas valide.\n${details}`);
}

export function chargerSite(): SiteConfig {
  const resultat = siteSchema.safeParse(lireYaml('contenu/site.yml'));
  if (!resultat.success) echec('contenu/site.yml', resultat.error);
  return resultat.data;
}

export function chargerCatalogue(): CatalogueThemes {
  const resultat = themesSchema.safeParse(lireYaml('contenu/themes.yml'));
  if (!resultat.success) echec('contenu/themes.yml', resultat.error);
  return resultat.data.categories;
}

export function themesDe(categorie: string): Theme[] {
  return chargerCatalogue()[categorie]?.themes ?? [];
}

const illustrationSchema = z.object({
  legende: z.string().min(1),
  fichier: z.string().optional(),
  url: z.string().url(),
  auteur: z.string().min(1),
  licence: z.string().min(1),
});

const illustrationsSchema = z.object({
  categories: z.record(z.string(), illustrationSchema).default({}),
});

export type Illustration = z.infer<typeof illustrationSchema>;

export function chargerIllustrations(): Record<string, Illustration> {
  const resultat = illustrationsSchema.safeParse(lireYaml('contenu/categories.yml'));
  if (!resultat.success) echec('contenu/categories.yml', resultat.error);
  return resultat.data.categories;
}

export function listeCategories(): Categorie[] {
  const catalogue = chargerCatalogue();
  const illustrations = chargerIllustrations();
  return MODELES.map((modele) => ({
    ...modele,
    titre: catalogue[modele.id]?.libelle ?? modele.titre,
    illustration: illustrations[modele.id],
  }));
}

export function categorieParId(id: string): Categorie | undefined {
  return listeCategories().find((categorie) => categorie.id === id);
}

export function chargerAssociations(): Association[] {
  const resultat = associationsSchema.safeParse(lireYaml('contenu/associations.yml'));
  if (!resultat.success) echec('contenu/associations.yml', resultat.error);
  return resultat.data.associations;
}

export type { CategorieFiche, CategorieId };
