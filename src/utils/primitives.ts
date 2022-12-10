import { createSignal } from 'solid-js';

export const createDebouncedSignal = <SignalValueType>(
	initialValue?: Parameters<typeof createSignal<SignalValueType>>[0],
	debounceTime: number = 500,
) => {
	const [value, internalSetValue] = createSignal(initialValue);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const setValue = (newValue: Parameters<typeof internalSetValue>[0]) => {
		clearTimeout(debounceTimer);

		debounceTimer = setTimeout(() => {
			internalSetValue(newValue);
		}, debounceTime);
	};

	return [value, setValue] as const;
};
