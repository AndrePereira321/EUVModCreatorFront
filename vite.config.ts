import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		paraglideVitePlugin({
			project: "./i18n/project.inlang",
			outdir: "./i18n/paraglide",
			emitTsDeclarations: true,
		}),
	],
	resolve: {
		alias: {
			"@paraglide": `${import.meta.dirname}/i18n/paraglide`,
		},
	},
	server: {
		port: 8080,
	},
});
