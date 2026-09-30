import { XIcon } from "@phosphor-icons/react";
import { type MouseEventHandler, type ReactNode } from "react";

import { APP_FILL_GHOST } from "../../../constants/styles/fill.ts";
import { APP_VARIANT_NEUTRAL, APP_VARIANT_PRIMARY, APP_VARIANT_SECONDARY } from "../../../constants/styles/variant.ts";
import AppButton from "../AppButton/AppButton.tsx";
import { useDefaultLabels } from "../DefaultLabelsContext.ts";

export interface AppModalProps {
	title?: string;
	header?: ReactNode;
	closeLabel: string;
	children?: ReactNode;
	isOpen: boolean;
	confirmLabel?: string;
	cancelLabel?: string;
	footer?: ReactNode;
	onConfirmClicked?: MouseEventHandler<HTMLButtonElement>;
	onCancelClicked?: MouseEventHandler<HTMLButtonElement>;
	onCloseClicked?: MouseEventHandler<HTMLButtonElement>;
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
	onCloseClicked,
}: AppModalProps) {
	const defaultLabels = useDefaultLabels();
	if (!isOpen) {
		return null;
	}

	const renderHeader = () => {
		if (header) {
			return header;
		}
		if (title) {
			return <span>{title}</span>;
		}
	};

	const headerContent = renderHeader();

	return (
		<div>
			<div className="flex items-center">
				{headerContent && <div>{headerContent}</div>}
				<AppButton
					variant={APP_VARIANT_NEUTRAL}
					fill={APP_FILL_GHOST}
					startIcon={XIcon}
					aria-label={closeLabel}
					onClick={onCloseClicked}
				/>
			</div>
			<div>{children}</div>
			{footer ? (
				footer
			) : (
				<div className="flex content-end">
					<AppButton
						variant={APP_VARIANT_PRIMARY}
						text={confirmLabel ?? defaultLabels.confirm}
						onClick={onConfirmClicked}
					></AppButton>
					<AppButton
						variant={APP_VARIANT_SECONDARY}
						text={cancelLabel ?? defaultLabels.cancel}
						onClick={onCancelClicked}
					></AppButton>
				</div>
			)}
		</div>
	);
}
