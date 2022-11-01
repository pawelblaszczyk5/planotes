module.exports = {
	ignorePatterns: ['scripts/**/*'],
	plugins: ['solid', 'import', 'prettier'],
	overrides: [
		{
			extends: [
				'canonical',
				'canonical/module',
				'canonical/browser',
				'canonical/jsx-a11y',
				'canonical/typescript',
				'plugin:solid/typescript',
				'canonical/prettier',
			],
			files: ['*.ts', '*.tsx'],
			parserOptions: {
				project: './tsconfig.json',
			},
			rules: {
				'@typescript-eslint/no-throw-literal': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/unbound-method': 'off',
				'@typescript-eslint/no-misused-promises': 'off',
				'@typescript-eslint/return-await': ['error', 'in-try-catch'],
				'jsx-a11y/label-has-associated-control': 'off',
				'canonical/filename-match-exported': 'off',
				'canonical/filename-match-regex': 'off',
				'canonical/id-match': 'off',
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
				'consistent-return': 'off',
				'prettier/prettier': 'error',
				'unicorn/prevent-abbreviations': 'off',
				'unicorn/no-array-reduce': 'off',
				'solid/no-innerhtml': 'off',
				'import/extensions': [
					2,
					'never',
					{
						ignorePackages: true,
						pattern: {
							json: 'always',
							svg: 'always',
							webp: 'always',
						},
					},
				],
				'@typescript-eslint/array-type': ['error', { default: 'generic' }],
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unnecessary-type-constraint': 'off',
			},
		},
	],
};
