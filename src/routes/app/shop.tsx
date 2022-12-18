import { type RouteDataFunc, Outlet, Title, useRouteData } from 'solid-start';
import { type routeData as parentRouteData } from '~/routes/app';
import { AppMainLayout } from '~/shared/components/AppMainLayout';
import { Badge } from '~/shared/components/Badge';

export const routeData = (({ data }) => {
	return { user: data.user };
}) satisfies RouteDataFunc<typeof parentRouteData>;

const Shop = () => {
	const { user } = useRouteData<typeof routeData>();

	return (
		<>
			<Title>Shop | Planotes</Title>
			<AppMainLayout
				heading={
					<div class="flex justify-between">
						<span>Shop</span>
						<Badge type="info">Your balance: {user()?.balance}</Badge>
					</div>
				}
			>
				<Outlet />
			</AppMainLayout>
		</>
	);
};

export default Shop;
