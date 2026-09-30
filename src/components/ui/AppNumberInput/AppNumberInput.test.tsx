import { type ReactNode, useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import "../../../styles/index.css";
import AppButton from "../AppButton/AppButton.tsx";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppNumberInput, { type AppNumberInputProps } from "./AppNumberInput.tsx";

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

function WithLabels({ children }: { children: ReactNode }) {
	return <DefaultLabelsContext value={DEFAULT_LABELS}>{children}</DefaultLabelsContext>;
}

function StatefulInput({ value: initialValue = null, onChange, ...props }: Partial<AppNumberInputProps>) {
	const [value, setValue] = useState(initialValue);

	return (
		<>
			<AppNumberInput
				name="chance"
				label="Chance"
				{...props}
				value={value}
				onChange={(next) => {
					onChange?.(next);
					setValue(next);
				}}
			/>
			<AppButton text="Reset" onClick={() => setValue(null)} />
		</>
	);
}

async function setup(overrides: Partial<AppNumberInputProps> = {}) {
	const onChange = vi.fn();
	const screen = await render(<StatefulInput onChange={onChange} {...overrides} />, { wrapper: WithLabels });
	return {
		screen,
		onChange,
		input: screen.getByRole("spinbutton"),
		increase: screen.getByRole("button", { name: "Increase" }),
		decrease: screen.getByRole("button", { name: "Decrease" }),
	};
}

afterEach(() => {
	vi.useRealTimers();
});

test("is announced as a spin button named by its label", async () => {
	const { screen } = await setup();

	await expect.element(screen.getByRole("spinbutton", { name: "Chance" })).toBeVisible();
});

test("tells assistive technology the value and its limits", async () => {
	const { input } = await setup({ value: 25, min: 0, max: 100 });

	await expect.element(input).toHaveAttribute("aria-valuenow", "25");
	await expect.element(input).toHaveAttribute("aria-valuemin", "0");
	await expect.element(input).toHaveAttribute("aria-valuemax", "100");
});

test("reports what the player types as a number", async () => {
	const { input, onChange } = await setup();

	await input.fill("25");

	expect(onChange).toHaveBeenLastCalledWith(25);
	await expect.element(input).toHaveAttribute("aria-valuenow", "25");
});

test("reports an emptied field as no value", async () => {
	const { input, onChange } = await setup({ value: 25 });

	await input.fill("");

	expect(onChange).toHaveBeenLastCalledWith(null);
});

test("ignores letters and symbols", async () => {
	const { input } = await setup();

	await input.click();
	await userEvent.keyboard("2a5%");

	await expect.element(input).toHaveValue("25");
});

test.each([
	["takes no minus sign when the minimum is 0", 0, "5"],
	["takes a minus sign when the minimum is below 0", -10, "-5"],
])("%s", async (_, min, expected) => {
	const { input } = await setup({ min });

	await input.click();
	await userEvent.keyboard("-5");

	await expect.element(input).toHaveValue(expected);
});

test.each([
	["stops at the step's decimals", 0.1, "1.2"],
	["takes no decimals when the step is whole", 1, "125"],
])("%s", async (_, step, expected) => {
	const { input } = await setup({ step });

	await input.click();
	await userEvent.keyboard("1.25");

	await expect.element(input).toHaveValue(expected);
});

test("reads a comma as the decimal point, and shows a point once the field loses focus", async () => {
	const { input, onChange } = await setup({ step: 0.1 });

	await input.fill("2,5");

	expect(onChange).toHaveBeenLastCalledWith(2.5);
	await expect.element(input).toHaveValue("2,5");

	await userEvent.tab();

	await expect.element(input).toHaveValue("2.5");
});

test("keeps a half-typed number while the player types", async () => {
	const { input } = await setup({ min: -10, step: 0.1 });

	await input.click();
	await userEvent.keyboard("-");
	await expect.element(input).toHaveValue("-");

	await userEvent.keyboard("1.");
	await expect.element(input).toHaveValue("-1.");
});

test.each([
	["above the maximum", "500", "100"],
	["below the minimum", "5", "10"],
])("brings a typed value %s back inside the range when the field loses focus", async (_, typed, expected) => {
	const { input, onChange } = await setup({ min: 10, max: 100 });
	await input.fill(typed);

	await userEvent.tab();

	await expect.element(input).toHaveValue(expected);
	expect(onChange).toHaveBeenLastCalledWith(Number(expected));
});

test("Enter brings a typed value back inside the range", async () => {
	const { input } = await setup({ min: 0, max: 100 });
	await input.fill("500");

	await userEvent.keyboard("{Enter}");

	await expect.element(input).toHaveValue("100");
});

test("leaves an out-of-range value from the form alone until the player edits it", async () => {
	const { input, onChange } = await setup({ value: 150, min: 0, max: 100 });

	await input.click();
	await userEvent.tab();

	await expect.element(input).toHaveValue("150");
	expect(onChange).not.toHaveBeenCalled();
});

test("shows a value the form sets, even while the player is typing", async () => {
	const { screen, input } = await setup();
	await input.fill("12");

	(screen.getByRole("button", { name: "Reset" }).element() as HTMLButtonElement).click();

	await expect.element(input).toHaveValue("");
});

test("the + and − buttons step by the step", async () => {
	const { input, increase, decrease, onChange } = await setup({ value: 10, step: 5 });

	await increase.click();
	await expect.element(input).toHaveValue("15");
	expect(onChange).toHaveBeenLastCalledWith(15);

	await decrease.click();
	await decrease.click();
	await expect.element(input).toHaveValue("5");
});

test.each([
	["up", "Increase", "25"],
	["down", "Decrease", "20"],
])("steps %s onto the step grid from a value between steps", async (_, button, expected) => {
	const { screen, input } = await setup({ value: 23, step: 5 });

	await screen.getByRole("button", { name: button }).click();

	await expect.element(input).toHaveValue(expected);
});

test.each([
	["at 0", {}, "0"],
	["at the minimum when 0 is below it", { min: 10 }, "10"],
])("stepping an empty field starts %s", async (_, props, expected) => {
	const { input, increase } = await setup(props);

	await increase.click();

	await expect.element(input).toHaveValue(expected);
});

test("steps decimals without floating-point noise", async () => {
	const { input, increase } = await setup({ value: 0.2, step: 0.1 });

	await increase.click();

	await expect.element(input).toHaveValue("0.3");
});

test.each([
	["{ArrowUp}", "11"],
	["{ArrowDown}", "9"],
	["{Shift>}{ArrowUp}{/Shift}", "20"],
	["{Shift>}{ArrowDown}{/Shift}", "0"],
	["{PageUp}", "20"],
	["{PageDown}", "0"],
])("%s steps the value to %s", async (keys, expected) => {
	const { input } = await setup({ value: 10 });
	await input.click();

	await userEvent.keyboard(keys);

	await expect.element(input).toHaveValue(expected);
});

test("Page Up takes the large step it is given", async () => {
	const { input } = await setup({ value: 0, largeStep: 25 });
	await input.click();

	await userEvent.keyboard("{PageUp}");

	await expect.element(input).toHaveValue("25");
});

test("disables the button that would step past a limit", async () => {
	const { increase, decrease } = await setup({ value: 100, min: 0, max: 100 });

	await expect.element(increase).toBeDisabled();
	await expect.element(decrease).toBeEnabled();
});

test("holding a button keeps stepping, and letting go stops it", async () => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
	const { input, increase } = await setup({ value: 0 });
	const button = increase.element();
	button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));

	await vi.advanceTimersByTimeAsync(400);
	await expect.element(input).toHaveValue("1");
	await vi.advanceTimersByTimeAsync(60);
	await expect.element(input).toHaveValue("2");
	await vi.advanceTimersByTimeAsync(60);
	await expect.element(input).toHaveValue("3");

	button.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, button: 0, pointerType: "mouse" }));
	button.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
	await vi.advanceTimersByTimeAsync(1000);

	await expect.element(input).toHaveValue("3");
});

