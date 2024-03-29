import { type Editor } from '@tiptap/core';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { StarterKit } from '@tiptap/starter-kit';
import clsx from 'clsx';
import { type JSXElement, createSignal, Show, mergeProps, createUniqueId, createEffect, untrack } from 'solid-js';
import { createEditorTransaction, createTiptapEditor, useEditorHTML } from 'solid-tiptap';
import { type DefaultProps } from '~/types';

type ToggleProps = {
	children: JSXElement;
	isActive: boolean;
	label: string;
	onChange: (active: boolean) => void;
};

const Toggle = (props: ToggleProps) => {
	return (
		<button
			type="button"
			class="[[aria-pressed=true]&]:bg-primary [[aria-pressed=true]&]:text-accent ring-primary grid h-10 w-10 place-items-center rounded-sm text-xl"
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

const Separator = () => <div role="separator" aria-orientation="vertical" class="b-accent b-r-1.5 mx-2 h-6" />;

const ToggleControl = (props: ToggleControlProps) => {
	const flag = createEditorTransaction(
		() => props.editor,
		instance => props.isActive?.(instance) ?? instance.isActive(props.key),
	);

	return (
		<Toggle isActive={flag()} onChange={value => props.onChange(value)} label={props.label}>
			{props.children}
		</Toggle>
	);
};

const Toolbar = (props: { editor: Editor; hasError: boolean }) => {
	return (
		<div
			class={clsx('bg-secondary b-b-2 flex flex-wrap items-center gap-y-1 p-1', {
				'b-destructive': props.hasError,
				'b-primary': !props.hasError,
			})}
		>
			<div class="flex">
				<ToggleControl
					key="heading-1"
					editor={props.editor}
					label="Set heading with level 1"
					onChange={() => props.editor.chain().focus().setHeading({ level: 1 }).run()}
					isActive={editor => editor.isActive('heading', { level: 1 })}
				>
					<i class="i-lucide-heading-1" />
				</ToggleControl>
				<ToggleControl
					key="heading-2"
					editor={props.editor}
					label="Set heading with level 2"
					onChange={() => props.editor.chain().focus().setHeading({ level: 2 }).run()}
					isActive={editor => editor.isActive('heading', { level: 2 })}
				>
					<i class="i-lucide-heading-2" />
				</ToggleControl>
				<ToggleControl
					key="heading-3"
					editor={props.editor}
					label="Set heading with level 3"
					onChange={() => props.editor.chain().focus().setHeading({ level: 3 }).run()}
					isActive={editor => editor.isActive('heading', { level: 3 })}
				>
					<i class="i-lucide-heading-3" />
				</ToggleControl>
				<ToggleControl
					key="paragraph"
					editor={props.editor}
					label="Set paragraph"
					onChange={() => props.editor.chain().focus().setParagraph().run()}
				>
					<i class="i-lucide-corner-down-left" />
				</ToggleControl>
				<ToggleControl
					key="codeBlock"
					editor={props.editor}
					label="Toggle code block"
					onChange={() => props.editor.chain().focus().toggleCodeBlock().run()}
				>
					<i class="i-lucide-code-2" />
				</ToggleControl>
			</div>
			<Separator />
			<div class="flex">
				<ToggleControl
					key="bold"
					editor={props.editor}
					label="Toggle bold"
					onChange={() => props.editor.chain().focus().toggleBold().run()}
				>
					<i class="i-lucide-bold" />
				</ToggleControl>
				<ToggleControl
					key="italic"
					editor={props.editor}
					label="Toggle italic"
					onChange={() => props.editor.chain().focus().toggleItalic().run()}
				>
					<i class="i-lucide-italic" />
				</ToggleControl>
				<ToggleControl
					key="strike"
					editor={props.editor}
					label="Toggle strike-through"
					onChange={() => props.editor.chain().focus().toggleStrike().run()}
				>
					<i class="i-lucide-strikethrough" />
				</ToggleControl>
				<ToggleControl
					key="underline"
					editor={props.editor}
					label="Toggle underline"
					onChange={() => props.editor.chain().focus().toggleUnderline().run()}
				>
					<i class="i-lucide-underline" />
				</ToggleControl>
				<ToggleControl
					key="code"
					editor={props.editor}
					label="Toggle code"
					onChange={() => props.editor.chain().focus().toggleCode().run()}
				>
					<i class="i-lucide-code" />
				</ToggleControl>
				<ToggleControl
					key="highlight"
					editor={props.editor}
					label="Toggle highlight"
					onChange={() => props.editor.chain().focus().toggleHighlight().run()}
				>
					<i class="i-lucide-highlighter" />
				</ToggleControl>
			</div>
			<Separator />
			<div class="flex">
				<ToggleControl
					key="bulletList"
					editor={props.editor}
					label="Toggle bullet list"
					onChange={() => props.editor.chain().focus().toggleBulletList().run()}
				>
					<i class="i-lucide-list" />
				</ToggleControl>
				<ToggleControl
					key="orderedList"
					editor={props.editor}
					label="Toggle ordered list"
					onChange={() => props.editor.chain().focus().toggleOrderedList().run()}
				>
					<i class="i-lucide-list-ordered" />
				</ToggleControl>
				<ToggleControl
					key="blockquote"
					editor={props.editor}
					label="Toggle blockquote"
					onChange={() => props.editor.chain().focus().toggleBlockquote().run()}
				>
					<i class="i-lucide-quote" />
				</ToggleControl>
			</div>
			<Separator />
			<div class="flex">
				<ToggleControl
					key="textAlignLeft"
					editor={props.editor}
					label="Align left"
					isActive={editor => editor.isActive({ textAlign: 'left' })}
					onChange={() => props.editor.chain().focus().setTextAlign('left').run()}
				>
					<i class="i-lucide-align-left" />
				</ToggleControl>
				<ToggleControl
					key="textAlignCenter"
					editor={props.editor}
					label="Align center"
					isActive={editor => editor.isActive({ textAlign: 'center' })}
					onChange={() => props.editor.chain().focus().setTextAlign('center').run()}
				>
					<i class="i-lucide-align-center" />
				</ToggleControl>
				<ToggleControl
					key="textAlignRight"
					editor={props.editor}
					label="Align right"
					isActive={editor => editor.isActive({ textAlign: 'right' })}
					onChange={() => props.editor.chain().focus().setTextAlign('right').run()}
				>
					<i class="i-lucide-align-right" />
				</ToggleControl>
			</div>
		</div>
	);
};

type TextEditorProps = {
	children: JSXElement;
	class?: string;
	error?: string | undefined;
	maxLength: number;
	name: string;
	value?: string;
};

const DEFAULT_TEXT_EDITOR_PROPS = {
	class: '',
	value: '',
} as const satisfies DefaultProps<TextEditorProps>;

const TextEditor = (props: TextEditorProps) => {
	const propsWithDefaults = mergeProps(DEFAULT_TEXT_EDITOR_PROPS, props);
	const [editorContainer, setEditorContainer] = createSignal<HTMLDivElement>();

	const id = createUniqueId();

	const hasError = () => Boolean(propsWithDefaults.error);

	const editor = createTiptapEditor(() => ({
		content: propsWithDefaults.value,
		editorProps: {
			attributes: {
				class:
					'px-6 py-3 ring-primary prose max-w-full h-60 b-primary overflow-auto -outline-offset-1 rounded-lg rounded-t-0',
				id,
			},
		},
		// @ts-expect-error - something off with typings
		element: editorContainer(),
		extensions: [
			StarterKit,
			TextAlign.configure({
				alignments: ['left', 'center', 'right'],
				types: ['heading', 'paragraph'],
			}),
			CharacterCount.configure({ limit: propsWithDefaults.maxLength }),
			Highlight,
			Underline,
		],
	}));

	const html = useEditorHTML(editor);
	const characterCount = createEditorTransaction(editor, instance =>
		instance ? instance.storage['characterCount'].characters() : 0,
	);

	createEffect(() => {
		untrack(editor)?.setOptions({ content: props.value ?? '' });
	});

	return (
		<div class={propsWithDefaults.class}>
			<a class="text-secondary cursor-default select-none pb-1 text-sm" href={`#${id}`} tabIndex={-1}>
				{propsWithDefaults.children}
			</a>
			<div
				class={clsx(
					editor() && {
						'b-2 overflow-hidden rounded-lg': true,
						'b-destructive': hasError(),
						'b-primary': !hasError(),
					},
				)}
			>
				<Show when={editor()}>
					<Toolbar hasError={hasError()} editor={editor()!} />
				</Show>
				<div ref={setEditorContainer} />
			</div>
			<Show when={editor()}>
				<div class="flex items-start justify-between pt-3">
					<Show when={hasError()}>
						<p class="text-destructive text-sm" role="alert">
							{propsWithDefaults.error}
						</p>
					</Show>
					<p class="text-secondary ml-auto text-sm">
						Characters count: {characterCount()}/{propsWithDefaults.maxLength}
					</p>
				</div>
				<input type="hidden" name={propsWithDefaults.name} value={html() ?? ''} />
			</Show>
		</div>
	);
};

export default TextEditor;
