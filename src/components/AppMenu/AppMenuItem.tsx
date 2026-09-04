interface AppMenuItemProps {
	title: string;
}

export default function AppMenuItem(props: AppMenuItemProps) {
	return (
		<div>
			<span>{props.title}</span>
		</div>
	);
}
