module.exports = {
	overrides: [
		{
			extends: ['canonical', 'canonical/typescript', 'canonical/module', 'canonical/browser', 'canonical/prettier'],
			files: '*.ts',
			parserOptions: {
				project: './tsconfig.json',
			},
			rules: {
				'@typescript-eslint/no-throw-literal': 'off',
				'@typescript-eslint/unbound-method': 'off',
				'@typescript-eslint/no-misused-promises': 'off',
				'@typescript-eslint/return-await': ['error', 'in-try-catch'],
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
				'prettier/prettier': 'error',
				'unicorn/prevent-abbreviations': 'off',
			},
		},
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
			files: '*.tsx',
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
				'prettier/prettier': 'error',
				'unicorn/prevent-abbreviations': 'off',
				'solid/no-innerhtml': 'off',
			},
		},
	],
	plugins: ['solid', 'import', 'prettier'],
};
