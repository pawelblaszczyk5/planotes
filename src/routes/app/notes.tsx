import { Title } from 'solid-start';
import TextEditor from '~/app/components/TextEditor';

const Notes = () => {
	return (
		<>
			<Title>Notes | Planotes</Title>
			<h1>Notes</h1>
			<TextEditor maxLength={250} name="test" content="<h1>test</h1>" />
		</>
	);
};

export default Notes;
