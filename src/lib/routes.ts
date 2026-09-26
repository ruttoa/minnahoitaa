// Every CTA on the site resolves through here — see PLAN.md §3 "CTA rule".
// Never hardcode "/ota-yhteytta/" or "/en/contact/" anywhere else. CTA blocks
// in page content use the `@contact` link keyword, which the marketing-blocks
// plugin resolves through this constant (packages/marketing-blocks/src/astro/links.ts).
export const CONTACT_PATH = "ota-yhteytta";
