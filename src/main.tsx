import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AppMain from "./components/AppMain.tsx";
import "./i18n/config.ts";

import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppMain />
	</StrictMode>,
);
