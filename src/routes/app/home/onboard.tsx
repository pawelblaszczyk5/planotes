import { Button } from '~/components/Button';
import { RouteDialog } from '~/components/Dialog';
import { Input } from '~/components/Input';

const OnboardingDialog = () => {
	return (
		<RouteDialog
			title="Finish your onboarding!"
			description="Before fully working with Planotes we need a few additional info"
		>
			<Input name="lorem">Ipsum</Input>
			<Button>Submit</Button>
		</RouteDialog>
	);
};

export default OnboardingDialog;
