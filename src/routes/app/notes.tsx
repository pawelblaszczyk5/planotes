import { createSignal } from 'solid-js';
import { Title } from 'solid-start';
import TextEditor from '~/app/components/TextEditor';

const Notes = () => {
	const [content, setContent] = createSignal('');
	return (
		<>
			<Title>Notes | Planotes</Title>
			<h1>Notes</h1>
			<TextEditor onInput={setContent} />
			<p class="prose" innerHTML={content()} />
		</>
	);
};

export default Notes;
