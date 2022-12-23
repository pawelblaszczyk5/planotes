import { type COMPLETABLE_STATUS } from '@prisma/client';
import * as dialog from '@zag-js/dialog';
import { useMachine, normalizeProps } from '@zag-js/solid';
import { createUniqueId, createMemo, Show, Suspense, For } from 'solid-js';
import { Portal } from 'solid-js/web';
import { A } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { Input } from '~/components/Input';
import { createDebouncedSignal } from '~/primitives/debouncedSignal';
import { db } from '~/utils/db';
import { requireUserId } from '~/utils/session';

type SearchModalProps = {
	onClose: () => void;
};

const MAX_ITEMS_FROM_CATEGORY = 3;

const SearchFallback = () => <p class="text-secondary text-sm">Write something in above input to conduct a search</p>;
const CategoryFallback = (props: { category: string }) => (
	<p class="text-secondary text-sm">We can't find items with a given term among {props.category}</p>
);

type ItemProps = {
	href: string;
	onClick: () => void;
	text: string;
	title: string;
};

const Item = (props: ItemProps) => (
	<A
		class="ring-primary bg-secondary flex flex-col gap-3 py-3 px-6 shadow shadow-black/50 dark:shadow-black/90"
		onClick={() => props.onClick()}
		href={props.href}
	>
		<span class="text-500 text-lg">{props.title}</span>
		<span class="text-secondary text-sm">{props.text}</span>
	</A>
);

const sliceTextContent = (textContent: string, term: string) => {
	const sliceStartIndex = textContent.indexOf(term) - 50;
	const sliceEndIndex = textContent.indexOf(term) + term.length + 50;

	const adjustedTermIndex = Math.max(0, sliceStartIndex);
	const adjustedTermEndIndex = Math.min(textContent.length, sliceEndIndex);

	return `${adjustedTermIndex === 0 ? '' : '...'}${textContent.slice(adjustedTermIndex, adjustedTermEndIndex)}${
		adjustedTermEndIndex === textContent.length ? '' : '...'
	}`;
};

export const SearchModal = (props: SearchModalProps) => {
	const [state, send] = useMachine(
		dialog.machine({
			closeOnEsc: true,
			closeOnOutsideClick: true,
			defaultOpen: true,
			id: createUniqueId(),
			onClose: () => props.onClose(),
		}),
	);
	const [searchTerm, setSearchTerm] = createDebouncedSignal('');
	const results = createServerData$(
		async (term: string, { request }) => {
			await requireUserId(request);

			if (!term) {
				return undefined;
			}

			const searchOptions = {
				contains: term,
				mode: 'insensitive',
			} as const;
			const statusOptions: { notIn: Array<COMPLETABLE_STATUS> } = {
				notIn: ['ARCHIVED', 'COMPLETED'],
			};

			const promises = [
				db.goal.findMany({
					select: {
						id: true,
						textContent: true,
						title: true,
					},
					take: MAX_ITEMS_FROM_CATEGORY,
					where: {
						OR: [
							{
								status: statusOptions,
								textContent: searchOptions,
							},
							{
								status: statusOptions,
								title: searchOptions,
							},
						],
					},
				}),
				db.note.findMany({
					select: {
						id: true,
						name: true,
						textContent: true,
					},
					take: MAX_ITEMS_FROM_CATEGORY,
					where: {
						OR: [
							{
								textContent: searchOptions,
							},
							{
								name: searchOptions,
							},
						],
					},
				}),
				db.task.findMany({
					select: {
						id: true,
						textContent: true,
						title: true,
					},
					take: MAX_ITEMS_FROM_CATEGORY,
					where: {
						OR: [
							{
								status: statusOptions,
								textContent: searchOptions,
							},
							{
								status: statusOptions,
								title: searchOptions,
							},
						],
					},
				}),
			] as const;

			const [goals, notes, tasks] = await Promise.all(promises);

			return {
				goals: goals.map(goal => ({ ...goal, textContent: sliceTextContent(goal.textContent, term) })),
				notes: notes.map(note => ({ ...note, textContent: sliceTextContent(note.textContent, term) })),
				tasks: tasks.map(task => ({ ...task, textContent: sliceTextContent(task.textContent, term) })),
			};
		},
		{
			key: () => searchTerm() ?? '',
		},
	);

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	return (
		<Portal>
			<div class="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm" {...api().backdropProps} />
			<div {...api().containerProps}>
				<div
					{...api().contentProps}
					class="bg-primary ring-primary fixed top-1/2 left-1/2 z-20 max-h-[calc(100%-4rem)] w-[calc(100%-4rem)] max-w-2xl translate-x--1/2 translate-y--1/2 overflow-y-auto rounded-lg p-8 shadow-md shadow-black/50 dark:shadow-black/90"
				>
					<h3 class="b-b-1 b-primary font-500 mb-4 pb-2 text-3xl" {...api().titleProps}>
						Search your Planotes
					</h3>
					<p class="text-secondary mb-6 text-sm" {...api().descriptionProps}>
						You can search your whole Planotes here. Easily find your goals, tasks or notes by just a simple term!
					</p>
					<div class="flex flex-col gap-6">
						<Input onInput={setSearchTerm} value={searchTerm() ?? ''} name="term">
							Your search term
						</Input>
						<Suspense fallback={<SearchFallback />}>
							<Show when={results()} fallback={<SearchFallback />}>
								<h4 class="text-500 text-xl">Goals</h4>
								<For each={results()!.goals} fallback={<CategoryFallback category="goals" />}>
									{goal => (
										<Item
											title={goal.title}
											text={goal.textContent}
											onClick={() => api().close()}
											href={`/app/goals/goal/${goal.id}`}
										/>
									)}
								</For>
								<h4 class="text-500 text-xl">Tasks</h4>
								<For each={results()!.goals} fallback={<CategoryFallback category="tasks" />}>
									{task => (
										<Item
											title={task.title}
											text={task.textContent}
											onClick={() => api().close()}
											href={`/app/tasks/task/${task.id}`}
										/>
									)}
								</For>
								<h4 class="text-500 text-xl">Notes</h4>
								<For each={results()!.notes} fallback={<CategoryFallback category="notes" />}>
									{note => (
										<Item
											title={note.name}
											text={note.textContent}
											onClick={() => api().close()}
											href={`/app/notes/note/${note.id}`}
										/>
									)}
								</For>
							</Show>
						</Suspense>
					</div>
					<button
						{...api().closeTriggerProps}
						class="ring-primary fixed top-2 right-2 grid h-10 w-10 place-items-center rounded"
					>
						<i class="i-lucide-x" aria-label="Close" />
					</button>
				</div>
			</div>
		</Portal>
	);
};
