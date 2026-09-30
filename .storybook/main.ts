import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	framework: "@storybook/react-vite",
	stories: [
		"../src/components/**/*.stories.@(ts|tsx)",
		{ directory: "../src/styles", files: "*.stories.@(ts|tsx)", titlePrefix: "styles" },
	],
	addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
	features: {
		backgrounds: false,
	},
};

export default config;
