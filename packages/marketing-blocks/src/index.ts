/**
 * Marketing blocks plugin (site-local native plugin package).
 *
 * Registers the five marketing block types so editors can insert and edit them
 * in the admin's Portable Text editor. Block Kit `fields` describe the form
 * shown when inserting or editing a block.
 *
 * Constraints worth knowing:
 *
 * - Block Kit has no "object group" element, so nested object shapes (e.g. a
 *   CTA's { label, url }) are flattened to sibling fields like ctaLabel and
 *   ctaUrl. The site-side renderer reads the flat keys.
 * - Repeater sub-fields are scalar only: text_input, number_input, select,
 *   toggle. Nested repeaters are not allowed -- list-of-strings becomes a
 *   single multiline text field, split on newline at render time (see
 *   Pricing.astro for the pattern).
 * - Images: the `media_picker` element (Hero) stores only the picked file's URL,
 *   not a media id/size/alt, and isn't allowed inside `repeater` sub-fields.
 *
 * Site-side rendering: the descriptor's `componentsEntry` (./astro) exports
 * `blockComponents`, which EmDash auto-wires into <PortableText>.
 */

import { definePlugin } from "emdash";
import type { PluginDefinition, PluginDescriptor } from "emdash";

import { version } from "../package.json";

const ICON_OPTIONS = [
	{ label: "Pets (paw)", value: "pets" },
	{ label: "Cleaning", value: "cleaning" },
	{ label: "Garden", value: "garden" },
	{ label: "Lightning", value: "zap" },
	{ label: "Shield", value: "shield" },
	{ label: "Users", value: "users" },
	{ label: "Chart", value: "chart" },
	{ label: "Code", value: "code" },
	{ label: "Globe", value: "globe" },
	{ label: "Heart", value: "heart" },
	{ label: "Star", value: "star" },
	{ label: "Check", value: "check" },
	{ label: "Lock", value: "lock" },
	{ label: "Clock", value: "clock" },
	{ label: "Cloud", value: "cloud" },
];

