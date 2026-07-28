import en from "./en.json";
import fi from "./fi.json";

export const locales = ["fi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fi";

const dictionaries = { fi, en } satisfies Record<Locale, typeof fi>;

export type TranslationKey = keyof typeof fi;

export function isLocale(value: string | undefined): value is Locale {
	return !!value && (locales as readonly string[]).includes(value);
}

export function useTranslations(locale: Locale | undefined) {
	const dict = dictionaries[locale ?? defaultLocale];
	return function t(key: TranslationKey): string {
		return dict[key] ?? fi[key] ?? key;
	};
}
