export type Lang = 'fr' | 'en';

export type Dict = Record<string, string>;

export function translate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

export function resolveMessage(
  dicts: Record<Lang, Dict>,
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  const candidate = dicts[lang]?.[key] ?? dicts.fr[key];
  if (candidate === undefined) return key;
  return translate(candidate, params);
}
