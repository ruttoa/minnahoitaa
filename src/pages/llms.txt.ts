import type { APIRoute } from "astro";
import { buildLlmsTxt } from "../lib/llms";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) =>
	new Response(await buildLlmsTxt(locals, "fi", url.origin), {
		headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
