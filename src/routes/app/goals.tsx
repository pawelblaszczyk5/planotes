import { Outlet, Title } from 'solid-start';
import { AppMainLayout } from '~/components/AppMainLayout';

const Goals = () => {
	return (
		<>
			<Title>Goals | Planotes</Title>
			<AppMainLayout heading="Goals">
				<Outlet />
			</AppMainLayout>
		</>
	);
};

export default Goals;
