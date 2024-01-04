/* eslint-disable no-console -- These logs are for debugging */

import { PrismaClient } from '@prisma/client';
import { $ } from 'execa';

const MAX_RETRIES = 5;

const BASE_DELAY = 1_000;

const DATABASE_PUBLIC_URL = process.env['DATABASE_PUBLIC_URL'];

if (!DATABASE_PUBLIC_URL) {
	throw new Error('DATABASE_PUBLIC_URL must be defined for waking up db');
}

const tryWakingUpDatabase = async () => {
	try {
		await new PrismaClient({ datasources: { db: { url: DATABASE_PUBLIC_URL } } }).$connect();
	} catch (error_) {
		console.log(error_);
	}
};

const deployPrismaMigrationsWithRetrying = () => {
	let currentRetry = 0;

	const execute = async () => {
		try {
			const { stdout } = await $`pnpm prisma migrate deploy`;

			console.log(stdout);
		} catch (error) {
			if (currentRetry >= MAX_RETRIES) throw error;

			const isDatabaseUnavailable = `${error}`.includes("Can't reach");

			if (!isDatabaseUnavailable) throw error;

			await tryWakingUpDatabase();

			const delayMs = BASE_DELAY * 2 ** currentRetry;
			currentRetry += 1;

			console.log(`Retrying migrations #${currentRetry} after ${delayMs}ms`);

			await new Promise(resolve => {
				setTimeout(resolve, delayMs);
			});

			execute();
		}
	};

	return execute();
};

await deployPrismaMigrationsWithRetrying();