const definition: PluginDefinition = {
	id: "marketing-blocks",
	version,

	admin: {
		portableTextBlocks: [
			{
				type: "marketing.hero",
				label: "Hero",
				category: "Sections",
				description: "Headline section with text, list, CTAs and an image/icon area",
				fields: [
					{ type: "text_input", action_id: "headline", label: "Headline" },
					{
						type: "select",
						action_id: "headingLevel",
						label: "Heading level",
						options: [
							{ label: "H1 (page title)", value: "h1" },
							{ label: "H2", value: "h2" },
						],
						initial_value: "h1",
					},
					{
						type: "select",
						action_id: "icon",
						label: "Icon (optional)",
						options: [{ label: "None", value: "none" }, ...ICON_OPTIONS],
						initial_value: "none",
					},
					{
						type: "text_input",
						action_id: "subheadline",
						label: "Text (a line break starts a new paragraph)",
						multiline: true,
					},
					{
						type: "repeater",
						action_id: "list",
						label: "List",
						item_label: "Item",
						fields: [{ type: "text_input", action_id: "text", label: "Text" }],
					},
					{ type: "text_input", action_id: "primaryCtaLabel", label: "Primary CTA label" },
					{ type: "text_input", action_id: "primaryCtaUrl", label: "Primary CTA URL" },
					{
						type: "text_input",
						action_id: "secondaryCtaLabel",
						label: "Secondary CTA label",
					},
					{ type: "text_input", action_id: "secondaryCtaUrl", label: "Secondary CTA URL" },
					{ type: "toggle", action_id: "centered", label: "Center the layout" },
					{ type: "toggle", action_id: "dark", label: "Dark background band" },
					{ type: "toggle", action_id: "white", label: "White background band" },
					{ type: "toggle", action_id: "showImage", label: "Show image area" },
					{
						type: "select",
						action_id: "mediaShape",
						label: "Image area shape",
						options: [
							{ label: "Portrait (hero)", value: "portrait" },
							{ label: "Wide (section)", value: "wide" },
						],
						initial_value: "portrait",
					},
					{ type: "toggle", action_id: "mediaLeft", label: "Image area on the left" },
					// Value is the picked asset's URL string (same as the text input this
					// replaced, so older content keeps working).
					{ type: "media_picker", action_id: "imageUrl", label: "Image (optional)", mime_type_filter: "image/" },
					{ type: "text_input", action_id: "imageAlt", label: "Image alt text" },
					{
						type: "text_input",
						action_id: "anchor",
						label: "Anchor id (optional, for #links)",
					},
				],
			},

			{
				type: "marketing.contact",
				label: "Contact",
				category: "Sections",
				description: "Company details (from Yrityksen tiedot) beside a site form",
				fields: [
					{
						type: "text_input",
						action_id: "note",
						label: "Text above the contact details",
						multiline: true,
					},
					{ type: "text_input", action_id: "formHeading", label: "Form heading" },
					{
						type: "text_input",
						action_id: "formId",
						label: "Form id (optional)",
						placeholder: "yhteydenotto / contact -- empty = the form for the page language",
					},
				],
			},

			{
				type: "marketing.features",
				label: "Features",
				category: "Sections",
				description: "Grid of feature cards with icons",
				fields: [
					{ type: "text_input", action_id: "headline", label: "Headline" },
					{
						type: "text_input",
						action_id: "subheadline",
						label: "Subheadline",
						multiline: true,
					},
					{
						type: "repeater",
						action_id: "features",
						label: "Features",
						item_label: "Feature",
						min_items: 1,
						max_items: 12,
						fields: [
							{
								type: "select",
								action_id: "icon",
								label: "Icon",
								options: ICON_OPTIONS,
							},
							{ type: "text_input", action_id: "title", label: "Title" },
							{
								type: "text_input",
								action_id: "description",
								label: "Description",
								multiline: true,
							},
							{ type: "text_input", action_id: "linkUrl", label: "Link URL (optional)" },
							{ type: "text_input", action_id: "linkLabel", label: "Link label" },
						],
					},
				],
			},

			{
				type: "marketing.testimonials",
				label: "Testimonials",
				category: "Sections",
				description: "Customer testimonial cards",
				fields: [
					{ type: "text_input", action_id: "headline", label: "Headline" },
					{
						type: "repeater",
						action_id: "testimonials",
						label: "Testimonials",
						item_label: "Testimonial",
						min_items: 1,
						fields: [
							{ type: "text_input", action_id: "quote", label: "Quote", multiline: true },
							{ type: "text_input", action_id: "author", label: "Author name" },
							{ type: "text_input", action_id: "role", label: "Role / title" },
							{ type: "text_input", action_id: "company", label: "Company" },
						],
					},
				],
			},

			{
				type: "marketing.pricing",
				label: "Pricing",
				category: "Sections",
				description: "Pricing plan comparison cards",
				fields: [
					{ type: "text_input", action_id: "headline", label: "Headline" },
					{
						type: "text_input",
						action_id: "badgeLabel",
						label: "Highlighted plan badge text",
						placeholder: "Suosituin",
					},
					{
						type: "repeater",
						action_id: "plans",
						label: "Plans",
						item_label: "Plan",
						min_items: 1,
						max_items: 6,
						fields: [
							{ type: "text_input", action_id: "name", label: "Plan name" },
							{
								type: "text_input",
								action_id: "price",
								label: "Price",
								placeholder: "$29 or Custom",
							},
							{
								type: "text_input",
								action_id: "period",
								label: "Period",
								placeholder: "/month",
							},
							{
								type: "text_input",
								action_id: "description",
								label: "Description",
								multiline: true,
							},
							{
								type: "text_input",
								action_id: "features",
								label: "Features (one per line)",
								multiline: true,
								placeholder: "Unlimited projects\nPriority support\nSSO",
							},
							{ type: "text_input", action_id: "ctaLabel", label: "CTA label" },
							{ type: "text_input", action_id: "ctaUrl", label: "CTA URL" },
							{ type: "toggle", action_id: "highlighted", label: "Highlight this plan" },
						],
					},
				],
			},

			{
				type: "marketing.faq",
				label: "FAQ",
				category: "Sections",
				description: "Frequently asked questions",
				fields: [
					{ type: "text_input", action_id: "headline", label: "Headline" },
					{
						type: "repeater",
						action_id: "items",
						label: "Questions",
						item_label: "Question",
						min_items: 1,
						fields: [
							{ type: "text_input", action_id: "question", label: "Question" },
							{
								type: "text_input",
								action_id: "answer",
								label: "Answer",
								multiline: true,
							},
						],
					},
				],
			},
		],
	},
};

export function marketingBlocksPlugin(): PluginDescriptor {
	return {
		id: "marketing-blocks",
		version,
		format: "native",
		entrypoint: "marketing-blocks-plugin",
		componentsEntry: "marketing-blocks-plugin/astro",
	};
}

export function createPlugin() {
	return definePlugin(definition);
}

export default createPlugin;
