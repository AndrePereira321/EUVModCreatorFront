import { type ReactNode, useState } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import {
	APP_TEXT_INPUT_TYPE_EMAIL,
	APP_TEXT_INPUT_TYPE_PASSWORD,
	APP_TEXT_INPUT_TYPE_SEARCH,
	APP_TEXT_INPUT_TYPE_TEL,
	APP_TEXT_INPUT_TYPE_TEXT,
	APP_TEXT_INPUT_TYPE_URL,
} from "../../../constants/inputs.ts";

import "../../../styles/index.css";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppTextInput, { type AppTextInputBaseProps, type AppTextInputTypeProps } from "./AppTextInput.tsx";

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

type Overrides = Partial<AppTextInputBaseProps> & AppTextInputTypeProps;

function WithLabels({ children }: { children: ReactNode }) {
	return <DefaultLabelsContext value={DEFAULT_LABELS}>{children}</DefaultLabelsContext>;
}

function StatefulInput({ value: initialValue = "", onChange, ...props }: Overrides) {
	const [value, setValue] = useState(initialValue);

	return (
		<AppTextInput
			name="modName"
			label="Mod name"
			{...props}
			value={value}
			onChange={(next) => {
				onChange?.(next);
				setValue(next);
			}}
		/>
	);
}

async function setup(overrides: Overrides = {}) {
	const onChange = vi.fn();
	const screen = await render(<StatefulInput onChange={onChange} {...overrides} />, { wrapper: WithLabels });
	return { screen, onChange, input: screen.getByRole("textbox") };
}

test("is named by its label", async () => {
	const { screen } = await setup();

	await expect.element(screen.getByRole("textbox", { name: "Mod name" })).toBeVisible();
});

test("clicking a label focuses its own field, even when two fields share a name", async () => {
	const screen = await render(
		<>
			<StatefulInput name="link" label="Steam profile" />
			<StatefulInput name="link" label="Discord server" />
		</>,
		{ wrapper: WithLabels },
	);

	await screen.getByText("Discord server").click();

	await expect.element(screen.getByRole("textbox", { name: "Discord server" })).toHaveFocus();
});

test("reports what the player types", async () => {
	const { input, onChange } = await setup();

	await input.fill("Iberian Rulers");

	await expect.element(input).toHaveValue("Iberian Rulers");
	expect(onChange).toHaveBeenLastCalledWith("Iberian Rulers");
});

test("reads the description with the field", async () => {
	const { input } = await setup({ description: "Players see this name in the gallery." });

	await expect.element(input).toHaveAccessibleDescription("Players see this name in the gallery.");
});

test("shows the description when the info button is clicked", async () => {
	const { screen } = await setup({ description: "Players see this name in the gallery." });

	await screen.getByRole("button", { name: "Players see this name in the gallery." }).click();

	await expect.element(screen.getByRole("tooltip")).toBeVisible();
});

test("hides the description after a tap elsewhere, even when the tap didn't focus the button", async () => {
	const screen = await render(
		<>
			<StatefulInput description="Players see this name in the gallery." />
			<p className="mt-40">Elsewhere on the page</p>
		</>,
		{ wrapper: WithLabels },
	);
	const elsewhere = screen.getByText("Elsewhere on the page");
	await userEvent.hover(elsewhere);
	await expect.element(screen.getByRole("tooltip", { includeHidden: true })).not.toBeVisible();
	const infoButton = screen.getByRole("button", { name: "Players see this name in the gallery." });
	(infoButton.element() as HTMLButtonElement).click();
	await expect.element(screen.getByRole("tooltip")).toBeVisible();

	await elsewhere.click();

	await expect.element(screen.getByRole("tooltip", { includeHidden: true })).not.toBeVisible();
});

test("marks the field invalid and reads the error with it", async () => {
	const { input } = await setup({ error: "Give your mod a name." });

	await expect.element(input).toBeInvalid();
	await expect.element(input).toHaveAccessibleDescription("Give your mod a name.");
});

test("adds (optional) to the label", async () => {
	const { screen } = await setup({ label: "Short description", isOptional: true });

	await expect.element(screen.getByRole("textbox", { name: "Short description (optional)" })).toBeVisible();
});

test("counts the characters against the limit as the player types", async () => {
	const { screen, input } = await setup({ value: "Iberian", maxLength: 40 });
	await expect.element(screen.getByText("7/40")).toBeVisible();

	await input.fill("Iberian Rulers");

	await expect.element(screen.getByText("14/40")).toBeVisible();
});

test("stops accepting text at the limit", async () => {
	const { input } = await setup({ maxLength: 10 });

	await input.click();
	await userEvent.keyboard("Iberian Rulers");

	await expect.element(input).toHaveValue("Iberian Ru");
});

test("the clear button empties the field and puts focus back in it", async () => {
	const { screen, input, onChange } = await setup({ value: "Iberian", isClearable: true });

	await screen.getByRole("button", { name: "Clear" }).click();

	await expect.element(input).toHaveValue("");
	await expect.element(input).toHaveFocus();
	expect(onChange).toHaveBeenLastCalledWith("");
});

