import type { Meta, StoryObj } from "@storybook/react-vite";

const ROLES = [
	{
		className: "text-display",
		use: "Landing and gallery headlines",
		sample: "Change your game without touching a file",
	},
	{ className: "text-title", use: "Page title, and every h1", sample: "My mods" },
	{ className: "text-heading", use: "Sections, modal titles, and every h2", sample: "Install your mod" },
	{ className: "text-subheading", use: "Card and group titles, and every h3", sample: "Mod details" },
	{
		className: "text-body",
		use: "Running text and inputs; the page default",
		sample:
			"Pick what you want to change, and the app builds the files for you and hands them over as a download, with instructions for installing it.",
	},
	{ className: "text-small", use: "Help text and secondary lines", sample: "Only you can see this mod." },
	{ className: "text-label", use: "Form labels, menu items, small buttons", sample: "Mod name" },
	{ className: "text-caption", use: "Metadata and chips", sample: "Edited 2 minutes ago" },
] as const;

const meta = {
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roles: Story = {
	render: () => (
		<dl className="grid max-w-4xl gap-6 sm:grid-cols-[12rem_1fr]">
			{ROLES.map((role) => (
				<div key={role.className} className="contents">
					<dt className="flex flex-col gap-1">
						<code className="text-label text-primary-strong">{role.className}</code>
						<span className="text-caption text-muted">{role.use}</span>
					</dt>
					<dd className={`max-w-prose ${role.className}`}>{role.sample}</dd>
				</div>
			))}
		</dl>
	),
};
