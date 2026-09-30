import { createContext, useContext } from "react";

export interface DefaultLabels {
	confirm: string;
	cancel: string;
	close: string;
}

export const DefaultLabelsContext = createContext<DefaultLabels | null>(null);

export function useDefaultLabels(): DefaultLabels {
	const labels = useContext(DefaultLabelsContext);
	if (!labels) {
		throw new Error("DefaultLabels not defined");
	}
	return labels;
}
