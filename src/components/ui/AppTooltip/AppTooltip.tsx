import {
	type CSSProperties,
	type FocusEvent,
	type MouseEvent,
	type PointerEvent,
	type ReactNode,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

const OPEN_DELAY_MS = 128;
const CLOSE_DELAY_MS = 100;
const WARM_MS = 300;

let openTooltips = 0;
let warmUntil = 0;
let lastKeyWasTab = false;

document.addEventListener(
	"keydown",
	(event) => {
		lastKeyWasTab = event.key === "Tab";
	},
	{ capture: true },
);

interface TooltipRequest {
	open: boolean;
	delay: number;
}

export interface AppTooltipTriggerProps {
	"aria-labelledby"?: string;
	"aria-describedby"?: string;
	style: CSSProperties;
	onPointerEnter: (event: PointerEvent<HTMLElement>) => void;
	onPointerLeave: (event: PointerEvent<HTMLElement>) => void;
	onPointerDown: () => void;
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onFocus: (event: FocusEvent<HTMLElement>) => void;
	onBlur: () => void;
}

export interface AppTooltipProps {
	text: string;
	isLabel?: boolean;
	openOnClick?: boolean;
	children: (triggerProps: AppTooltipTriggerProps) => ReactNode;
}

export default function AppTooltip({ text, isLabel = false, openOnClick = false, children }: AppTooltipProps) {
	const id = useId();
	const anchorName = `--tooltip${id}`;
	const tooltipRef = useRef<HTMLSpanElement>(null);
	const triggerRef = useRef<HTMLElement>(null);
	const [request, setRequest] = useState<TooltipRequest>({ open: false, delay: 0 });
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const isWarm = openTooltips > 0 || Date.now() < warmUntil;
		const delay = request.open && isWarm ? 0 : request.delay;
		const timer = window.setTimeout(() => setIsOpen(request.open), delay);
		return () => window.clearTimeout(timer);
	}, [request]);

	useEffect(() => {
		const tooltip = tooltipRef.current;
		if (!isOpen || !tooltip) {
			return;
		}
		tooltip.showPopover();
		openTooltips++;

		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				// Escape closes the tooltip first, not the modal around it.
				event.preventDefault();
				setRequest({ open: false, delay: 0 });
			}
		};
		const closeOnOutsidePointer = (event: Event) => {
			const target = event.target as Node;
			if (!tooltip.contains(target) && !triggerRef.current?.contains(target)) {
				setRequest({ open: false, delay: 0 });
			}
		};
		document.addEventListener("keydown", closeOnEscape, { capture: true });
		if (openOnClick) {
			document.addEventListener("pointerdown", closeOnOutsidePointer, { capture: true });
		}
		return () => {
			document.removeEventListener("keydown", closeOnEscape, { capture: true });
			document.removeEventListener("pointerdown", closeOnOutsidePointer, { capture: true });
			tooltip.hidePopover();
			openTooltips--;
			warmUntil = Date.now() + WARM_MS;
		};
	}, [isOpen, openOnClick]);

	const open = (delay: number) => {
		if (text) {
			setRequest({ open: true, delay });
		}
	};
	const close = (delay: number) => setRequest({ open: false, delay });

	const triggerProps: AppTooltipTriggerProps = {
		"aria-labelledby": isLabel ? id : undefined,
		"aria-describedby": isLabel ? undefined : id,
		style: { anchorName },
		onPointerEnter: (event) => {
			if (event.pointerType !== "touch") {
				open(OPEN_DELAY_MS);
			}
		},
		onPointerLeave: (event) => {
			if (event.pointerType !== "touch") {
				close(CLOSE_DELAY_MS);
			}
		},
		onPointerDown: () => {
			if (!openOnClick) {
				close(0);
			}
		},
		onFocus: (event) => {
			if (lastKeyWasTab && event.currentTarget.matches(":focus-visible")) {
				open(0);
			}
		},
		onBlur: () => close(0),
	};
	if (openOnClick) {
		triggerProps.onClick = (event) => {
			triggerRef.current = event.currentTarget;
			open(0);
		};
	}

	return (
		<>
			{children(triggerProps)}
			<span
				ref={tooltipRef}
				id={id}
				role="tooltip"
				popover="manual"
				style={{ positionAnchor: anchorName }}
				onPointerEnter={() => open(0)}
				onPointerLeave={() => close(CLOSE_DELAY_MS)}
				className="inset-auto mx-2 mb-2 max-w-64 origin-bottom rounded-md border border-transparent bg-foreground px-2.5 py-1.5 text-small text-pretty wrap-break-word text-background opacity-0 shadow-md transition-[opacity,scale,display,overlay] transition-discrete duration-150 ease-out [position-area:top] [position-try-fallbacks:flip-block] open:opacity-100 motion-safe:scale-95 motion-safe:open:scale-100 starting:open:opacity-0 motion-safe:starting:open:scale-95"
			>
				{text}
			</span>
		</>
	);
}
