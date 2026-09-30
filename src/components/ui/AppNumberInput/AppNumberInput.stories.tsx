import { CoinsIcon, HourglassIcon, PercentIcon, ScalesIcon, TrendUpIcon } from "@phosphor-icons/react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";

import { APP_FILL_OUTLINE } from "../../../constants/styles/fill.ts";
import { APP_RADII } from "../../../constants/styles/radius.ts";
import { APP_SIZES } from "../../../constants/styles/size.ts";
import { APP_VARIANT_NEUTRAL } from "../../../constants/styles/variant.ts";
import AppButton from "../AppButton/AppButton.tsx";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppNumberInput, { type AppNumberInputProps } from "./AppNumberInput.tsx";

const ICONS = { none: undefined, PercentIcon, CoinsIcon, HourglassIcon, ScalesIcon, TrendUpIcon };

const DEFAULT_LABELS = {
	confirm: "Confirm",
	cancel: "Cancel",
	close: "Close",
	optional: "(optional)",
	clear: "Clear",
	loading: "Loading…",
	showPassword: "Show password",
	hidePassword: "Hide password",
	increase: "Increase",
	decrease: "Decrease",
};

function StatefulNumberInput({ value: initialValue, onChange, ...props }: AppNumberInputProps) {
	const [value, setValue] = useState(initialValue);

	return (
		<AppNumberInput
			{...props}
			value={value}
			onChange={(next) => {
				onChange(next);
				setValue(next);
			}}
		/>
	);
}

const withDefaultLabels: Decorator = (Story) => (
	<DefaultLabelsContext value={DEFAULT_LABELS}>
		<Story />
	</DefaultLabelsContext>
);

const meta = {
	component: AppNumberInput,
	decorators: [withDefaultLabels],
	parameters: {
		docs: {
			description: {
				component:
					"A text input for a number. The value is a `number`, or `null` while the field is empty. The − and + buttons step by `step`, and holding one keeps stepping; from the keyboard, the arrow keys step, and Shift with an arrow, or Page Up and Page Down, take a `largeStep`. Letters are ignored, a minus sign only goes in when `min` allows it, and the decimals stop at `step`'s. A typed value outside `min`–`max` comes back inside the range when the field loses focus or on Enter. Everything else, label, description, error, suffix, sizes, comes from the text input.",
			},
		},
	},
	args: {
		name: "chance",
		label: "Chance",
		value: 25,
		onChange: fn(),
	},
	argTypes: {
		value: { control: "number" },
		min: { control: "number" },
		max: { control: "number" },
		step: { control: "number" },
		largeStep: { control: "number" },
		maxDecimals: { control: "number" },
		hint: { control: "text" },
		suffix: { control: "text" },
		description: { control: "text" },
		error: { control: "text" },
		placeholder: { control: "text" },
		size: { control: "inline-radio", options: APP_SIZES, table: { type: { summary: "AppSize" } } },
		radius: { control: "inline-radio", options: APP_RADII, table: { type: { summary: "AppRadius" } } },
		startIcon: { control: "select", options: Object.keys(ICONS), mapping: ICONS },
		isOptional: { control: "boolean" },
		isClearable: { control: "boolean" },
		isLoading: { control: "boolean" },
		disabled: { control: "boolean" },
		readOnly: { control: "boolean" },
	},
	render: function Render(args) {
		const [, updateArgs] = useArgs();

		return (
			<div className="w-80">
				<AppNumberInput
					{...args}
					onChange={(value) => {
						args.onChange(value);
						updateArgs({ value });
					}}
				/>
			</div>
		);
	},
} satisfies Meta<typeof AppNumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
	args: { min: 0, max: 100, suffix: "%" },
};

export const EventForm: Story = {
	parameters: { controls: { include: ["size", "radius"] } },
	render: (args) => (
		<form
			className="flex w-[34rem] max-w-full flex-col gap-6 rounded-lg border border-border bg-surface p-6 shadow-sm"
			noValidate
			onSubmit={(event) => event.preventDefault()}
		>
			<div className="flex flex-col gap-1">
				<h2>Harvest festival</h2>
				<p className="text-small text-muted">
					How often the event fires, and what it gives. Arrow keys step, and Shift with an arrow takes ten steps.
				</p>
			</div>
			<div className="grid grid-cols-2 gap-x-5 gap-y-6">
				<StatefulNumberInput
					name="chance"
					label="Chance"
					value={25}
					min={0}
					max={100}
					suffix="%"
					description="How likely the event is to fire each year."
					size={args.size}
					radius={args.radius}
					onChange={args.onChange}
				/>
				<StatefulNumberInput
					name="duration"
					label="Duration"
					value={12}
					min={1}
					max={120}
					suffix="months"
					startIcon={HourglassIcon}
					size={args.size}
					radius={args.radius}
					onChange={args.onChange}
				/>
				<StatefulNumberInput
					name="reward"
					label="Gold reward"
					value={250}
					min={0}
					step={10}
					largeStep={100}
					startIcon={CoinsIcon}
					isOptional
					isClearable
					size={args.size}
					radius={args.radius}
					onChange={args.onChange}
				/>
				<StatefulNumberInput
					name="growth"
					label="Growth modifier"
					value={1.5}
					min={-1}
					max={1}
					step={0.05}
					startIcon={TrendUpIcon}
					error="Pick a modifier between -1 and 1."
					size={args.size}
					radius={args.radius}
					onChange={args.onChange}
				/>
			</div>
			<div className="flex justify-end gap-3 border-t border-border pt-5">
				<AppButton text="Cancel" variant={APP_VARIANT_NEUTRAL} fill={APP_FILL_OUTLINE} size={args.size} />
				<AppButton text="Save event" type="submit" size={args.size} />
			</div>
		</form>
	),
};

