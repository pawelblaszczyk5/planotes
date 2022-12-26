import { Outlet, Title } from 'solid-start';
import { AppMainLayout } from '~/components/AppMainLayout';

const Tasks = () => {
	return (
		<>
			<Title>Tasks | Planotes</Title>
			<AppMainLayout heading="Tasks">
				<Outlet />
			</AppMainLayout>
		</>
	);
};

export default Tasks;
