import { createSignal } from 'solid-js';
import { Title, unstable_clientOnly } from 'solid-start';

const TextEditor = unstable_clientOnly(async () => import('~/app/components/TextEditor'));

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
