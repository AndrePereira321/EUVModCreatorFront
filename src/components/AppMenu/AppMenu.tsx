import { m } from "@paraglide/messages.js";

export default function AppMenu() {
	return (
		<nav className="px-2 py-4 border-b border-primary-300">
			<h2 className="text-primary">{m.app_title()}</h2>
		</nav>
	);
}
