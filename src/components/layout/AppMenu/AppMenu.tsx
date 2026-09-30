import { useId } from "react";
import { useTranslation } from "react-i18next";

import AppButton from "../../ui/AppButton/AppButton.tsx";
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
		<nav className="flex items-center gap-4 border-b border-primary-300 px-2 py-4">
			<div>
				<h2 className="text-primary-strong">{t("app.title")}</h2>
			</div>
			<div className="self-stretch border-l border-secondary-200 p-0"></div>
			<div>
				<ul className="flex gap-2">
					{menuItems.map((menuItem) => (
						<AppMenuItem key={menuItem.id} {...menuItem} />
					))}
				</ul>
			</div>
			<div className="ml-auto flex gap-2 px-2">
				<AppButton text={t("auth.login")}></AppButton>
				<AppButton variant="secondary" text={t("auth.register")}></AppButton>
			</div>
		</nav>
	);
}
