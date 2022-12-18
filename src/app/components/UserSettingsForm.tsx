import { type User } from '@prisma/client';
import { Show } from 'solid-js';
import { FormError, redirect } from 'solid-start';
import { createServerAction$ } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/shared/components/Button';
import { type ComboboxOption, Combobox } from '~/shared/components/Combobox';
import { Input } from '~/shared/components/Input';
import { REDIRECTS } from '~/shared/constants/redirects';
import { IANA_TIMEZONES } from '~/shared/constants/timezones';
import { createDebouncedSignal } from '~/shared/primitives/debouncedSignal';
import { db } from '~/shared/utils/db';
import {
	type FormErrors,
	convertFormDataIntoObject,
	COMMON_FORM_ERRORS,
	zodErrorToFieldErrors,
	createFormFieldsErrors,
} from '~/shared/utils/form';
import { requireUserId } from '~/shared/utils/session';

const timezonesComboboxOptions = IANA_TIMEZONES.map<ComboboxOption>(timezone => ({
	label: timezone.replaceAll('_', ' '),
	value: timezone,
}));

const FORM_ERRORS = {
	AVATAR_SEED_REQUIRED: 'Avatar seed is required',
	NAME_REQUIRED: 'Name is required',
	TIMEZONE_INVALID: 'Make sure you choosed a proper timezone',
} as const satisfies FormErrors;

const userSettingsFormSchema = z.object({
	avatarSeed: z
		.string({
			invalid_type_error: FORM_ERRORS.AVATAR_SEED_REQUIRED,
			required_error: FORM_ERRORS.AVATAR_SEED_REQUIRED,
		})
		.min(1, FORM_ERRORS.AVATAR_SEED_REQUIRED),
	name: z
		.string({
			invalid_type_error: FORM_ERRORS.NAME_REQUIRED,
			required_error: FORM_ERRORS.NAME_REQUIRED,
		})
		.trim()
		.min(1, FORM_ERRORS.NAME_REQUIRED),
	timezone: z.enum(IANA_TIMEZONES, {
		invalid_type_error: FORM_ERRORS.TIMEZONE_INVALID,
		required_error: FORM_ERRORS.TIMEZONE_INVALID,
	}),
});

export const UserSettingsForm = (props: { user: User }) => {
	const [onboard, onboardTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const userId = await requireUserId(request);

		const parsedFormData = userSettingsFormSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedFormData.success) {
			const errors = parsedFormData.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		await db.user.update({
			data: {
				avatarSeed: parsedFormData.data.avatarSeed,
				name: parsedFormData.data.name,
				timezone: parsedFormData.data.timezone,
			},
			where: { id: userId },
		});

		return redirect(request.headers.get('referer') ?? REDIRECTS.HOME);
	});

	const onboardErrors = createFormFieldsErrors(() => onboard.error);

	const [avatarSeed, setAvatarSeed] = createDebouncedSignal('');

	const avatarUrl = () =>
		`/api/avatar/${encodeURIComponent(avatarSeed() || props.user.avatarSeed || props.user.email)}`;

	const userTimezone = () => {
		if (import.meta.env.SSR) return null;

		return (
			timezonesComboboxOptions.find(
				timezone => timezone.value === new Intl.DateTimeFormat().resolvedOptions().timeZone,
			) ?? null
		);
	};

	const handleInputsChange = (
		event: InputEvent & {
			currentTarget: HTMLDivElement;
			target: Element;
		},
	) => {
		if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'avatarSeed') return;

		setAvatarSeed(event.target.value);
	};

	return (
		<onboardTrigger.Form class="flex flex-col gap-6">
			<div class="flex flex w-full flex-col flex-col items-center gap-6 md:flex-row-reverse">
				<img class="max-w-32 block" src={avatarUrl()} alt="New avatar preview" />
				<div class="flex w-full flex-col gap-6" onInput={handleInputsChange}>
					<Input error={onboardErrors()['name']} name="name">
						Name
					</Input>
					<Input name="avatarSeed" error={onboardErrors()['avatarSeed']}>
						Avatar seed
					</Input>
				</div>
			</div>
			<Combobox options={timezonesComboboxOptions} maxOptions={20} value={userTimezone()} name="timezone">
				Timezone
			</Combobox>
			<Show when={onboardErrors()['other']}>
				<p class="text-destructive text-sm">{onboardErrors()['other']}</p>
			</Show>
			<Button class="max-w-48 mx-auto w-full">Save profile</Button>
		</onboardTrigger.Form>
	);
};
