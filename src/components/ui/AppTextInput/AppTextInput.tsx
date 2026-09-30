import {
	CircleNotchIcon,
	EyeIcon,
	EyeSlashIcon,
	type Icon,
	InfoIcon,
	WarningCircleIcon,
	XIcon,
} from "@phosphor-icons/react";
import { clsx } from "clsx";
import { type ComponentProps, type HTMLInputAutoCompleteAttribute, type MouseEvent, useId, useState } from "react";

import {
	APP_TEXT_INPUT_TYPE_EMAIL,
	APP_TEXT_INPUT_TYPE_PASSWORD,
	APP_TEXT_INPUT_TYPE_SEARCH,
	APP_TEXT_INPUT_TYPE_TEL,
	APP_TEXT_INPUT_TYPE_TEXT,
	APP_TEXT_INPUT_TYPE_URL,
} from "../../../constants/inputs.ts";
import { APP_RADIUS_MD } from "../../../constants/styles/radius.ts";
import { APP_SIZE_MD } from "../../../constants/styles/size.ts";
import type { AppTextInputType } from "../../../types/inputs.ts";
import type { AppRadius, AppSize } from "../../../types/styles.ts";
import AppTooltip from "../AppTooltip/AppTooltip.tsx";
import { useDefaultLabels } from "../DefaultLabelsContext.ts";
import { RADIUS_CLASSES } from "../radius.classes.ts";
import {
	ADORNMENT_CLASSES,
	FIELD_BASE_CLASSES,
	FIELD_BUTTON_CLASSES,
	FIELD_BUTTON_SIZE_CLASSES,
	FIELD_INVALID_CLASSES,
	FIELD_VALID_CLASSES,
	ICON_SIZE_CLASSES,
	INFO_BUTTON_CLASSES,
	INPUT_CLASSES,
	SIZE_CLASSES,
} from "./AppTextInput.classes.ts";

export type AppTextInputTypeProps =
	| {
			type?: Exclude<AppTextInputType, typeof APP_TEXT_INPUT_TYPE_PASSWORD>;
			autoComplete?: HTMLInputAutoCompleteAttribute;
	  }
	| {
			type: typeof APP_TEXT_INPUT_TYPE_PASSWORD;
			autoComplete: "current-password" | "new-password" | "off";
	  };

export interface AppTextInputBaseProps extends Omit<
	ComponentProps<"input">,
	"className" | "type" | "size" | "value" | "onChange" | "autoComplete"
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
	showPasswordLabel?: string;
	hidePasswordLabel?: string;
}

export type AppTextInputProps = AppTextInputBaseProps & AppTextInputTypeProps;

const DEFAULT_AUTO_COMPLETE: Record<AppTextInputType, HTMLInputAutoCompleteAttribute | undefined> = {
	[APP_TEXT_INPUT_TYPE_TEXT]: "off",
	[APP_TEXT_INPUT_TYPE_EMAIL]: "email",
	[APP_TEXT_INPUT_TYPE_TEL]: "tel",
	[APP_TEXT_INPUT_TYPE_URL]: "url",
	[APP_TEXT_INPUT_TYPE_SEARCH]: "off",
	[APP_TEXT_INPUT_TYPE_PASSWORD]: undefined,
};

const PASSWORD_INPUT_PROPS = { spellCheck: false, autoCapitalize: "none", autoCorrect: "off" } as const;

export default function AppTextInput({
	id,
	name,
	label,
	value,
	onChange,
	type = APP_TEXT_INPUT_TYPE_TEXT,
	autoComplete,
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
	showPasswordLabel,
	hidePasswordLabel,
	disabled,
	readOnly,
	maxLength,
	...rest
}: AppTextInputProps) {
	const defaultLabels = useDefaultLabels();
	const generatedId = useId();
	const [isPasswordShown, setIsPasswordShown] = useState(false);
	const inputId = id ?? generatedId;
	const descriptionId = `${inputId}-description`;
	const suffixId = `${inputId}-suffix`;
	const errorId = `${inputId}-error`;
	const describedBy =
		[description && descriptionId, suffix && suffixId, error && errorId].filter(Boolean).join(" ") || undefined;
	const showClear = isClearable && value !== "" && !disabled && !readOnly;
	const isNearLimit = maxLength != null && value.length >= maxLength * 0.9;
	const isPassword = type === APP_TEXT_INPUT_TYPE_PASSWORD;
	const showReveal = isPassword && !disabled;

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
	const fieldButtonClass = clsx(FIELD_BUTTON_CLASSES, FIELD_BUTTON_SIZE_CLASSES[size]);

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
					{...(isPassword ? PASSWORD_INPUT_PROPS : {})}
					{...rest}
					id={inputId}
					name={name}
					type={showReveal && isPasswordShown ? APP_TEXT_INPUT_TYPE_TEXT : type}
					autoComplete={autoComplete ?? DEFAULT_AUTO_COMPLETE[type]}
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
							<button {...triggerProps} type="button" onClick={clear} className={fieldButtonClass}>
								<XIcon aria-hidden className={ICON_SIZE_CLASSES[size]} />
							</button>
						)}
					</AppTooltip>
				)}
				{showReveal && (
					<AppTooltip
						text={
							isPasswordShown
								? (hidePasswordLabel ?? defaultLabels.hidePassword)
								: (showPasswordLabel ?? defaultLabels.showPassword)
						}
						isLabel
					>
						{(triggerProps) => (
							<button
								{...triggerProps}
								type="button"
								onClick={() => setIsPasswordShown((shown) => !shown)}
								className={fieldButtonClass}
							>
								{isPasswordShown ? (
									<EyeSlashIcon aria-hidden className={ICON_SIZE_CLASSES[size]} />
								) : (
									<EyeIcon aria-hidden className={ICON_SIZE_CLASSES[size]} />
								)}
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
