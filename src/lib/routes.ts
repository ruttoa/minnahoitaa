// Every CTA on the site resolves through here — see PLAN.md §3 "CTA rule".
// Never hardcode "/ota-yhteytta/" or "/en/contact/" anywhere else.
export const CONTACT_PATH = "ota-yhteytta";

export const ROUTE_SLUGS = {
	home: "",
	services: "palvelut",
	pricing: "hinnasto",
	gallery: "galleria",
	contact: CONTACT_PATH,
} as const;