const STATES: { caption: string; props: Partial<AppNumberInputProps> }[] = [
	{ caption: "Empty", props: { value: null, placeholder: "For example, 25…" } },
	{ caption: "Filled", props: { value: 25 } },
	{ caption: "Range", props: { value: 25, min: 0, max: 100, suffix: "%" } },
	{ caption: "At the maximum", props: { value: 100, min: 0, max: 100, suffix: "%" } },
	{ caption: "Negatives and decimals", props: { label: "Modifier", value: -0.25, min: -1, max: 1, step: 0.05 } },
	{ caption: "Without steppers", props: { label: "Random seed", value: 48213, hasSteppers: false } },
	{ caption: "Description", props: { value: 25, description: "How likely the event is to fire each year." } },
	{ caption: "Error", props: { value: 0, error: "A chance of 0 means the event never fires." } },
	{ caption: "Loading", props: { value: 25, isLoading: true } },
	{
		caption: "Optional and clearable",
		props: { label: "Gold reward", value: 250, step: 10, startIcon: CoinsIcon, isOptional: true, isClearable: true },
	},
	{ caption: "Read-only", props: { value: 25, suffix: "%", readOnly: true } },
	{ caption: "Disabled", props: { value: 25, suffix: "%", disabled: true } },
];

export const States: Story = {
	parameters: { controls: { include: ["size", "radius"] } },
	render: (args) => (
		<div className="grid w-[52rem] max-w-full grid-cols-3 gap-x-8 gap-y-7">
			{STATES.map(({ caption, props }) => (
				<figure key={caption} className="flex min-w-0 flex-col gap-3 border-t border-border pt-3">
					<figcaption className="text-caption text-muted">{caption}</figcaption>
					<StatefulNumberInput
						name={caption}
						label="Chance"
						value={null}
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

export const Stepping: Story = {
	args: { label: "Gold reward", value: 90, min: 0, max: 1000, step: 10, startIcon: CoinsIcon },
	render: (args) => (
		<div className="w-80">
			<StatefulNumberInput {...args} />
		</div>
	),
	play: async ({ canvas, userEvent, step }) => {
		const field = canvas.getByRole("spinbutton", { name: "Gold reward" });

		await step("The + button adds one step", async () => {
			await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
			await expect(field).toHaveValue("100");
		});
		await step("The arrow keys step from the keyboard", async () => {
			await userEvent.keyboard("{ArrowUp}");
			await expect(field).toHaveValue("110");
		});
		await step("Shift with an arrow takes ten steps", async () => {
			await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
			await expect(field).toHaveValue("210");
		});
		await step("A value past the maximum comes back to it when the field loses focus", async () => {
			await userEvent.clear(field);
			await userEvent.type(field, "5000");
			await userEvent.tab();
			await expect(field).toHaveValue("1000");
		});
	},
};

export const Sizes: Story = {
	parameters: { controls: { include: ["radius"] } },
	render: (args) => (
		<div className="flex w-80 flex-col gap-5">
			{APP_SIZES.map((size) => (
				<div key={size} className="flex items-end gap-2">
					<div className="min-w-0 flex-1">
						<StatefulNumberInput
							name={`chance-${size}`}
							label={`Chance (${size})`}
							value={25}
							min={0}
							suffix="%"
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
				<StatefulNumberInput
					key={radius}
					name={`reward-${radius}`}
					label={`Gold reward (${radius})`}
					value={250}
					min={0}
					step={10}
					startIcon={CoinsIcon}
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
		label: "How much gold the country receives each month while the festival lasts",
		value: 12500,
		min: 0,
		max: 100000,
		step: 100,
		suffix: "gold per month",
		description: "Paid at the start of every month. Set it to 0 to give nothing.",
		error: "That's more than any country earns in a year. Pick a smaller amount so the event stays fair.",
		startIcon: CoinsIcon,
		isOptional: true,
		isClearable: true,
		isLoading: true,
	},
};
