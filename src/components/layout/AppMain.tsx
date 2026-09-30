import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DefaultLabelsContext } from "../ui/DefaultLabelsContext.ts";
import AppMenu from "./AppMenu/AppMenu.tsx";

export default function AppMain() {
	const { t } = useTranslation();
	const defaultLabels = useMemo(
		() => ({
			confirm: t("generic.confirm"),
			cancel: t("generic.cancel"),
			close: t("generic.close"),
			optional: t("generic.optional"),
			clear: t("generic.clear"),
			loading: t("generic.loading"),
			showPassword: t("generic.showPassword"),
			hidePassword: t("generic.hidePassword"),
			increase: t("generic.increase"),
			decrease: t("generic.decrease"),
		}),
		[t],
	);

	return (
		<>
			<DefaultLabelsContext value={defaultLabels}>
				<AppMenu></AppMenu>
			</DefaultLabelsContext>
		</>
	);
}
