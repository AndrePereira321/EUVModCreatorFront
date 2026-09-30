import { GlobeIcon, LinkIcon, LockIcon, MagnifyingGlassIcon, TagIcon, UserIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { APP_FILL_OUTLINE } from "../../../constants/styles/fill.ts";
import { APP_RADII } from "../../../constants/styles/radius.ts";
import { APP_SIZES } from "../../../constants/styles/size.ts";
import { APP_VARIANT_NEUTRAL } from "../../../constants/styles/variant.ts";
import AppButton from "../AppButton/AppButton.tsx";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppTextInput, { type AppTextInputProps } from "./AppTextInput.tsx";

const ICONS = { none: undefined, TagIcon, MagnifyingGlassIcon, UserIcon, GlobeIcon, LockIcon, LinkIcon };

const DEFAULT_LABELS = {
	confirm: "Confirm",
	cancel: "Cancel",
	close: "Close",
	optional: "(optional)",
	clear: "Clear",
	loading: "Loading…",
};

function StatefulTextInput({ value: initialValue, onChange, ...props }: AppTextInputProps) {
	const [value, setValue] = useState(initialValue);

	return (
		<AppTextInput
			{...props}
			value={value}
			onChange={(next) => {
				onChange(next);
				setValue(next);
			}}
		/>
	);
}

const meta = {
	component: AppTextInput,
	decorators: [
		(Story) => (
			<DefaultLabelsContext value={DEFAULT_LABELS}>
				<Story />
			</DefaultLabelsContext>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					"A one-line text field with its label, a description behind an info icon, and a footer for the error and the character count. Everything it shows comes in through props; the few words it adds itself come from `DefaultLabels`.",
			},
		},
	},
	args: {
		name: "modName",
		label: "Mod name",
		value: "",
		onChange: fn(),
	},
	argTypes: {
		size: { control: "inline-radio", options: APP_SIZES, table: { type: { summary: "AppSize" } } },
		radius: { control: "inline-radio", options: APP_RADII, table: { type: { summary: "AppRadius" } } },
		startIcon: { control: "select", options: Object.keys(ICONS), mapping: ICONS },
		endIcon: { control: "select", options: Object.keys(ICONS), mapping: ICONS },
		placeholder: { control: "text" },
		maxLength: { control: "number" },
		disabled: { control: "boolean" },
		readOnly: { control: "boolean" },
	},
	render: function Render(args) {
		const [, updateArgs] = useArgs();

		return (
			<div className="w-80">
				<AppTextInput
					{...args}
					onChange={(value) => {
						args.onChange(value);
						updateArgs({ value });
					}}
				/>
			</div>
		);
	},
} satisfies Meta<typeof AppTextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
	args: { placeholder: "For example, Iberian Rulers…" },
};

export const ProfileForm: Story = {
	parameters: { controls: { include: ["size", "radius"] } },
	render: (args) => (
		<form
			className="flex w-[34rem] max-w-full flex-col gap-6 rounded-lg border border-border bg-surface p-6 shadow-sm"
			onSubmit={(event) => event.preventDefault()}
		>
			<div className="flex flex-col gap-1">
				<h2>Your profile</h2>
				<p className="text-small text-muted">Everything here is optional. Other players see it on your profile.</p>
			</div>
			<StatefulTextInput
				name="displayName"
				label="Display name"
				value="Iberian Modder"
				description="Shown on your profile and your mods. Without one, players see your username."
				maxLength={40}
				isOptional
				size={args.size}
				radius={args.radius}
				onChange={args.onChange}
			/>
			<StatefulTextInput
				name="steam"
				label="Steam profile"
				value="my steam page"
				error="This isn't a link. Copy the address from your browser and paste it here."
				startIcon={LinkIcon}
				isOptional
				isClearable
				size={args.size}
				radius={args.radius}
				onChange={args.onChange}
			/>
			<StatefulTextInput
				name="forum"
				label="Paradox forum profile"
				value=""
				placeholder="Paste the link to your profile…"
				startIcon={LinkIcon}
				isOptional
				isClearable
				size={args.size}
				radius={args.radius}
				onChange={args.onChange}
			/>
			<StatefulTextInput
				name="discord"
				label="Discord server"
				value=""
				placeholder="Paste an invite link…"
				startIcon={LinkIcon}
				isOptional
				isClearable
				size={args.size}
				radius={args.radius}
				onChange={args.onChange}
			/>
			<div className="flex justify-end gap-3 border-t border-border pt-5">
				<AppButton text="Cancel" variant={APP_VARIANT_NEUTRAL} fill={APP_FILL_OUTLINE} size={args.size} />
				<AppButton text="Save profile" type="submit" size={args.size} />
			</div>
		</form>
	),
};

