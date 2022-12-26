import { type JSXElement } from 'solid-js';
import { Title, useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import exampleSmall from '~/assets/example-small.webp';
import example from '~/assets/example.webp';
import logo from '~/assets/logo.webp';
import { ButtonLink } from '~/components/Button';
import { Tabs } from '~/components/Tabs';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { MODULE_ICONS } from '~/constants/moduleIcons';
import { isSignedIn } from '~/utils/session';

const FeatureDescription = (props: { children: JSXElement; title: string }) => (
	<div class="flex flex-col gap-6">
		<h2 class="font-500 text-2xl">{props.title}</h2>
		<p class="text-secondary">{props.children}</p>
	</div>
);

export const routeData = () => createServerData$(async (_, { request }) => isSignedIn(request));

const Index = () => {
	const data = useRouteData<typeof routeData>();

	return (
		<>
			<Title>Planotes</Title>
			<div class="w-full">
				<header class="b-b-2 b-primary bg-primary sticky top-0 flex flex items-center justify-between p-6">
					<img src={logo} alt="Planotes" class="h-12 w-12 object-contain" />
					<ButtonLink href={data() ? '/app/home' : '/sign-in'}>{data() ? 'Dashboard' : 'Sign in'}</ButtonLink>
				</header>
				<main class="flex h-full flex-col items-center gap-12 p-12">
					<div class="flex max-w-2xl flex-col items-center">
						<h1 class="mb-6 text-center text-5xl">Planotes</h1>
						<p class="text-secondary text-center">
							Start using Planotes today and take your planning to the next level. Maximize your productivity and gamify
							your progress. Easily track your path towards the sucesss!
						</p>
					</div>
					<picture class="bg-secondary b-primary b-2 rounded shadow shadow-black/50 dark:shadow-black/90">
						<source srcset={example} media="(min-width: 800px)" />
						<img src={exampleSmall} alt="Planotes" />
					</picture>
					<Tabs
						class="w-full max-w-2xl overflow-x-scroll"
						items={[
							{
								content: (
									<FeatureDescription title="Dashboard">
										It's a central place of Planotes, you can quickly check out your recent stats here. See your
										progress towards new prizes and check what you already acomplished!
									</FeatureDescription>
								),
								title: <TextAlignedIcon icon={MODULE_ICONS.home}>Dashboard</TextAlignedIcon>,
								value: 'dashboard',
							},
							{
								content: (
									<FeatureDescription title="Goals">
										These let you group tasks together. You can track progress across related things and quickly check
										out how close you're to finishing these big things! Prize for these is much bigger then for tasks 🚀
									</FeatureDescription>
								),
								title: <TextAlignedIcon icon={MODULE_ICONS.goals}>Goals</TextAlignedIcon>,
								value: 'goals',
							},
							{
								content: (
									<FeatureDescription title="Tasks">
										Tasks are all small things that you want to accomplish. You can group them into tasks or keep them
										standalone. Each one will come with a prize and let's you track a thing in your life. Create them as
										many as you want!
									</FeatureDescription>
								),
								title: <TextAlignedIcon icon={MODULE_ICONS.tasks}>Tasks</TextAlignedIcon>,
								value: 'tasks',
							},
							{
								content: (
									<FeatureDescription title="Notes">
										This feature let you keep your thoughts segregated. What it's even better about it - later you can
										transform these notes into goals or tasks. Let your mind flow here and organize it later!
									</FeatureDescription>
								),
								title: <TextAlignedIcon icon={MODULE_ICONS.notes}>Notes</TextAlignedIcon>,
								value: 'notes',
							},
							{
								content: (
									<FeatureDescription title="Shop">
										Here you can add prizes for yourself. Each step in app will give you a small amount of points.
										Reward yourself with some nice stuff after a hard work!
									</FeatureDescription>
								),
								title: <TextAlignedIcon icon={MODULE_ICONS.shop}>Shop</TextAlignedIcon>,
								value: 'shop',
							},
						]}
					/>
					<p class="text-secondary text-center">Don't waste time, start using Planotes right now!</p>
				</main>
				<footer class="text-secondary pb-6 text-center text-xs">Made by Paweł Błaszczyk</footer>
			</div>
		</>
	);
};

export default Index;
