import { APP_SIZE_LG, APP_SIZE_MD, APP_SIZE_SM } from "../../../constants/styles/size.ts";
import type { AppSize } from "../../../types/styles.ts";

export const FIELD_BASE_CLASSES =
	"flex w-full min-w-0 cursor-text items-center border bg-surface transition-colors has-[input:disabled]:cursor-not-allowed has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-(--ring)";

export const FIELD_VALID_CLASSES =
	"border-input has-[input:enabled]:hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_50%)]";

export const FIELD_INVALID_CLASSES = "border-error [--ring:var(--error)]";

export const INPUT_CLASSES =
	"min-w-0 flex-1 self-stretch bg-transparent text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&[role=spinbutton]]:min-w-[6ch] [&[role=spinbutton]]:tabular-nums [&::-webkit-search-cancel-button]:appearance-none";

export const SIZE_CLASSES: Record<AppSize, string> = {
	[APP_SIZE_SM]: "h-8 gap-1.5 px-2.5 text-small",
	[APP_SIZE_MD]: "h-10 gap-2 px-3 text-body",
	[APP_SIZE_LG]: "h-12 gap-2.5 px-4 text-subheading font-normal",
};

export const ICON_SIZE_CLASSES: Record<AppSize, string> = {
	[APP_SIZE_SM]: "size-4",
	[APP_SIZE_MD]: "size-4",
	[APP_SIZE_LG]: "size-5",
};

export const ADORNMENT_CLASSES = "shrink-0 text-muted";

export const FIELD_BUTTON_CLASSES =
	"inline-flex shrink-0 items-center justify-center rounded-sm text-muted transition-colors enabled:hover:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] enabled:hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

export const FIELD_BUTTON_SIZE_CLASSES: Record<AppSize, string> = {
	[APP_SIZE_SM]: "size-6",
	[APP_SIZE_MD]: "size-7",
	[APP_SIZE_LG]: "size-8",
};

export const INFO_BUTTON_CLASSES =
	"ms-1 -my-1 inline-flex shrink-0 rounded-full p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-offset-0";
