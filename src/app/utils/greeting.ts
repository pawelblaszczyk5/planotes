const NAMED_GREETINGS = [
	'Hi {name}',
	'Hello {name}',
	'Howdy {name}',
	'Cześć {name}',
	'Bonjour {name}',
	'Hola {name}',
	'Ciao {name}',
	'Kia Ora {name}',
	"G'day {name}",
	'Geia {name}',
	'Nǐ hǎo {name}',
] as const;
const ANONYMOUS_GREETINGS = NAMED_GREETINGS.map(greeting => greeting.replace(' {name}', ''));

const getRandomArrayElement = <Item>(array: Array<Item> | ReadonlyArray<Item>) =>
	array[Math.floor(Math.random() * array.length)]!;

export const getRandomGreeting = (name?: string | null) => {
	if (!name) return getRandomArrayElement(ANONYMOUS_GREETINGS);

	return getRandomArrayElement(NAMED_GREETINGS).replace('{name}', name);
};
