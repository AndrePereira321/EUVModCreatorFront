import { GearIcon } from "@phosphor-icons/react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import AppButton from "./AppButton.tsx";

test("calls onClick when clicked", async () => {
	const onClick = vi.fn();
	const screen = await render(<AppButton text="Save" onClick={onClick} />);

	await screen.getByRole("button", { name: "Save" }).click();

	expect(onClick).toHaveBeenCalledOnce();
});

test("does not submit a surrounding form", async () => {
	const onSubmit = vi.fn();
	const screen = await render(
		<form
			onSubmit={(event) => {
				event.preventDefault();
				onSubmit();
			}}
		>
			<AppButton text="Save" />
		</form>,
	);

	await screen.getByRole("button", { name: "Save" }).click();

	expect(onSubmit).not.toHaveBeenCalled();
});

test("takes its accessible name from aria-label when icon-only", async () => {
	const screen = await render(<AppButton startIcon={GearIcon} aria-label="Settings" />);

	await expect.element(screen.getByRole("button", { name: "Settings" })).toBeVisible();
});
