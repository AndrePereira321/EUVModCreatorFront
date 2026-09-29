import {
	ArrowRightIcon,
	CaretDownIcon,
	DownloadSimpleIcon,
	FloppyDiskIcon,
	GearIcon,
	XIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { APP_FILLS } from "../../../constants/styles/fill.ts";
import { APP_RADII } from "../../../constants/styles/radius.ts";
import { APP_SIZES } from "../../../constants/styles/size.ts";
import { APP_VARIANTS } from "../../../constants/styles/variant.ts";
import AppButton from "./AppButton.tsx";

const ICONS = { none: undefined, FloppyDiskIcon, DownloadSimpleIcon, GearIcon, XIcon, ArrowRightIcon, CaretDownIcon };

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
		startIcon: { control: "select", options: Object.keys(ICONS), mapping: ICONS },
		endIcon: { control: "select", options: Object.keys(ICONS), mapping: ICONS },
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

export const Icons: Story = {
	parameters: { controls: { exclude: ["text", "size", "startIcon", "endIcon"] } },
	render: (args) => (
		<div className="flex flex-col gap-3">
			{APP_SIZES.map((size) => (
				<div key={size} className="flex items-center gap-3">
					<AppButton {...args} size={size} text="Save" startIcon={FloppyDiskIcon} />
					<AppButton {...args} size={size} text="Next" endIcon={ArrowRightIcon} />
					<AppButton {...args} size={size} text="Download" startIcon={DownloadSimpleIcon} endIcon={CaretDownIcon} />
				</div>
			))}
		</div>
	),
};

export const IconOnly: Story = {
	parameters: { controls: { exclude: ["text", "fill", "size", "startIcon", "endIcon"] } },
	render: (args) => (
		<div className="flex flex-col gap-3">
			{APP_SIZES.map((size) => (
				<div key={size} className="flex items-center gap-3">
					{APP_FILLS.map((fill) => (
						<AppButton
							key={fill}
							{...args}
							text={undefined}
							size={size}
							fill={fill}
							startIcon={GearIcon}
							aria-label="Settings"
						/>
					))}
				</div>
			))}
		</div>
	),
};

export const LongLabel: Story = {
	args: { text: "Download the finished mod and its install instructions" },
	parameters: { controls: { exclude: ["startIcon", "endIcon"] } },
	render: (args) => (
		<div className="flex w-64 flex-col items-start gap-3">
			<AppButton {...args} startIcon={DownloadSimpleIcon} />
			<div className="flex w-full gap-2">
				<AppButton {...args} />
				<AppButton {...args} text={undefined} startIcon={XIcon} aria-label="Close" />
			</div>
		</div>
	),
};

export const Disabled: Story = {
	args: { disabled: true },
};
