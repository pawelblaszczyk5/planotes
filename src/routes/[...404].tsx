import { Title } from 'solid-start';
import { HttpStatusCode } from 'solid-start/server';

const NotFound = () => {
	return (
		<main>
			<Title>Planotes | Not found :(</Title>
			<HttpStatusCode code={404} />
			<h1>Page Not Found</h1>
		</main>
	);
};

export default NotFound;
