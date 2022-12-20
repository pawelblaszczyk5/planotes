import { type Editor } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { type JSXElement, createEffect, createSignal, Show } from 'solid-js';
import { createEditorTransaction, createTiptapEditor, useEditorHTML } from 'solid-tiptap';

type ToggleProps = {
	children: JSXElement;
	isActive: boolean;
	label: string;
	onChange: (active: boolean) => void;
};

const Toggle = (props: ToggleProps) => {
	return (
		<button
			class="[[aria-pressed=true]&]:bg-accent [[aria-pressed=true]&]:text-contrast p-3"
			aria-pressed={props.isActive}
			aria-label={props.label}
			onClick={() => props.onChange(!props.isActive)}
		>
			{props.children}
		</button>
	);
};

type ToggleControlProps = Omit<ToggleProps, 'isActive'> & {
	editor: Editor;
	isActive?: (editor: Editor) => boolean;
	key: string;
};

const ToggleControl = (props: ToggleControlProps) => {
	const flag = createEditorTransaction(
		() => props.editor,
		instance => {
			if (props.isActive) {
				return props.isActive(instance);
			}

			return instance.isActive(props.key);
		},
	);

	return (
		<Toggle isActive={flag()} onChange={value => props.onChange(value)} label={props.label}>
			{props.children}
		</Toggle>
	);
};

const Toolbar = (props: { editor: Editor }) => {
	return (
		<div class="flex gap-3">
			<ToggleControl
				key="heading-1"
				editor={props.editor}
				label="Set heading with level 1"
				onChange={() => props.editor.chain().focus().setHeading({ level: 1 }).run()}
				isActive={editor => editor.isActive('heading', { level: 1 })}
			>
				H1
			</ToggleControl>
			<ToggleControl
				key="heading-2"
				editor={props.editor}
				label="Set paragraph"
				onChange={() => props.editor.chain().focus().setHeading({ level: 2 }).run()}
				isActive={editor => editor.isActive('heading', { level: 2 })}
			>
				H2
			</ToggleControl>
			<ToggleControl
				key="heading-3"
				editor={props.editor}
				label="Set paragraph"
				onChange={() => props.editor.chain().focus().setHeading({ level: 3 }).run()}
				isActive={editor => editor.isActive('heading', { level: 3 })}
			>
				H3
			</ToggleControl>
			<ToggleControl
				key="paragraph"
				editor={props.editor}
				label="Set paragraph"
				onChange={() => props.editor.chain().focus().setParagraph().run()}
			>
				P
			</ToggleControl>
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
