import { createContext, useContext } from "react";

export interface DefaultLabels {
	confirm: string;
	cancel: string;
	close: string;
	optional: string;
	clear: string;
	loading: string;
	showPassword: string;
	hidePassword: string;
	increase: string;
	decrease: string;
}

export const DefaultLabelsContext = createContext<DefaultLabels | null>(null);

export function useDefaultLabels(): DefaultLabels {
	const labels = useContext(DefaultLabelsContext);
	if (!labels) {
		throw new Error("DefaultLabels not defined");
	}
	return labels;
}
