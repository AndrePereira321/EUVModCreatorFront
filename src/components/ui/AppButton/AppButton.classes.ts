import { APP_FILL_GHOST, APP_FILL_OUTLINE, APP_FILL_SOFT, APP_FILL_SOLID } from "../../../constants/styles/fill.ts";
import { APP_RADIUS_FULL, APP_RADIUS_MD, APP_RADIUS_NONE, APP_RADIUS_SM } from "../../../constants/styles/radius.ts";
import { APP_SIZE_LG, APP_SIZE_MD, APP_SIZE_SM } from "../../../constants/styles/size.ts";
import {
	APP_VARIANT_ERROR,
	APP_VARIANT_INFO,
	APP_VARIANT_NEUTRAL,
	APP_VARIANT_PRIMARY,
	APP_VARIANT_SECONDARY,
	APP_VARIANT_SUCCESS,
	APP_VARIANT_TERTIARY,
	APP_VARIANT_WARNING,
} from "../../../constants/styles/variant.ts";
import type { AppFill, AppRadius, AppSize, AppVariant } from "../../../types/styles.ts";

export const BASE_CLASSES =
	"touch-manipulation border font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50";

export const VARIANT_CLASSES: Record<AppVariant, string> = {
	[APP_VARIANT_PRIMARY]:
		"[--tone:var(--primary)] [--tone-foreground:var(--primary-foreground)] [--tone-soft:var(--primary-soft)] [--tone-strong:var(--primary-strong)]",
	[APP_VARIANT_SECONDARY]:
		"[--tone:var(--secondary)] [--tone-foreground:var(--secondary-foreground)] [--tone-soft:var(--secondary-soft)] [--tone-strong:var(--secondary-strong)]",
	[APP_VARIANT_TERTIARY]:
		"[--tone:var(--tertiary)] [--tone-foreground:var(--tertiary-foreground)] [--tone-soft:var(--tertiary-soft)] [--tone-strong:var(--tertiary-strong)]",
	[APP_VARIANT_SUCCESS]:
		"[--tone:var(--success)] [--tone-foreground:var(--success-foreground)] [--tone-soft:var(--success-soft)] [--tone-strong:var(--success-strong)]",
	[APP_VARIANT_INFO]:
		"[--tone:var(--info)] [--tone-foreground:var(--info-foreground)] [--tone-soft:var(--info-soft)] [--tone-strong:var(--info-strong)]",
	[APP_VARIANT_WARNING]:
		"[--tone:var(--warning)] [--tone-foreground:var(--warning-foreground)] [--tone-soft:var(--warning-soft)] [--tone-strong:var(--warning-strong)]",
	[APP_VARIANT_ERROR]:
		"[--tone:var(--error)] [--tone-foreground:var(--error-foreground)] [--tone-soft:var(--error-soft)] [--tone-strong:var(--error-strong)]",
	[APP_VARIANT_NEUTRAL]:
		"[--tone:var(--border)] [--tone-foreground:var(--foreground)] [--tone-soft:var(--color-neutral-200)] [--tone-strong:var(--foreground)] dark:[--tone-soft:var(--color-neutral-900)]",
};

export const FILL_CLASSES: Record<AppFill, string> = {
	[APP_FILL_SOLID]:
		"border-transparent bg-(--tone) text-(--tone-foreground) hover:bg-[color-mix(in_oklab,var(--tone),var(--tone-strong)_25%)]",
	[APP_FILL_SOFT]:
		"border-transparent bg-(--tone-soft) text-(--tone-strong) hover:bg-[color-mix(in_oklab,var(--tone-soft),var(--tone-strong)_10%)]",
	[APP_FILL_OUTLINE]: "border-(--tone) bg-transparent text-(--tone-strong) hover:bg-(--tone-soft)",
	[APP_FILL_GHOST]: "border-transparent bg-transparent text-(--tone-strong) hover:bg-(--tone-soft)",
};

export const SIZE_CLASSES: Record<AppSize, string> = {
	[APP_SIZE_SM]: "h-8 px-3 text-sm",
	[APP_SIZE_MD]: "h-10 px-4 text-base",
	[APP_SIZE_LG]: "h-12 px-6 text-lg",
};

export const RADIUS_CLASSES: Record<AppRadius, string> = {
	[APP_RADIUS_NONE]: "rounded-none",
	[APP_RADIUS_SM]: "rounded-sm",
	[APP_RADIUS_MD]: "rounded-md",
	[APP_RADIUS_FULL]: "rounded-full",
};
