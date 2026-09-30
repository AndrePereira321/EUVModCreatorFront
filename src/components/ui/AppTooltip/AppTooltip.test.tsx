import { ArrowCounterClockwiseIcon, GearIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { type Locator, userEvent } from "vitest/browser";

import "../../../styles/index.css";
import AppButton from "../AppButton/AppButton.tsx";
import AppModal from "../AppModal/AppModal.tsx";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppTooltip, { type AppTooltipProps } from "./AppTooltip.tsx";

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

function setup(props: Partial<AppTooltipProps> = {}) {
	return render(
		<>
			<AppTooltip text="Settings" isLabel {...props}>
				{(triggerProps) => <AppButton {...triggerProps} startIcon={GearIcon} />}
			</AppTooltip>
			<p className="mt-40">Elsewhere on the page</p>
		</>,
	);
}

async function parkPointerAway(screen: Awaited<ReturnType<typeof setup>>) {
	await screen.getByText("Elsewhere on the page").hover();
	await expect.element(screen.getByRole("tooltip", { includeHidden: true })).not.toBeVisible();
}

function tap(trigger: Locator) {
	(trigger.element() as HTMLButtonElement).click();
}

function FocusFromCode() {
	const settingsRef = useRef<HTMLButtonElement>(null);

	return (
		<>
			<AppButton text="Open" onClick={() => settingsRef.current?.focus()} />
			<AppTooltip text="Settings" isLabel>
				{(triggerProps) => <AppButton {...triggerProps} ref={settingsRef} startIcon={GearIcon} />}
			</AppTooltip>
			<AppTooltip text="Undo" isLabel>
				{(triggerProps) => <AppButton {...triggerProps} startIcon={ArrowCounterClockwiseIcon} />}
			</AppTooltip>
		</>
	);
}

test("names an icon-only trigger when it is the label", async () => {
	const screen = await setup();

	await expect.element(screen.getByRole("button", { name: "Settings" })).toBeVisible();
});

test("describes a trigger that already has a name", async () => {
	const screen = await render(
		<AppTooltip text="Get the mod's files and the steps to install them">
			{(triggerProps) => <AppButton {...triggerProps} text="Download" />}
		</AppTooltip>,
	);

	await expect
		.element(screen.getByRole("button", { name: "Download" }))
		.toHaveAccessibleDescription("Get the mod's files and the steps to install them");
});

test("opens when the pointer rests on the trigger", async () => {
	const screen = await setup();

	await screen.getByRole("button", { name: "Settings" }).hover();

	await expect.element(screen.getByRole("tooltip", { name: "Settings" })).toBeVisible();
});

test("closes when the pointer leaves the trigger", async () => {
	const screen = await setup();
	await screen.getByRole("button", { name: "Settings" }).hover();
	await expect.element(screen.getByRole("tooltip", { name: "Settings" })).toBeVisible();

	await screen.getByText("Elsewhere on the page").hover();

	await expect.element(screen.getByRole("tooltip", { name: "Settings", includeHidden: true })).not.toBeVisible();
});

test("closes when the trigger is pressed, so it doesn't cover what the click opens", async () => {
	const screen = await setup();
	const trigger = screen.getByRole("button", { name: "Settings" });
	await trigger.hover();
	await expect.element(screen.getByRole("tooltip", { name: "Settings" })).toBeVisible();

	await trigger.click();

	await expect.element(screen.getByRole("tooltip", { name: "Settings", includeHidden: true })).not.toBeVisible();
});

test("opens when Tab moves focus to the trigger", async () => {
	const screen = await setup();
	await parkPointerAway(screen);

	await userEvent.keyboard("{Tab}");

	await expect.element(screen.getByRole("button", { name: "Settings" })).toHaveFocus();
	await expect.element(screen.getByRole("tooltip", { name: "Settings" })).toBeVisible();
});

test("stays closed when code moves focus to the trigger, as a modal does when it opens", async () => {
	const screen = await render(<FocusFromCode />);
	await screen.getByRole("button", { name: "Open" }).click();
	await expect.element(screen.getByRole("button", { name: "Settings" })).toHaveFocus();

	// A hovered tooltip opens after a delay, so once Undo's is open, Settings' has had the time to open too.
	await screen.getByRole("button", { name: "Undo" }).hover();
	await expect.element(screen.getByRole("tooltip", { name: "Undo" })).toBeVisible();

	await expect.element(screen.getByRole("tooltip", { name: "Settings", includeHidden: true })).not.toBeVisible();
});

test("Escape closes the tooltip first, and only the next Escape closes the modal", async () => {
	const onClose = vi.fn();
	const screen = await render(
		<DefaultLabelsContext value={DEFAULT_LABELS}>
			<AppModal isOpen title="Leave without saving?" onClose={onClose}>
				<AppTooltip text="Keep a copy of your changes">
					{(triggerProps) => <AppButton {...triggerProps} text="Save a copy" />}
				</AppTooltip>
			</AppModal>
		</DefaultLabelsContext>,
	);
	await screen.getByRole("button", { name: "Save a copy" }).hover();
	await expect.element(screen.getByRole("tooltip", { name: "Keep a copy of your changes" })).toBeVisible();

	await userEvent.keyboard("{Escape}");

	await expect
		.element(screen.getByRole("tooltip", { name: "Keep a copy of your changes", includeHidden: true }))
		.not.toBeVisible();
	expect(onClose).not.toHaveBeenCalled();

	await userEvent.keyboard("{Escape}");

	expect(onClose).toHaveBeenCalledOnce();
});

test("with openOnClick, a tap opens it", async () => {
	const screen = await setup({ openOnClick: true });
	await parkPointerAway(screen);

	tap(screen.getByRole("button", { name: "Settings" }));

	await expect.element(screen.getByRole("tooltip", { name: "Settings" })).toBeVisible();
});

test("with openOnClick, a tap outside closes it, even when the tap didn't focus the trigger", async () => {
	const screen = await setup({ openOnClick: true });
	await parkPointerAway(screen);
	tap(screen.getByRole("button", { name: "Settings" }));
	await expect.element(screen.getByRole("tooltip", { name: "Settings" })).toBeVisible();

	await screen.getByText("Elsewhere on the page").click();

	await expect.element(screen.getByRole("tooltip", { name: "Settings", includeHidden: true })).not.toBeVisible();
});
