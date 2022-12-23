export const calculateAdjustedPercent = (now: number, max: number) => {
	const progressPercent = (now / max) * 100;

	return progressPercent < 50 ? Math.round(progressPercent) : Math.floor(progressPercent);
};
