const NAMED_GREETINGS = ['Hi {name}', 'Hello {name}', 'Howdy {name}', 'Good to see you {name}'] as const;
const ANONYMOUS_GREETINGS = ['Hello', 'Hi', 'Hey there'] as const;

const getRandomArrayElement = <T>(array: Array<T> | ReadonlyArray<T>) =>
	array[Math.floor(Math.random() * array.length)]!;

export const getRandomGreeting = (name?: string | null) => {
	if (!name) return getRandomArrayElement(ANONYMOUS_GREETINGS);

	return getRandomArrayElement(NAMED_GREETINGS).replace('{name}', name);
};
