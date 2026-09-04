import type en from "./labels/en.json";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "labels";
		resources: {
			labels: typeof en;
		};
	}
}
