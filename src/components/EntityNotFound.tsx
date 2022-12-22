import { Title } from 'solid-start';
import { HttpStatusCode } from 'solid-start/server';
import { LinkWithIcon } from '~/components/Link';
import { type Module } from '~/types';

type EntityNotFoundProps = {
	module: Module;
};

export const EntityNotFound = (props: EntityNotFoundProps) => (
	<>
		<Title>Entity not found 😔 | Planotes</Title>
		<HttpStatusCode code={404} />
		<div class="flex max-w-3xl flex-col gap-6">
			<h2 class="text-xl">We can't find an entity with a given ID 😔</h2>
			<p class="text-secondary text-sm">Make sure you're not using a saved link to a non-existing entity</p>
			<LinkWithIcon icon="i-lucide-coins" class="mr-auto" href={`/app/${props.module}`}>
				Go back to {props.module}
			</LinkWithIcon>
		</div>
	</>
);
