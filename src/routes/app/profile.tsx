import { Show } from 'solid-js';
import { type RouteDataFunc, Title, useRouteData } from 'solid-start';
import { createServerAction$, redirect } from 'solid-start/server';
import { AppMainLayout } from '~/components/AppMainLayout';
import { Button } from '~/components/Button';
import { UserSettingsForm } from '~/components/UserSettingsForm';
import { REDIRECTS } from '~/constants/redirects';
import { type routeData as parentRouteData } from '~/routes/app';
import { db } from '~/utils/db';
import { createSignOutCookie, requireUserId } from '~/utils/session';

export const routeData = (({ data }) => {
	return { user: data.user };
}) satisfies RouteDataFunc<typeof parentRouteData>;

const Profile = () => {
	const { user } = useRouteData<typeof routeData>();

	const [, deleteAccountTrigger] = createServerAction$(async (_: FormData, { request }) => {
		const userId = await requireUserId(request);

		const deleteItems = db.item.deleteMany({
			where: {
				userId,
			},
		});

		const deleteMagicLinks = db.magicLink.deleteMany({
			where: {
				userId,
			},
		});

		const deleteBalanceEntries = db.balanceEntry.deleteMany({
			where: {
				userId,
			},
		});

		const deleteNotes = db.note.deleteMany({
			where: {
				userId,
			},
		});

		const deleteTasks = db.task.deleteMany({
			where: {
				userId,
			},
		});

		const deleteGoals = db.goal.deleteMany({
			where: {
				userId,
			},
		});

		const deleteUser = db.user.delete({
			where: {
				id: userId,
			},
		});

		await db.$transaction([
			deleteGoals,
			deleteTasks,
			deleteNotes,
			deleteItems,
			deleteMagicLinks,
			deleteBalanceEntries,
			deleteUser,
		]);

		const cookie = await createSignOutCookie(request);

		return redirect(REDIRECTS.MAIN, {
			headers: {
				'Set-Cookie': cookie,
			},
		});
	});

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
					<deleteAccountTrigger.Form>
						<Button variant="destructive" class="max-w-48 mr-auto w-full">
							Delete account
						</Button>
					</deleteAccountTrigger.Form>
				</div>
			</AppMainLayout>
		</>
	);
};

export default Profile;
