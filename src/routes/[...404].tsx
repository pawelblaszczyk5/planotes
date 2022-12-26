import { Title } from 'solid-start';
import { HttpStatusCode } from 'solid-start/server';
import { Link } from '~/components/Link';

const NotFound = () => (
	<main class="m-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-6">
		<Title>Are you lost? 😔 | Planotes</Title>
		<HttpStatusCode code={404} />
		<h2 class="text-xl">Are you lost? 😔</h2>
		<p class="text-secondary text-sm">
			It looks like the link you entered is invalid. Make sure you're navigating properly and not doing some monkey
			buisness with the URL. If you think it's not an error feel free to contact me, very appreciated!
		</p>
		<Link href="/">Go back to main page</Link>
	</main>
);

export default NotFound;
