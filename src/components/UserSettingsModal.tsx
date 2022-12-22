import { type User } from '@prisma/client';
import { RouteDialog } from '~/components/Dialog';
import { UserSettingsForm } from '~/components/UserSettingsForm';

type UserSettingsModalProps = {
	user: User;
};

const UserSettingsModal = (props: UserSettingsModalProps) => (
	<RouteDialog
		title="Finish your onboarding!"
		description="There are few additional things to make your experience with Planotes awesomely personalized 😊 You can edit these options on your profile anytime!"
	>
		<UserSettingsForm user={props.user} />
	</RouteDialog>
);

export default UserSettingsModal;
