import { Outlet, Title } from 'solid-start';
import { AppMainLayout } from '~/shared/components/AppMainLayout';

const Notes = () => {
	return (
		<>
			<Title>Notes | Planotes</Title>
			<AppMainLayout heading="Notes">
				<Outlet />
			</AppMainLayout>
		</>
	);
};

export default Notes;
