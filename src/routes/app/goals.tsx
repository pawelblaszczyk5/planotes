import { Outlet, Title } from 'solid-start';
import { AppMainLayout } from '~/components/AppMainLayout';

const Goals = () => {
	return (
		<>
			<Title>Goals | Planotes</Title>
			<AppMainLayout
				heading={
					<div class="flex justify-between">
						<span>Goals</span>
					</div>
				}
			>
				<Outlet />
			</AppMainLayout>
		</>
	);
};

export default Goals;
