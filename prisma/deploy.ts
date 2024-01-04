import { $ } from 'execa';

process.env['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/planotes';

const MAX_RETRIES = 5;

const BASE_DELAY = 1_000;

const deployPrismaMigrationsWithRetrying = () => {
	let currentRetry = 0;

	const execute = async () => {
		try {
			await $`pnpm prisma migrate deploy`;
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