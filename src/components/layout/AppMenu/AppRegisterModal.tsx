import { useState } from "react";
import { useTranslation } from "react-i18next";

import AppModal from "../../ui/AppModal/AppModal.tsx";
import AppTextInput from "../../ui/AppTextInput/AppTextInput.tsx";

export interface AppRegisterModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export interface RegisterData {
	username: string;
	password: string;
}

export default function AppRegisterModal({ isOpen, onClose }: AppRegisterModalProps) {
	const { t } = useTranslation();

	const [userName, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");

	return (
		<AppModal
			isOpen={isOpen}
			title={t("auth.createAccountTitle")}
			confirmLabel={t("auth.createAccount")}
			onClose={onClose}
		>
			<div className="flex flex-col gap-5 pt-2">
				<AppTextInput
					name="username"
					label={t("auth.username")}
					autoComplete="username"
					value={userName}
					onChange={(value) => setUsername(value)}
				/>
				<AppTextInput
					name="password"
					type="password"
					autoComplete="off"
					label={t("auth.password")}
					value={password}
					onChange={(value) => setPassword(value)}
				/>
				<AppTextInput
					name="passwordConfirm"
					type="password"
					autoComplete="off"
					label={t("auth.passwordConfirm")}
					value={passwordConfirm}
					onChange={(value) => setPasswordConfirm(value)}
				/>
			</div>
		</AppModal>
	);
}
