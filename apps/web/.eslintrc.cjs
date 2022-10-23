module.exports = {
	root: true,
	ignorePatterns: ['scripts/**/*'],
	extends: ['planotes'],
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
	},
};
