import { $ } from 'execa';

const MAX_RETRIES = 5;

const BASE_DELAY = 1_000;

const deployPrismaMigrationsWithRetrying = () => {
	let currentRetry = 0;

	const execute = async () => {
		try {
			const { stdout } = await $`pnpm prisma migrate deploy`;

			// eslint-disable-next-line no-console -- this is for debugging in deployment logs
			console.log(stdout);
		} catch (error) {
			if (currentRetry >= MAX_RETRIES) throw error;

			const isDatabaseUnavailable = `${error}`.includes("Can't reach");

			if (!isDatabaseUnavailable) throw error;

			const delayMs = BASE_DELAY * 2 ** currentRetry;

			// eslint-disable-next-line no-console -- this is for debugging in deployment logs
			console.log(`Retrying migrations #${currentRetry} after ${delayMs}ms`);

			await new Promise(resolve => {
				setTimeout(resolve, delayMs);
			});

			currentRetry += 1;

			execute();
		}
	};

	return execute();
};

await deployPrismaMigrationsWithRetrying();
