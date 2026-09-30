import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AppMain from "./components/layout/AppMain.tsx";
import "./i18n/config.ts";

import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/noto-sans";

import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppMain />
	</StrictMode>,
);
