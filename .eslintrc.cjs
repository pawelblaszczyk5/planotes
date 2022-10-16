// eslint-disable-next-line no-undef
module.exports = {
	extends: ['canonical', 'canonical/prettier'],
	overrides: [
		{
			extends: ['canonical/typescript', 'canonical/module', 'canonical/browser', 'canonical/prettier'],
			files: '*.ts',
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		{
			extends: [
				'canonical/module',
				'canonical/browser',
				'canonical/jsx-a11y',
				'canonical/typescript',
				'plugin:solid/typescript',
				'canonical/prettier',
			],
			files: '*.tsx',
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		{
			extends: ['canonical/json'],
			files: '*.json',
		},
	],
	plugins: ['solid', 'import'],
	root: true,
	rules: {
		'canonical/filename-match-exported': 'off',
		'canonical/filename-match-regex': 'off',
		'import/no-unassigned-import': 'off',
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: ['.*'],
						message: "Don't use relative imports",
					},
				],
			},
		],
	},
};
