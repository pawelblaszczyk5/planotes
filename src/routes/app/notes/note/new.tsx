import { Title } from 'solid-start';
import { NoteForm } from '~/components/NoteForm';

const AddNote = () => {
	return (
		<>
			<Title>Add note | Planotes</Title>
			<NoteForm
				description="Here you can add a new note to keep some thoughts handy. Later it'll be possible to convert this note into either a goal or a task. It's useful to don't lose plans until they clarify! "
				title="Add a new note"
			/>
		</>
	);
};

export default AddNote;
