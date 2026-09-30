import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { APP_FILL_OUTLINE } from "../../../constants/styles/fill.ts";
import { APP_VARIANT_ERROR, APP_VARIANT_NEUTRAL } from "../../../constants/styles/variant.ts";
import AppButton from "../AppButton/AppButton.tsx";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppModal from "./AppModal.tsx";

const DEFAULT_LABELS = { confirm: "Confirm", cancel: "Cancel", close: "Close" };

const meta = {
	component: AppModal,
	decorators: [
		(Story) => (
			<DefaultLabelsContext value={DEFAULT_LABELS}>
				<Story />
			</DefaultLabelsContext>
		),
	],
	parameters: {
		layout: "fullscreen",
		docs: { story: { inline: false, iframeHeight: "480px" } },
	},
	args: {
		isOpen: true,
		title: "Leave without saving?",
		children: <p>You changed three values since you last saved. If you leave now, those changes are lost.</p>,
		onConfirmClicked: fn(),
		onCancelClicked: fn(),
		onClose: fn(),
	},
	argTypes: {
		children: { control: false },
		header: { control: false },
		footer: { control: false },
	},
	render: function Render(args) {
		const [, updateArgs] = useArgs();
		const close = () => updateArgs({ isOpen: false });

		return (
			<div className="p-4">
				<AppButton text="Open the modal" onClick={() => updateArgs({ isOpen: true })} />
				<AppModal
					{...args}
					onClose={() => {
						args.onClose?.();
						close();
					}}
					onCancelClicked={(event) => {
						args.onCancelClicked?.(event);
						close();
					}}
					onConfirmClicked={(event) => {
						args.onConfirmClicked?.(event);
						close();
					}}
				/>
			</div>
		);
	},
} satisfies Meta<typeof AppModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Phone: Story = {
	globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const LongTitle: Story = {
	args: { title: "Replace the starting ruler of every country that begins the game in Iberia?" },
};

export const LongContent: Story = {
	args: {
		title: "How to install your mod",
		children: (
			<div className="flex flex-col gap-3">
				{Array.from({ length: 12 }, (_, i) => (
					<p key={i}>
						Step {i + 1}. Follow this step before moving on to the next one, and check that the game still starts.
					</p>
				))}
			</div>
		),
	},
};

export const CustomHeader: Story = {
	args: {
		title: undefined,
		header: (
			<div className="flex flex-col gap-1">
				<h2>Make this mod public?</h2>
				<p className="text-small text-muted">Iberian Rulers</p>
			</div>
		),
		children: <p>Anyone will be able to find it in the gallery, download it, and copy it to make their own version.</p>,
	},
	parameters: { controls: { exclude: ["title"] } },
};

export const CustomFooter: Story = {
	args: {
		title: "Delete this mod?",
		children: <p>The mod and every change in it will be removed. This can't be undone.</p>,
		footer: (
			<>
				<AppButton text="Keep it" variant={APP_VARIANT_NEUTRAL} fill={APP_FILL_OUTLINE} />
				<AppButton text="Delete mod" variant={APP_VARIANT_ERROR} />
			</>
		),
	},
};
