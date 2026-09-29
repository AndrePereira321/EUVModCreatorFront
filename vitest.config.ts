import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

const browser = () => ({
	enabled: true,
	headless: true,
	provider: playwright(),
	instances: [{ browser: "chromium" as const }],
});

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			projects: [
				{
					test: {
						name: "unit",
						include: ["src/**/*.test.ts"],
						environment: "node",
					},
				},
				{
					test: {
						name: "browser",
						include: ["src/**/*.test.tsx"],
						browser: browser(),
					},
				},
				{
					plugins: [storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") })],
					test: {
						name: "storybook",
						browser: browser(),
					},
				},
			],
		},
	}),
);
