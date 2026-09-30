import type { Preview } from "@storybook/react-vite";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/noto-sans";

import "../src/styles/index.css";

const preview: Preview = {
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		a11y: { test: "error" },
	},
	globalTypes: {
		theme: {
			description: "Colour theme",
			toolbar: {
				title: "Theme",
				icon: "paintbrush",
				items: [
					{ value: "light", title: "Light", icon: "sun" },
					{ value: "dark", title: "Dark", icon: "moon" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		theme: "light",
	},
	decorators: [
		(Story, { globals, viewMode }) => {
			if (viewMode === "docs") {
				document.documentElement.removeAttribute("data-theme");
				return (
					<div data-theme={globals.theme} style={{ backgroundColor: "var(--background)", padding: "1rem" }}>
						<Story />
					</div>
				);
			}

			document.documentElement.dataset.theme = globals.theme;
			return <Story />;
		},
	],
};

export default preview;
