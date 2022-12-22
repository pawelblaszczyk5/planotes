type GetOptional<ObjectToRetrieveOptional extends Record<string, unknown>> = {
	[Key in keyof ObjectToRetrieveOptional as Partial<Pick<ObjectToRetrieveOptional, Key>> extends Pick<
		ObjectToRetrieveOptional,
		Key
	>
		? Key
		: never]: ObjectToRetrieveOptional[Key];
};

export type DefaultProps<Props extends Record<string, unknown>> = GetOptional<Props>;

export type Module = 'goals' | 'notes' | 'shop' | 'tasks';
