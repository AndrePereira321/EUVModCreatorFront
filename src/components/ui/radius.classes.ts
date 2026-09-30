import { APP_RADIUS_FULL, APP_RADIUS_MD, APP_RADIUS_NONE, APP_RADIUS_SM } from "../../constants/styles/radius.ts";
import type { AppRadius } from "../../types/styles.ts";

export const RADIUS_CLASSES: Record<AppRadius, string> = {
	[APP_RADIUS_NONE]: "rounded-none",
	[APP_RADIUS_SM]: "rounded-sm",
	[APP_RADIUS_MD]: "rounded-md",
	[APP_RADIUS_FULL]: "rounded-full",
};
