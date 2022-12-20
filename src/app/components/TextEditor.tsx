import { type Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { createEffect, createSignal, Show } from 'solid-js';
import { createTiptapEditor, useEditorHTML } from 'solid-tiptap';

const Toolbar = (props: { editor: Editor }) => {
	return (
		<div>
			<button onClick={() => props.editor.chain().focus().setHeading({ level: 1 }).run()}>h1</button>
			<button onClick={() => props.editor.chain().focus().setParagraph().run()}>p</button>
		</div>
	);
};

const TextEditor = (props: { onInput: (content: string) => void }) => {
	const [editorContainer, setEditorContainer] = createSignal<HTMLDivElement>();

	const editor = createTiptapEditor(() => ({
		content: '<h1>bla bla</h1>',
		editorProps: {
			attributes: {
				class: 'p-3 ring-primary prose prose:text- max-w-full',
			},
		},
		// @ts-expect-error - something off with typings
		element: editorContainer(),
		extensions: [StarterKit],
	}));

	const html = useEditorHTML(editor);

	createEffect(() => {
		props.onInput(html() ?? '');
	});

	return (
		<div>
			<Show when={editor()}>
				<Toolbar editor={editor()!} />
			</Show>
			<div ref={setEditorContainer} />
		</div>
	);
};

export default TextEditor;
