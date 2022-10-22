import { Temporal } from '@js-temporal/polyfill';

export const getCurrentDate = () => Temporal.Now.zonedDateTimeISO('UTC');

export const isDateBefore = (dateToCheck: Temporal.ZonedDateTime, dateToCompareAgainst: Temporal.ZonedDateTime) =>
	Temporal.ZonedDateTime.compare(dateToCheck, dateToCompareAgainst) === -1;

export const isDateInPast = (dateToCheck: Temporal.ZonedDateTime) => isDateBefore(dateToCheck, getCurrentDate());

export const convertEpochSecondsToDate = (seconds: number) =>
	Temporal.Instant.fromEpochSeconds(seconds).toZonedDateTimeISO('UTC');

export const getDateWithOffset = (offset: Temporal.Duration | Temporal.DurationLike) => getCurrentDate().add(offset);

export const getCurrentEpochSeconds = () => getCurrentDate().epochSeconds;
