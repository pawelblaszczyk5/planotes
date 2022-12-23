import { For, Show } from 'solid-js';
import { ButtonLink } from '~/components/Button';
import { GoalStatusMenu } from '~/components/GoalStatusMenu';
import { Pagination } from '~/components/Pagination';
import { TextAlignedIcon } from '~/components/TextIconAligned';
import { PRIORITY_ICONS, PRIORITY_TEXT } from '~/constants/priorityDisplay';
import { type getPaginatedGoals } from '~/utils/pagination';

type GoalsListProps = {
	currentPage: number;
	goals: Awaited<ReturnType<typeof getPaginatedGoals>>['goals'];
	hasNextPage: boolean;
};

export const GoalsList = (props: GoalsListProps) => {
	return (
		<>
			<div class="mb-6 flex items-center justify-between gap-12">
				<p class="text-secondary max-w-3xl text-sm">
					Here you can find all your goals that you previously created. You can look browse and edit them or transition
					their status. You can also add a new one by using the button next to this text.
				</p>
				<ButtonLink href="/app/goals/goal/new">Add</ButtonLink>
			</div>
			<ul class="flex flex-col gap-6">
				<For
					each={props.goals}
					fallback={
						<h2 class="text-secondary col-span-full text-center text-sm">
							You don't have any goals yet. Go add your first one and track your work towards the success!
						</h2>
					}
				>
					{goal => (
						<li class="bg-secondary grid grid-cols-1 items-center gap-6 rounded py-6 px-6 shadow shadow-black/50 dark:shadow-black/90 md:grid-cols-[minmax(0,1fr)_11rem]">
							<div class="flex flex-col gap-2">
								<h3 class="truncate text-xl">
									<span class="mr-auto ">{goal.title}</span>
								</h3>
								<p class="text-secondary mb-2 truncate text-sm">{goal.textContent}</p>
								<p class="text-secondary flex items-center text-sm">
									Priority:
									<span class="text-accent ml-1 flex items-center gap-1">
										{PRIORITY_TEXT[goal.priority]} <i class={PRIORITY_ICONS[goal.priority]} />
									</span>
								</p>
								<p class="text-secondary flex items-center text-sm">Progress: {goal.progress}</p>
								<p class="text-secondary flex items-center text-sm">Size: {goal.size}</p>
							</div>
							<div class="flex flex-col gap-6">
								<ButtonLink class="w-44" size="small" href={`/app/goals/goal/${goal.id}`}>
									<TextAlignedIcon icon="i-lucide-eye">View</TextAlignedIcon>
								</ButtonLink>
								<GoalStatusMenu class="w-44" id={goal.id} currentStatus={goal.status} />
							</div>
						</li>
					)}
				</For>
			</ul>
			<Show when={props.currentPage !== 1 || props.hasNextPage}>
				<Pagination currentPage={props.currentPage} hasNextPage={props.hasNextPage} module="goals" class="my-6" />
			</Show>
		</>
	);
};
