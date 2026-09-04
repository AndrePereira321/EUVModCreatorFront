import { m } from "@paraglide/messages.js";

export default function AppMenu() {
	return (
		<nav>
			<span>{m.app_title()}</span>
		</nav>
	);
}
