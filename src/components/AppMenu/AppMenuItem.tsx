export interface AppMenuItemProps {
	id: string;
	title: string;
	path: string;
}

export default function AppMenuItem(props: AppMenuItemProps) {
	return (
		<li id={props.id}>
			<a href={props.path}>{props.title}</a>
		</li>
	);
}
