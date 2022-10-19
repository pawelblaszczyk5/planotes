import { useRouteData } from 'solid-start';
import { createServerData$ } from 'solid-start/server';

export const routeData = () => createServerData$(async () => 'world');

const Index = () => {
	const data = useRouteData<typeof routeData>();

	return <h1 class="p-4">Hello {data()}!</h1>;
};

export default Index;
