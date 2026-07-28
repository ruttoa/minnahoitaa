import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

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
		}),
	],
	vite: {
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
