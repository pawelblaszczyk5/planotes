import { Outlet, Title } from 'solid-start';
import { AppMainLayout } from '~/components/AppMainLayout';

const Tasks = () => {
	return (
		<>
			<Title>Tasks | Planotes</Title>
			<AppMainLayout
				heading={
					<div class="flex justify-between">
						<span>Tasks</span>
					</div>
				}
			>
				<Outlet />
			</AppMainLayout>
		</>
	);
};

export default Tasks;
