import {
	ArrowCounterClockwiseIcon,
	DownloadSimpleIcon,
	FloppyDiskIcon,
	GearIcon,
	ShareNetworkIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { APP_FILL_GHOST } from "../../../constants/styles/fill.ts";
import { APP_VARIANT_NEUTRAL } from "../../../constants/styles/variant.ts";
import AppButton from "../AppButton/AppButton.tsx";
import AppTooltip from "./AppTooltip.tsx";

const TOOLBAR = [
	{ text: "Save", icon: FloppyDiskIcon },
	{ text: "Undo", icon: ArrowCounterClockwiseIcon },
	{ text: "Download", icon: DownloadSimpleIcon },
	{ text: "Share", icon: ShareNetworkIcon },
	{ text: "Settings", icon: GearIcon },
];

const meta = {
	component: AppTooltip,
	args: {
		text: "Get the mod's files and the steps to install them",
		isLabel: false,
		children: (triggerProps) => <AppButton {...triggerProps} text="Download" startIcon={DownloadSimpleIcon} />,
	},
	argTypes: {
		children: { control: false },
	},
} satisfies Meta<typeof AppTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

const openByHovering: Story["play"] = async ({ canvas, userEvent }) => {
	await userEvent.hover(canvas.getAllByRole("button")[0]);
	const tooltip = await canvas.findByRole("tooltip");
	await Promise.all(tooltip.getAnimations().map((animation) => animation.finished));
};

export const Playground: Story = {};

export const Open: Story = {
	play: openByHovering,
};

export const IconToolbar: Story = {
	parameters: { controls: { exclude: ["text", "isLabel"] } },
	render: () => (
		<div className="flex gap-1 pt-12">
			{TOOLBAR.map(({ text, icon }) => (
				<AppTooltip key={text} text={text} isLabel>
					{(triggerProps) => (
						<AppButton {...triggerProps} variant={APP_VARIANT_NEUTRAL} fill={APP_FILL_GHOST} startIcon={icon} />
					)}
				</AppTooltip>
			))}
		</div>
	),
	play: openByHovering,
};

export const NearTheEdge: Story = {
	args: { text: "This tooltip has no room above its button, so it opens below and stays on the screen" },
	parameters: { layout: "fullscreen" },
	render: (args) => (
		<div className="p-2">
			<AppTooltip {...args} />
		</div>
	),
	play: openByHovering,
};
