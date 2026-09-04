import { useId } from "react";
import { useTranslation } from "react-i18next";

import AppMenuItem, { type AppMenuItemProps } from "./AppMenuItem.tsx";

export default function AppMenu() {
	const menuId = useId();
	const { t } = useTranslation();

	const menuItems: AppMenuItemProps[] = [
		{
			id: `${menuId}_home`,
			title: t("generic.home"),
			path: "/",
		},
	];

	return (
		<nav className="flex gap-4 px-2 py-4 border-b border-primary-300">
			<div>
				<h2 className="text-primary">{t("app.title")}</h2>
			</div>
			<div className="border-l border-secondary-200 p-0"></div>
			<div>
				<ul className="flex gap-2">
					{menuItems.map((menuItem) => (
						<AppMenuItem key={menuItem.id} {...menuItem} />
					))}
				</ul>
			</div>
		</nav>
	);
}
