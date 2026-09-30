import { CircleNotchIcon, type Icon, InfoIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { clsx } from "clsx";
import { type ComponentProps, type MouseEvent, useId } from "react";

import { APP_RADIUS_MD } from "../../../constants/styles/radius.ts";
import { APP_SIZE_MD } from "../../../constants/styles/size.ts";
import type { AppRadius, AppSize } from "../../../types/styles.ts";
import AppTooltip from "../AppTooltip/AppTooltip.tsx";
import { useDefaultLabels } from "../DefaultLabelsContext.ts";
import { RADIUS_CLASSES } from "../radius.classes.ts";
import {
	ADORNMENT_CLASSES,
	CLEAR_BUTTON_CLASSES,
	CLEAR_BUTTON_SIZE_CLASSES,
	FIELD_BASE_CLASSES,
	FIELD_INVALID_CLASSES,
	FIELD_VALID_CLASSES,
	ICON_SIZE_CLASSES,
	INFO_BUTTON_CLASSES,
	INPUT_CLASSES,
	SIZE_CLASSES,
} from "./AppTextInput.classes.ts";

export interface AppTextInputProps extends Omit<
	ComponentProps<"input">,
	"className" | "type" | "size" | "value" | "onChange"
> {
	name: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	description?: string;
	error?: string;
	size?: AppSize;
	radius?: AppRadius;
	startIcon?: Icon;
	endIcon?: Icon;
	suffix?: string;
	isOptional?: boolean;
	optionalLabel?: string;
	isClearable?: boolean;
	clearLabel?: string;
	isLoading?: boolean;
	loadingLabel?: string;
}

export default function AppTextInput({
	id,
	name,
	label,
	value,
	onChange,
	description,
	error,
	size = APP_SIZE_MD,
	radius = APP_RADIUS_MD,
	startIcon: StartIcon,
	endIcon: EndIcon,
	suffix,
	isOptional = false,
	optionalLabel,
	isClearable = false,
	clearLabel,
	isLoading = false,
	loadingLabel,
	disabled,
	readOnly,
	maxLength,
	...rest
}: AppTextInputProps) {
	const defaultLabels = useDefaultLabels();
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const descriptionId = `${inputId}-description`;
	const suffixId = `${inputId}-suffix`;
	const errorId = `${inputId}-error`;
	const describedBy =
		[description && descriptionId, suffix && suffixId, error && errorId].filter(Boolean).join(" ") || undefined;
	const showClear = isClearable && value !== "" && !disabled && !readOnly;
	const isNearLimit = maxLength != null && value.length >= maxLength * 0.9;

	const focusInput = () => document.getElementById(inputId)?.focus();

	const handleFieldMouseDown = (event: MouseEvent<HTMLDivElement>) => {
		if (disabled || (event.target instanceof Element && event.target.closest("input, button"))) {
			return;
		}
		event.preventDefault();
		focusInput();
	};

	const clear = () => {
		onChange("");
		focusInput();
	};

	const fieldClass = clsx(
		FIELD_BASE_CLASSES,
		error ? FIELD_INVALID_CLASSES : FIELD_VALID_CLASSES,
		SIZE_CLASSES[size],
		RADIUS_CLASSES[radius],
	);
	const adornmentClass = clsx(ADORNMENT_CLASSES, ICON_SIZE_CLASSES[size]);

	return (
		<div className={clsx("flex min-w-0 flex-col gap-1.5", disabled && "opacity-50")}>
			<div className="flex items-start text-label text-foreground">
				<label htmlFor={inputId} className="min-w-0">
					{label}
					{isOptional && (
						<>
							{" "}
							<span className="font-normal text-muted">{optionalLabel ?? defaultLabels.optional}</span>
						</>
					)}
				</label>
				{description && (
					<>
						<AppTooltip text={description} isLabel openOnClick>
							{(triggerProps) => (
								<button {...triggerProps} type="button" className={INFO_BUTTON_CLASSES}>
									<InfoIcon aria-hidden className="size-4" />
								</button>
							)}
						</AppTooltip>
						<span id={descriptionId} hidden>
							{description}
						</span>
					</>
				)}
			</div>
			{/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- a pointer shortcut only: clicking the padding or an icon focuses the input, which the keyboard reaches directly */}
			<div className={fieldClass} onMouseDown={handleFieldMouseDown}>
				{StartIcon && <StartIcon aria-hidden className={adornmentClass} />}
				<input
					autoComplete="off"
					{...rest}
					id={inputId}
					name={name}
					type="text"
					value={value}
					disabled={disabled}
					readOnly={readOnly}
					maxLength={maxLength}
					aria-invalid={error ? true : undefined}
					aria-describedby={describedBy}
					onChange={(e) => onChange(e.target.value)}
					className={INPUT_CLASSES}
				/>
				{suffix && (
					<span id={suffixId} className="shrink-0 text-muted">
						{suffix}
					</span>
				)}
				{EndIcon && <EndIcon aria-hidden className={adornmentClass} />}
				{isLoading && <CircleNotchIcon aria-hidden className={clsx(adornmentClass, "motion-safe:animate-spin")} />}
				{showClear && (
					<AppTooltip text={clearLabel ?? defaultLabels.clear} isLabel>
						{(triggerProps) => (
							<button
								{...triggerProps}
								type="button"
								onClick={clear}
								className={clsx(CLEAR_BUTTON_CLASSES, CLEAR_BUTTON_SIZE_CLASSES[size])}
							>
								<XIcon aria-hidden className={ICON_SIZE_CLASSES[size]} />
							</button>
						)}
					</AppTooltip>
				)}
			</div>
			{(error || maxLength != null) && (
				<div className="flex items-start gap-3">
					{error && (
						<p id={errorId} className="flex flex-1 gap-1.5 text-small text-error-strong">
							<WarningCircleIcon aria-hidden weight="fill" className="h-[1lh] shrink-0" />
							<span>{error}</span>
						</p>
					)}
					{maxLength != null && (
						<span
							className={clsx(
								"ms-auto shrink-0 text-small tabular-nums",
								isNearLimit ? "text-warning-strong" : "text-muted",
							)}
						>
							{value.length}/{maxLength}
						</span>
					)}
				</div>
			)}
			<output aria-live="polite" className="sr-only">
				{isLoading ? (loadingLabel ?? defaultLabels.loading) : ""}
			</output>
		</div>
	);
}
