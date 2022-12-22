// This helper allows creating modules that are stable across development live reloading

declare global {
	// eslint-disable-next-line no-var, vars-on-top, @typescript-eslint/naming-convention
	var __globalModules: Map<string, unknown>;
}

global.__globalModules ??= new Map();

const isDevelopmentEnvironment = import.meta.env.DEV;

export const createStableModule = <Module>(key: string, createModule: () => Module): Module => {
	if (!isDevelopmentEnvironment) {
		return createModule();
	}

	if (!global.__globalModules.has(key)) {
		global.__globalModules.set(key, createModule());
	}

	return global.__globalModules.get(key) as Module;
};
