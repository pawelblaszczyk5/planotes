import { type Item } from '@prisma/client';
import { type JSXElement, type ParentComponent, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type FormProps } from 'solid-start';
import { Button } from '~/shared/components/Button';
import { Checkbox } from '~/shared/components/Checkbox';
import { Input } from '~/shared/components/Input';
import { NumberInput } from '~/shared/components/NumberInput';

type ItemFormProps = {
	description: JSXElement;
	errors: Record<string, string>;
	form: ParentComponent<FormProps>;
	item?: Item;
	title: JSXElement;
};

export const ItemForm = (props: ItemFormProps) => (
	<div class="flex max-w-3xl flex-col gap-6">
		<h2 class="text-xl">{props.title}</h2>
		<p class="text-secondary text-sm">{props.description}</p>
		<Dynamic component={props.form} class="flex max-w-xl flex-col gap-6">
			<Input value={props.item?.name ?? ''} error={props.errors['name']} type="text" name="name">
				Name
			</Input>
			<Input value={props.item?.iconUrl ?? ''} error={props.errors['iconUrl']} type="text" name="iconUrl">
				Icon URL (optional)
			</Input>
			<NumberInput value={props.item?.price.toString() ?? '1'} error={props.errors['price']} name="price">
				Price
			</NumberInput>
			<Checkbox checked={props.item?.type === 'RECURRING'} name="isRecurring">
				Recurring item
			</Checkbox>
			<Show when={props.errors['other']}>
				<p class="text-destructive text-sm">{props.errors['other']}</p>
			</Show>
			<Button class="max-w-48 w-full">Add item</Button>
		</Dynamic>
	</div>
);