const STATES: { caption: string; props: Partial<AppTextInputProps> }[] = [
	{ caption: "Empty", props: { placeholder: "For example, Iberian Rulers…" } },
	{ caption: "Filled", props: { value: "Iberian Rulers" } },
	{ caption: "Optional", props: { label: "Short description", isOptional: true } },
	{ caption: "Description", props: { value: "Iberian Rulers", description: "Players see this name in the gallery." } },
	{ caption: "Error", props: { error: "Give your mod a name." } },
	{ caption: "Character count", props: { value: "Iberian Rulers", maxLength: 40 } },
	{ caption: "Near the limit", props: { value: "The Iberian Succession: Castile & Aragon", maxLength: 40 } },
	{ caption: "Loading", props: { value: "Iberian Rulers", isLoading: true } },
	{
		caption: "Clearable",
		props: { label: "Search your mods", value: "Iberian", startIcon: MagnifyingGlassIcon, isClearable: true },
	},
	{ caption: "Suffix", props: { label: "Chance", value: "25", suffix: "%" } },
	{ caption: "Read-only", props: { label: "Username", value: "iberian_modder", endIcon: LockIcon, readOnly: true } },
	{ caption: "Disabled", props: { value: "Iberian Rulers", disabled: true } },
];

export const States: Story = {
	parameters: { controls: { include: ["size", "radius"] } },
	render: (args) => (
		<div className="grid w-[52rem] max-w-full grid-cols-3 gap-x-8 gap-y-7">
			{STATES.map(({ caption, props }) => (
				<figure key={caption} className="flex min-w-0 flex-col gap-3 border-t border-border pt-3">
					<figcaption className="text-caption text-muted">{caption}</figcaption>
					<StatefulTextInput
						name={caption}
						label="Mod name"
						value=""
						size={args.size}
						radius={args.radius}
						onChange={args.onChange}
						{...props}
					/>
				</figure>
			))}
		</div>
	),
};

export const WithDescription: Story = {
	args: { description: "Players see this name in the gallery." },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole("button"));
		const tooltip = await canvas.findByRole("tooltip");
		await Promise.all(tooltip.getAnimations().map((animation) => animation.finished));
	},
};

export const Adornments: Story = {
	parameters: { controls: { include: ["radius"] } },
	render: (args) => (
		<div className="flex w-80 flex-col gap-5">
			{APP_SIZES.map((size) => (
				<StatefulTextInput
					key={size}
					name={`search-${size}`}
					label={`Search your mods (${size})`}
					value="Iberian"
					startIcon={MagnifyingGlassIcon}
					isClearable
					isLoading
					size={size}
					radius={args.radius}
					onChange={args.onChange}
				/>
			))}
		</div>
	),
};

export const Sizes: Story = {
	parameters: { controls: { include: ["radius"] } },
	render: (args) => (
		<div className="flex w-80 flex-col gap-5">
			{APP_SIZES.map((size) => (
				<div key={size} className="flex items-end gap-2">
					<div className="min-w-0 flex-1">
						<StatefulTextInput
							name={`modName-${size}`}
							label={`Mod name (${size})`}
							value="Iberian Rulers"
							size={size}
							radius={args.radius}
							onChange={args.onChange}
						/>
					</div>
					<AppButton text="Save" size={size} radius={args.radius} />
				</div>
			))}
		</div>
	),
};

export const Radii: Story = {
	parameters: { controls: { include: ["size"] } },
	render: (args) => (
		<div className="flex w-80 flex-col gap-5">
			{APP_RADII.map((radius) => (
				<StatefulTextInput
					key={radius}
					name={`search-${radius}`}
					label={`Search your mods (${radius})`}
					value="Iberian"
					startIcon={MagnifyingGlassIcon}
					isClearable
					size={args.size}
					radius={radius}
					onChange={args.onChange}
				/>
			))}
		</div>
	),
};

export const LongText: Story = {
	args: {
		label: "Name your mod the way it should appear on your profile and in the public gallery",
		value: "The Iberian Succession: new rulers for Castile, Aragon, Portugal and Navarre",
		description: "Keep it short enough to read at a glance. Other players search the gallery by this name.",
		error: "You already have a mod with this name. Pick a different one so you can tell them apart.",
		maxLength: 80,
		isOptional: true,
		isClearable: true,
		isLoading: true,
		startIcon: TagIcon,
		endIcon: GlobeIcon,
	},
};
