import { type ReactNode, useState } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import "../../../styles/index.css";
import AppButton from "../AppButton/AppButton.tsx";
import { DefaultLabelsContext } from "../DefaultLabelsContext.ts";
import AppModal, { type AppModalProps } from "./AppModal.tsx";

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

function setup(overrides: Partial<AppModalProps> = {}) {
	const props = {
		isOpen: true,
		title: "Leave without saving?",
		onConfirmClicked: vi.fn(),
		onCancelClicked: vi.fn(),
		onClose: vi.fn(),
		...overrides,
	};
	return render(<AppModal {...props} />, { wrapper: WithLabels });
}

function ModalWithOpener() {
	const [isOpen, setIsOpen] = useState(false);
	const close = () => setIsOpen(false);

	return (
		<>
			<AppButton text="Open" onClick={() => setIsOpen(true)} />
			<AppModal
				isOpen={isOpen}
				title="Leave without saving?"
				onClose={close}
				onCancelClicked={close}
				onConfirmClicked={close}
			/>
		</>
	);
}

test("is named by its title", async () => {
	const screen = await setup();

	await expect.element(screen.getByRole("dialog", { name: "Leave without saving?" })).toBeVisible();
});

test("is named by a custom header", async () => {
	const screen = await setup({ title: undefined, header: <h2>Make this mod public?</h2> });

	await expect.element(screen.getByRole("dialog", { name: "Make this mod public?" })).toBeVisible();
});

test("stays hidden while closed", async () => {
	const screen = await setup({ isOpen: false });

	await expect.element(screen.getByText("Leave without saving?")).not.toBeVisible();
});

test("falls back to the default labels", async () => {
	const screen = await setup();

	await expect.element(screen.getByRole("button", { name: "Confirm" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Close" })).toBeVisible();
});

test("uses the labels it is given", async () => {
	const screen = await setup({ confirmLabel: "Leave", cancelLabel: "Keep editing", closeLabel: "Dismiss" });

	await expect.element(screen.getByRole("button", { name: "Leave" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Keep editing" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Dismiss" })).toBeVisible();
});

test.each([
	["Confirm", "onConfirmClicked"],
	["Cancel", "onCancelClicked"],
	["Close", "onClose"],
] as const)("clicking %s calls %s", async (button, handler) => {
	const handlers = { onConfirmClicked: vi.fn(), onCancelClicked: vi.fn(), onClose: vi.fn() };
	const screen = await setup(handlers);

	await screen.getByRole("button", { name: button }).click();

	expect(handlers[handler]).toHaveBeenCalledOnce();
});

test("asks the parent to close on Escape instead of closing itself", async () => {
	const onClose = vi.fn();
	const screen = await setup({ onClose });
	// The previous test leaves the mouse where this modal's close button renders; its tooltip would take the Escape.
	await screen.getByRole("heading", { name: "Leave without saving?" }).hover();
	await expect.element(screen.getByRole("tooltip", { name: "Close", includeHidden: true })).not.toBeVisible();

	await userEvent.keyboard("{Escape}");

	expect(onClose).toHaveBeenCalledOnce();
	await expect.element(screen.getByRole("dialog", { name: "Leave without saving?" })).toBeVisible();
});

test("replaces the default buttons with a custom footer", async () => {
	const screen = await setup({ footer: <AppButton text="Delete mod" /> });

	await expect.element(screen.getByRole("button", { name: "Delete mod" })).toBeVisible();
	await expect.element(screen.getByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
});

test("moves focus into the modal when it opens", async () => {
	const screen = await render(<ModalWithOpener />, { wrapper: WithLabels });

	await screen.getByRole("button", { name: "Open" }).click();

	await expect.element(screen.getByRole("button", { name: "Close" })).toHaveFocus();
});

test("returns focus to the button that opened it", async () => {
	const screen = await render(<ModalWithOpener />, { wrapper: WithLabels });
	const opener = screen.getByRole("button", { name: "Open" });
	await opener.click();

	await userEvent.keyboard("{Escape}");

	await expect.element(screen.getByText("Leave without saving?")).not.toBeVisible();
	await expect.element(opener).toHaveFocus();
});
