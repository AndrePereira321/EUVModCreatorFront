import { XIcon } from "@phosphor-icons/react";
import { type MouseEventHandler, type ReactNode, type SyntheticEvent, useEffect, useId, useRef } from "react";

import { APP_FILL_GHOST, APP_FILL_OUTLINE } from "../../../constants/styles/fill.ts";
import { APP_SIZE_SM } from "../../../constants/styles/size.ts";
import { APP_VARIANT_NEUTRAL, APP_VARIANT_PRIMARY } from "../../../constants/styles/variant.ts";
import AppButton from "../AppButton/AppButton.tsx";
import { useDefaultLabels } from "../DefaultLabelsContext.ts";

export interface AppModalProps {
	title?: string;
	header?: ReactNode;
	closeLabel?: string;
	children?: ReactNode;
	isOpen: boolean;
	confirmLabel?: string;
	cancelLabel?: string;
	footer?: ReactNode;
	onConfirmClicked?: MouseEventHandler<HTMLButtonElement>;
	onCancelClicked?: MouseEventHandler<HTMLButtonElement>;
	onClose?: () => void;
}

export default function AppModal({
	title,
	header,
	closeLabel,
	children,
	isOpen,
	confirmLabel,
	cancelLabel,
	footer,
	onCancelClicked,
	onConfirmClicked,
	onClose,
}: AppModalProps) {
	const defaultLabels = useDefaultLabels();
	const titleId = useId();
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const dialog = dialogRef.current;
		dialog?.showModal();
		return () => {
			dialog?.close();
		};
	}, [isOpen]);

	const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
		event.preventDefault();
		onClose?.();
	};

	const renderHeader = () => {
		if (header) {
			return header;
		}
		if (title) {
			return <h2>{title}</h2>;
		}
		return null;
	};

	const headerContent = renderHeader();

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby={headerContent ? titleId : undefined}
			onCancel={handleCancel}
			className="mx-auto mt-auto mb-4 max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-surface text-foreground shadow-xl transition-[opacity,translate] duration-200 ease-out backdrop:bg-neutral-950/50 backdrop:transition-opacity backdrop:duration-200 open:flex sm:mb-auto starting:open:opacity-0 starting:open:backdrop:opacity-0 motion-safe:starting:open:translate-y-3"
		>
			<div className="flex items-start justify-end gap-4 px-6 pt-5 pb-3">
				{headerContent ? (
					<div id={titleId} className="min-w-0 flex-1">
						{headerContent}
					</div>
				) : null}
				<div className="-me-2 -mt-0.5 shrink-0">
					<AppButton
						variant={APP_VARIANT_NEUTRAL}
						fill={APP_FILL_GHOST}
						size={APP_SIZE_SM}
						startIcon={XIcon}
						aria-label={closeLabel ?? defaultLabels.close}
						onClick={onClose}
					/>
				</div>
			</div>
			<div
				// oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- text-only content must still scroll by keyboard
				tabIndex={0}
				className="min-h-0 overflow-y-auto px-6 pb-6 focus-visible:-outline-offset-2"
			>
				{children}
			</div>
			<div className="flex flex-col-reverse gap-2 border-t border-border bg-background px-6 py-4 sm:flex-row sm:justify-end">
				{footer ? (
					footer
				) : (
					<>
						<AppButton
							variant={APP_VARIANT_NEUTRAL}
							fill={APP_FILL_OUTLINE}
							text={cancelLabel ?? defaultLabels.cancel}
							onClick={onCancelClicked}
						/>
						<AppButton
							variant={APP_VARIANT_PRIMARY}
							text={confirmLabel ?? defaultLabels.confirm}
							onClick={onConfirmClicked}
						/>
					</>
				)}
			</div>
		</dialog>
	);
}
