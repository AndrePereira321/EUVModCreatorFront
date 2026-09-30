import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { clsx } from "clsx";
import {
	type FocusEvent,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	useEffect,
	useEffectEvent,
	useId,
	useRef,
	useState,
} from "react";

import { APP_SIZE_MD } from "../../../constants/styles/size.ts";
import {
	FIELD_BUTTON_CLASSES,
	FIELD_BUTTON_SIZE_CLASSES,
	ICON_SIZE_CLASSES,
} from "../AppTextInput/AppTextInput.classes.ts";
import AppTextInput, { type AppTextInputBaseProps } from "../AppTextInput/AppTextInput.tsx";
import AppTooltip from "../AppTooltip/AppTooltip.tsx";
import { useDefaultLabels } from "../DefaultLabelsContext.ts";

export interface AppNumberInputProps extends Omit<
	AppTextInputBaseProps,
	| "value"
	| "onChange"
	| "min"
	| "max"
	| "step"
	| "inputMode"
	| "maxLength"
	| "minLength"
	| "pattern"
	| "showPasswordLabel"
	| "hidePasswordLabel"
	| "children"
> {
	value: number | null;
	onChange: (value: number | null) => void;
	min?: number;
	max?: number;
	step?: number;
	largeStep?: number;
	maxDecimals?: number;
	hasSteppers?: boolean;
	increaseLabel?: string;
	decreaseLabel?: string;
}

type Direction = 1 | -1;

interface Draft {
	text: string;
	value: number | null;
}

interface Hold {
	direction: Direction;
	delay: number;
}

const HOLD_DELAY_MS = 400;
const HOLD_REPEAT_MS = 60;

const STEP_KEYS: Partial<Record<string, { direction: Direction; isLarge: boolean }>> = {
	ArrowUp: { direction: 1, isLarge: false },
	ArrowDown: { direction: -1, isLarge: false },
	PageUp: { direction: 1, isLarge: true },
	PageDown: { direction: -1, isLarge: true },
};

function countDecimals(number: number) {
	return String(number).split(".")[1]?.length ?? 0;
}

function roundTo(number: number, decimals: number) {
	return Number(number.toFixed(decimals));
}

function formatNumber(value: number | null) {
	return value == null ? "" : String(value);
}

function parseNumber(text: string) {
	const number = Number(text.replace(",", "."));
	return text === "" || Number.isNaN(number) ? null : number;
}

function partialNumberPattern(allowsNegative: boolean, maxDecimals: number) {
	const sign = allowsNegative ? "-?" : "";
	const fraction = maxDecimals > 0 ? `([.,]\\d{0,${maxDecimals}})?` : "";
	return new RegExp(`^${sign}\\d*${fraction}$`);
}

