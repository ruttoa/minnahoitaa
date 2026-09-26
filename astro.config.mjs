import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { formsPlugin } from "@emdash-cms/plugin-forms";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { marketingBlocksPlugin } from "marketing-blocks-plugin";

export default defineConfig({
	output: "server",
	adapter: cloudflare(),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	i18n: {
		defaultLocale: "fi",
		locales: ["fi", "en"],
		fallback: { en: "fi" },
		routing: { prefixDefaultLocale: false },
	},
	// 301s from the old Webador site's URLs. /palvelut carries over unchanged.
	redirects: {
		"/hinnasto-2": { status: 301, destination: "/hinnasto" },
		"/kuvagalleria": { status: 301, destination: "/galleria" },
		"/ota-yhteyttae": { status: 301, destination: "/ota-yhteytta" },
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto" }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [formsPlugin({ defaultSpamProtection: "honeypot" }), marketingBlocksPlugin()],
		}),
	],
	vite: {
		define: {
			// EmDash's admin builds draft-preview links from this pattern (default
			// `/{collection}/{id}`, i.e. /pages/<id> -- a route this site doesn't
			// have). `{locale}` is empty for fi, "en" for English, so this yields
			// /<id> and /en/<id>, both served by the [...slug] catch-all (which
			// accepts an entry id as well as a slug).
			"import.meta.env.EMDASH_PREVIEW_PATH_PATTERN": JSON.stringify("/{locale}/{id}"),
		},
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@use "abstracts" as *;`,
					loadPaths: [fileURLToPath(new URL("./src/styles", import.meta.url))],
				},
			},
		},
	},
	devToolbar: { enabled: false },
});
