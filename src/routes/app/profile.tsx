import { Show } from 'solid-js';
import { type RouteDataFunc, Title, useRouteData } from 'solid-start';
import { UserSettingsForm } from '~/app/components/UserSettingsForm';
import { type routeData as parentRouteData } from '~/routes/app';
import { AppMainLayout } from '~/shared/components/AppMainLayout';
import { Button } from '~/shared/components/Button';

export const routeData = (({ data }) => {
	return { user: data.user };
}) satisfies RouteDataFunc<typeof parentRouteData>;

const Profile = () => {
	const { user } = useRouteData<typeof routeData>();

	return (
		<>
			<Title>Profile | Planotes</Title>
			<AppMainLayout heading="Profile">
				<div class="mb-6 flex max-w-3xl flex-col gap-6">
					<h2 class="text-xl">Edit profile info</h2>
					<p class="text-secondary text-sm">
						Here are settings that you previously set during an onboarding. As I promised, here you can edit them at any
						time to make the experience more personal.
					</p>
					<Show when={user()}>
						<UserSettingsForm isProfileSection user={user()!} />
					</Show>
				</div>
				<div class="flex max-w-3xl flex-col gap-6">
					<h2 class="text-destructive flex items-center text-xl">
						<i class="i-lucide-alert-triangle mr-3" />
						Danger zone
					</h2>
					<p class="text-secondary text-sm">
						CAUTION! Here you can delete your account if you wish so. This action is irreversible. All progress and data
						will be lost and removed. It'll be impossible to recover it.
					</p>
					<Button variant="destructive" class="max-w-48 mr-auto w-full">
						Delete account
					</Button>
				</div>
			</AppMainLayout>
		</>
	);
};

export default Profile;
