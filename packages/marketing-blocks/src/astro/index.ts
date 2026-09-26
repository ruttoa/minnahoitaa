/**
 * Astro component exports for the marketing-blocks plugin.
 *
 * Auto-wired via the `virtual:emdash/block-components` virtual module (the
 * descriptor's `componentsEntry`), so a plain <PortableText> resolves these
 * `_type`s with no manual `components` prop.
 */

import Contact from "./Contact.astro";
import FAQ from "./FAQ.astro";
import Features from "./Features.astro";
import Hero from "./Hero.astro";
import Pricing from "./Pricing.astro";
import Testimonials from "./Testimonials.astro";

export const blockComponents = {
	"marketing.hero": Hero,
	"marketing.features": Features,
	"marketing.testimonials": Testimonials,
	"marketing.pricing": Pricing,
	"marketing.faq": FAQ,
	"marketing.contact": Contact,
};