test.each([
	["the field is empty", { value: "" }],
	["the field is disabled", { value: "Iberian", disabled: true }],
	["the field is read-only", { value: "Iberian", readOnly: true }],
])("offers no clear button when %s", async (_, props) => {
	const { screen } = await setup({ isClearable: true, ...props });

	await expect.element(screen.getByRole("button", { name: "Clear" })).not.toBeInTheDocument();
});

test("announces loading to screen readers", async () => {
	const { screen } = await setup({ isLoading: true });

	await expect.element(screen.getByRole("status")).toHaveTextContent("Loading…");
});

test("reads the suffix with the field", async () => {
	const { input } = await setup({ label: "Chance", value: "25", suffix: "%" });

	await expect.element(input).toHaveAccessibleDescription("%");
});

test("shows the hint under the field and reads it with it", async () => {
	const { screen, input } = await setup({ hint: "Letters and spaces only" });

	await expect.element(screen.getByText("Letters and spaces only")).toBeVisible();
	await expect.element(input).toHaveAccessibleDescription("Letters and spaces only");
});

test("clicking the suffix focuses the field", async () => {
	const { screen, input } = await setup({ label: "Chance", suffix: "%" });

	await screen.getByText("%").click();

	await expect.element(input).toHaveFocus();
});

test("uses the labels it is given", async () => {
	const { screen } = await setup({
		value: "Iberian",
		isOptional: true,
		optionalLabel: "(not required)",
		isClearable: true,
		clearLabel: "Empty the field",
	});

	await expect.element(screen.getByRole("textbox", { name: "Mod name (not required)" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Empty the field" })).toBeVisible();
});

test.each([APP_TEXT_INPUT_TYPE_EMAIL, APP_TEXT_INPUT_TYPE_TEL, APP_TEXT_INPUT_TYPE_URL] as const)(
	"sets type=%s, so phones open the matching keyboard",
	async (type) => {
		const { input } = await setup({ type });

		await expect.element(input).toHaveAttribute("type", type);
	},
);

test("is announced as a search box when it searches", async () => {
	const { screen } = await setup({ type: APP_TEXT_INPUT_TYPE_SEARCH, label: "Search your mods" });

	await expect.element(screen.getByRole("searchbox", { name: "Search your mods" })).toBeVisible();
});

test.each([
	[APP_TEXT_INPUT_TYPE_TEXT, "off"],
	[APP_TEXT_INPUT_TYPE_SEARCH, "off"],
	[APP_TEXT_INPUT_TYPE_EMAIL, "email"],
	[APP_TEXT_INPUT_TYPE_TEL, "tel"],
	[APP_TEXT_INPUT_TYPE_URL, "url"],
] as const)("type=%s asks the browser for %s autofill by default", async (type, autoComplete) => {
	const { screen } = await setup({ type, label: "Contact" });

	await expect.element(screen.getByLabelText("Contact")).toHaveAttribute("autocomplete", autoComplete);
});

test.each([
	[APP_TEXT_INPUT_TYPE_EMAIL, "off"],
	[APP_TEXT_INPUT_TYPE_TEXT, "username"],
] as const)("type=%s takes the autofill it is given: %s", async (type, autoComplete) => {
	const { screen } = await setup({ type, autoComplete, label: "Contact" });

	await expect.element(screen.getByLabelText("Contact")).toHaveAttribute("autocomplete", autoComplete);
});

test("hides a password until the player asks to see it", async () => {
	const { screen } = await setup({
		type: APP_TEXT_INPUT_TYPE_PASSWORD,
		autoComplete: "current-password",
		label: "Password",
		value: "castile-aragon-1469",
	});
	const password = screen.getByLabelText("Password");
	await expect.element(password).toHaveAttribute("type", "password");

	await screen.getByRole("button", { name: "Show password" }).click();

	await expect.element(password).toHaveAttribute("type", "text");

	await screen.getByRole("button", { name: "Hide password" }).click();

	await expect.element(password).toHaveAttribute("type", "password");
});

test("keeps a shown password away from spellcheck, autocorrect and capitalisation", async () => {
	const { screen } = await setup({
		type: APP_TEXT_INPUT_TYPE_PASSWORD,
		autoComplete: "new-password",
		label: "Password",
	});

	await screen.getByRole("button", { name: "Show password" }).click();

	const password = screen.getByLabelText("Password");
	await expect.element(password).toHaveAttribute("spellcheck", "false");
	await expect.element(password).toHaveAttribute("autocorrect", "off");
	await expect.element(password).toHaveAttribute("autocapitalize", "none");
});

test("offers no way to show the password of a disabled field", async () => {
	const { screen } = await setup({
		type: APP_TEXT_INPUT_TYPE_PASSWORD,
		autoComplete: "current-password",
		value: "castile-aragon-1469",
		disabled: true,
	});

	await expect.element(screen.getByRole("button", { name: "Show password" })).not.toBeInTheDocument();
});

test("uses the password labels it is given", async () => {
	const { screen } = await setup({
		type: APP_TEXT_INPUT_TYPE_PASSWORD,
		autoComplete: "current-password",
		showPasswordLabel: "Reveal",
		hidePasswordLabel: "Conceal",
	});

	await screen.getByRole("button", { name: "Reveal" }).click();

	await expect.element(screen.getByRole("button", { name: "Conceal" })).toBeVisible();
});
