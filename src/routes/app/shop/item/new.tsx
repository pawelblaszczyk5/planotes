import { createServerAction$ } from 'solid-start/server';
import { Button } from '~/shared/components/Button';
import { Checkbox } from '~/shared/components/Checkbox';
import { Input } from '~/shared/components/Input';
import { NumberInput } from '~/shared/components/NumberInput';

const AddItem = () => {
	const [addItem, addItemTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		return {};
	});

	return (
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">Add new item to shop</h2>
			<p class="text-secondary text-sm">
				Here you can add a new item that will be available in the shop for your precious points. Remember that prize
				can't be too easy. However, it also needs to be worth the hassle!
			</p>
			<addItemTrigger.Form class="flex max-w-xl flex-col gap-6">
				<Input type="text" name="name">
					Name
				</Input>
				<Input type="text" name="iconUrl">
					Icon URL (optional)
				</Input>
				<NumberInput name="price">Price</NumberInput>
				<Checkbox name="isRecurring">Recurring item</Checkbox>
				<Button class="max-w-48 w-full">Add item</Button>
			</addItemTrigger.Form>
		</div>
	);
};

export default AddItem;