test("clicking a button puts focus in the field, so the arrow keys work next", async () => {
	const { input, increase } = await setup({ value: 10 });

	await increase.click();

	await expect.element(input).toHaveFocus();
});

test("the buttons are not Tab stops: the arrow keys do their job", async () => {
	const { screen, input } = await setup({ value: 10 });
	await input.click();

	await userEvent.tab();

	await expect.element(screen.getByRole("button", { name: "Reset" })).toHaveFocus();
});

test("announces a value stepped while focus is outside the field", async () => {
	const { screen, increase } = await setup({ value: 25 });

	(increase.element() as HTMLButtonElement).click();

	await expect.element(screen.getByRole("status").filter({ hasText: "26" })).toBeInTheDocument();
});

test.each([
	["the field is read-only", { readOnly: true }],
	["the field is disabled", { disabled: true }],
	["hasSteppers is false", { hasSteppers: false }],
])("offers no buttons when %s", async (_, props) => {
	const { increase, decrease } = await setup({ value: 25, ...props });

	await expect.element(increase).not.toBeInTheDocument();
	await expect.element(decrease).not.toBeInTheDocument();
});

test("a read-only field ignores the arrow keys", async () => {
	const { input, onChange } = await setup({ value: 25, readOnly: true });
	await input.click();

	await userEvent.keyboard("{ArrowUp}");

	await expect.element(input).toHaveValue("25");
	expect(onChange).not.toHaveBeenCalled();
});

test("shows the range under the field and reads it with it", async () => {
	const { screen, input } = await setup({ value: 25, min: 0, max: 100 });

	await expect.element(screen.getByText("0–100")).toBeVisible();
	await expect.element(input).toHaveAccessibleDescription("0–100");
});

test("shows the hint it is given instead of the range", async () => {
	const { input } = await setup({ value: 25, min: 0, max: 100, hint: "Whole percent" });

	await expect.element(input).toHaveAccessibleDescription("Whole percent");
});

test("the clear button empties the field to no value", async () => {
	const { screen, input, onChange } = await setup({ value: 25, isClearable: true });

	await screen.getByRole("button", { name: "Clear" }).click();

	await expect.element(input).toHaveValue("");
	expect(onChange).toHaveBeenLastCalledWith(null);
});

test("uses the button labels it is given", async () => {
	const { screen } = await setup({ increaseLabel: "Add one", decreaseLabel: "Take one away" });

	await expect.element(screen.getByRole("button", { name: "Add one" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Take one away" })).toBeVisible();
});
