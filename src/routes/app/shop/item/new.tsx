import { Title } from 'solid-start';
import { ItemForm } from '~/components/ItemForm';

const AddItem = () => {
	return (
		<>
			<Title>Add item | Planotes</Title>
			<ItemForm
				description="Here you can add a new item that will be available in the shop for your precious points. Remember that prize can't be too easy. However, it also needs to be worth the hassle!"
				title="Add a new item to shop"
			/>
		</>
	);
};

export default AddItem;
