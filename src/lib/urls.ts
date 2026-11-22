/** Préfixe le chemin de base GitHub Pages (`/patrimoine-sud-touraine/`). */
/** Adresse absolue publiée, avec le chemin de base GitHub Pages. */
export function urlPublique(chemin: string): string {
  const origine = import.meta.env.SITE ?? 'https://blomig.github.io';
  return new URL(withBase(chemin), origine).href;
}

export function withBase(chemin: string): string {
  const base = import.meta.env.BASE_URL;
  if (/^https?:\/\//.test(chemin)) return chemin;
  const propre = chemin.startsWith('/') ? chemin.slice(1) : chemin;
  return `${base}${propre}`;
}

export function urlLicence(licence: string): string | null {
  const cle = licence.trim().toLowerCase();
  const table: Record<string, string> = {
    'cc by-sa 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
    'cc by-sa 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/deed.fr',
    'cc by-sa 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/deed.fr',
    'public domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
    'domaine public': 'https://creativecommons.org/publicdomain/mark/1.0/',
  };
  return table[cle] ?? null;
}
