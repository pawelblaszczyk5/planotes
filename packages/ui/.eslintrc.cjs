module.exports = {
	root: true,
	extends: ['planotes'],
	overrides: [
		{
			files: '*.ts',
			rules: {
				'no-restricted-imports': 'off',
			},
		},
		{
			files: '*.tsx',
			rules: {
				'no-restricted-imports': 'off',
			},
		},
	],
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
	},
};
