import path from 'node:path';
import alias from '@rollup/plugin-alias';
import withSolid from 'rollup-preset-solid';

export default withSolid({
	input: 'src/index.tsx',
	plugins: [
		alias({
			entries: {
				'~': path.join(process.cwd(), 'src'),
			},
		}),
	],
	targets: ['esm', 'cjs'],
});
