import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { APP_FILLS } from "../../../constants/styles/fill.ts";
import { APP_RADII } from "../../../constants/styles/radius.ts";
import { APP_SIZES } from "../../../constants/styles/size.ts";
import { APP_VARIANTS } from "../../../constants/styles/variant.ts";
import AppButton from "./AppButton.tsx";

const meta = {
	component: AppButton,
	args: {
		text: "Save changes",
		onClick: fn(),
	},
	argTypes: {
		variant: { control: "inline-radio", options: APP_VARIANTS, table: { type: { summary: "AppVariant" } } },
		fill: { control: "inline-radio", options: APP_FILLS, table: { type: { summary: "AppFill" } } },
		size: { control: "inline-radio", options: APP_SIZES, table: { type: { summary: "AppSize" } } },
		radius: { control: "inline-radio", options: APP_RADII, table: { type: { summary: "AppRadius" } } },
		disabled: { control: "boolean" },
		type: { control: false },
	},
} satisfies Meta<typeof AppButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const VariantsByFill: Story = {
	parameters: { controls: { exclude: ["text", "variant", "fill"] } },
	render: (args) => (
		<div className="flex flex-col gap-3">
			{APP_FILLS.map((fill) => (
				<div key={fill} className="flex gap-3">
					{APP_VARIANTS.map((variant) => (
						<AppButton key={variant} {...args} text={variant} variant={variant} fill={fill} />
					))}
				</div>
			))}
		</div>
	),
};

export const Sizes: Story = {
	parameters: { controls: { exclude: ["text", "size"] } },
	render: (args) => (
		<div className="flex items-center gap-3">
			{APP_SIZES.map((size) => (
				<AppButton key={size} {...args} text={size} size={size} />
			))}
		</div>
	),
};

export const Radii: Story = {
	parameters: { controls: { exclude: ["text", "radius"] } },
	render: (args) => (
		<div className="flex items-center gap-3">
			{APP_RADII.map((radius) => (
				<AppButton key={radius} {...args} text={radius} radius={radius} />
			))}
		</div>
	),
};

export const Disabled: Story = {
	args: { disabled: true },
};
