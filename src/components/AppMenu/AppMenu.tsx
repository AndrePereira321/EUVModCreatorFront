import { useTranslation } from "react-i18next";

import AppMenuItem from "./AppMenuItem.tsx";

export default function AppMenu() {
	const { t } = useTranslation();

	return (
		<nav className="flex gap-4 px-2 py-4 border-b border-primary-300">
			<div>
				<h2 className="text-primary">{t("app.title")}</h2>
			</div>
			<div className="border-l-1 border-secondary-200 p-0"></div>
			<div>
				<AppMenuItem title={t("generic.home")} />
			</div>
		</nav>
	);
}
