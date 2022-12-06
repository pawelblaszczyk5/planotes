import { Outlet, Title } from 'solid-start';
import { LinkWithIcon } from '~/design/Link';

const Auth = () => (
	<>
		<Title>Sign In | Planotes</Title>
		<div class="relative flex min-h-full w-full items-center justify-center p-6 py-16">
			<LinkWithIcon class="fixed top-6 left-6 block" href="/" icon="i-lucide-corner-down-left" end>
				Main page
			</LinkWithIcon>
			<main class="b-2 b-primary flex flex min-h-full w-full max-w-xl flex-col justify-center gap-6 p-6 p-8">
				<h1 class="text-center text-3xl">Welcome!</h1>
				<Outlet />
			</main>
		</div>
	</>
);

export default Auth;
