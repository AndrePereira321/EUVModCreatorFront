import type { Icon } from "@phosphor-icons/react";
import { clsx } from "clsx";
import type { ComponentProps } from "react";

import { APP_FILL_SOLID } from "../../../constants/styles/fill.ts";
import { APP_RADIUS_MD } from "../../../constants/styles/radius.ts";
import { APP_SIZE_MD } from "../../../constants/styles/size.ts";
import { APP_VARIANT_PRIMARY } from "../../../constants/styles/variant.ts";
import type { AppFill, AppRadius, AppSize, AppVariant } from "../../../types/styles.ts";
import { RADIUS_CLASSES } from "../radius.classes.ts";
import {
	BASE_CLASSES,
	FILL_CLASSES,
	ICON_ONLY_SIZE_CLASSES,
	SIZE_CLASSES,
	VARIANT_CLASSES,
} from "./AppButton.classes.ts";

export interface AppButtonProps extends Omit<ComponentProps<"button">, "children" | "className"> {
	text?: string;
	variant?: AppVariant;
	fill?: AppFill;
	size?: AppSize;
	radius?: AppRadius;
	startIcon?: Icon;
	endIcon?: Icon;
}

export default function AppButton({
	text,
	variant = APP_VARIANT_PRIMARY,
	fill = APP_FILL_SOLID,
	size = APP_SIZE_MD,
	radius = APP_RADIUS_MD,
	startIcon: StartIcon,
	endIcon: EndIcon,
	type = "button",
	...rest
}: AppButtonProps) {
	const iconOnly = !text;
	const btnClass = clsx(
		BASE_CLASSES,
		VARIANT_CLASSES[variant],
		FILL_CLASSES[fill],
		iconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size],
		RADIUS_CLASSES[radius],
	);

	return (
		<button {...rest} type={type} className={btnClass}>
			{StartIcon && <StartIcon aria-hidden className="shrink-0" />}
			{text && <span className="truncate">{text}</span>}
			{EndIcon && <EndIcon aria-hidden className="shrink-0" />}
		</button>
	);
}
