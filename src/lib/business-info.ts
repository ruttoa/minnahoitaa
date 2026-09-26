import { getEmDashCollection } from "emdash";
import type { Locale } from "../i18n/ui";

// The `business_info` entry is needed twice on some pages (BaseLayout's
// LocalBusiness JSON-LD and the contact block). Memoize the query per request,
// keyed on the request's `Astro.locals` object, so it runs once.
const perRequest = new WeakMap<object, Map<Locale, ReturnType<typeof query>>>();

const query = (locale: Locale) => getEmDashCollection("business_info", { locale, limit: 1 });

export function getBusinessInfo(locals: object, locale: Locale) {
	let byLocale = perRequest.get(locals);
	if (!byLocale) perRequest.set(locals, (byLocale = new Map()));
	let result = byLocale.get(locale);
	if (!result) byLocale.set(locale, (result = query(locale)));
	return result;
}