export default function AppNumberInput({
	id,
	value,
	onChange,
	min,
	max,
	step = 1,
	largeStep,
	maxDecimals,
	hint,
	size = APP_SIZE_MD,
	hasSteppers = true,
	increaseLabel,
	decreaseLabel,
	disabled,
	readOnly,
	onKeyDown,
	onBlur,
	...rest
}: AppNumberInputProps) {
	const defaultLabels = useDefaultLabels();
	const generatedId = useId();
	const [draft, setDraft] = useState<Draft | null>(null);
	const [hold, setHold] = useState<Hold | null>(null);
	const [announcement, setAnnouncement] = useState("");
	const hasRepeatedRef = useRef(false);
	const inputId = id ?? generatedId;
	const decimals = maxDecimals ?? countDecimals(step);
	const pageStep = largeStep ?? roundTo(step * 10, countDecimals(step));
	const allowsNegative = min == null || min < 0;
	const text = draft !== null && draft.value === value ? draft.text : formatNumber(value);
	const showSteppers = hasSteppers && !disabled && !readOnly;
	const rangeHint = min != null && max != null ? `${min}${min < 0 ? " – " : "–"}${max}` : undefined;

	const clamp = (number: number) => Math.min(Math.max(number, min ?? -Infinity), max ?? Infinity);

	const stepFrom = (current: number | null, amount: number) => {
		if (current == null) {
			return clamp(0);
		}
		const base = min ?? 0;
		const stepsFromBase = roundTo((current - base) / step, 9);
		const onGrid = base + (amount > 0 ? Math.floor(stepsFromBase) : Math.ceil(stepsFromBase)) * step;
		const precision = Math.max(countDecimals(step), countDecimals(amount), countDecimals(base));
		return clamp(roundTo(onGrid + amount, precision));
	};

	const stepBy = (amount: number) => {
		if (disabled || readOnly) {
			return false;
		}
		const next = stepFrom(value, amount);
		setDraft(null);
		if (next === value) {
			return false;
		}
		onChange(next);
		if (document.activeElement?.id !== inputId) {
			setAnnouncement(String(next));
		}
		return true;
	};

	const commit = () => {
		if (draft === null) {
			return;
		}
		setDraft(null);
		if (value != null && clamp(value) !== value) {
			onChange(clamp(value));
		}
	};

	const handleTextChange = (nextText: string) => {
		const trimmed = nextText.trim();
		if (!partialNumberPattern(allowsNegative, decimals).test(trimmed)) {
			return;
		}
		const parsed = parseNumber(trimmed);
		setDraft({ text: trimmed, value: parsed });
		if (parsed !== value) {
			onChange(parsed);
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(event);
		if (event.defaultPrevented) {
			return;
		}
		const stepKey = STEP_KEYS[event.key];
		if (event.key === "Enter") {
			commit();
		} else if (stepKey) {
			event.preventDefault();
			stepBy(stepKey.direction * (stepKey.isLarge || event.shiftKey ? pageStep : step));
		}
	};

	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		commit();
		onBlur?.(event);
	};

	const onHoldTick = useEffectEvent((direction: Direction) => {
		hasRepeatedRef.current = true;
		setHold(stepBy(direction * step) ? { direction, delay: HOLD_REPEAT_MS } : null);
	});

	useEffect(() => {
		if (hold === null) {
			return;
		}
		const timer = window.setTimeout(() => onHoldTick(hold.direction), hold.delay);
		return () => window.clearTimeout(timer);
	}, [hold]);

	const startHold = (event: PointerEvent<HTMLButtonElement>, direction: Direction) => {
		if (event.button !== 0) {
			return;
		}
		hasRepeatedRef.current = false;
		setHold({ direction, delay: HOLD_DELAY_MS });
		if (event.pointerType === "mouse") {
			document.getElementById(inputId)?.focus();
		}
	};

	const stopHold = () => setHold(null);

	const handleStepperClick = (event: MouseEvent<HTMLButtonElement>, direction: Direction) => {
		if (event.detail === 0 || !hasRepeatedRef.current) {
			stepBy(direction * step);
		}
	};

	const renderStepper = (direction: Direction) => {
		const Icon = direction > 0 ? PlusIcon : MinusIcon;
		const isAtLimit = value != null && (direction > 0 ? max != null && value >= max : min != null && value <= min);

		return (
			<AppTooltip
				text={direction > 0 ? (increaseLabel ?? defaultLabels.increase) : (decreaseLabel ?? defaultLabels.decrease)}
				isLabel
			>
				{(triggerProps) => (
					<button
						{...triggerProps}
						type="button"
						tabIndex={-1}
						aria-controls={inputId}
						disabled={isAtLimit}
						onPointerDown={(event) => {
							triggerProps.onPointerDown();
							startHold(event, direction);
						}}
						onPointerUp={stopHold}
						onPointerCancel={stopHold}
						onPointerLeave={(event) => {
							triggerProps.onPointerLeave(event);
							stopHold();
						}}
						onMouseDown={(event) => event.preventDefault()}
						onClick={(event) => handleStepperClick(event, direction)}
						className={clsx(FIELD_BUTTON_CLASSES, FIELD_BUTTON_SIZE_CLASSES[size], "touch-manipulation select-none")}
					>
						<Icon aria-hidden className={ICON_SIZE_CLASSES[size]} />
					</button>
				)}
			</AppTooltip>
		);
	};

	return (
		<AppTextInput
			{...rest}
			id={inputId}
			// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- it is an <input>, of type text on purpose: .ai-support/ui-styling.md
			role="spinbutton"
			inputMode={allowsNegative ? "text" : decimals > 0 ? "decimal" : "numeric"}
			aria-valuenow={value ?? undefined}
			aria-valuemin={min}
			aria-valuemax={max}
			value={text}
			onChange={handleTextChange}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			hint={hint ?? rangeHint}
			size={size}
			disabled={disabled}
			readOnly={readOnly}
		>
			{showSteppers && (
				<>
					<div className="flex shrink-0 gap-0.5">
						{renderStepper(-1)}
						{renderStepper(1)}
					</div>
					<output aria-live="polite" className="sr-only">
						{announcement}
					</output>
				</>
			)}
		</AppTextInput>
	);
}
