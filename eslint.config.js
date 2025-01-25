const { es2021, node } = require('globals');

module.exports = [
	{
		files: [ '**/*.js' ], // Apply to all JavaScript files
		languageOptions: {
			ecmaVersion: 'latest', // Use the latest ECMAScript version
			sourceType: 'module', // Use ES modules
			globals: {
				...es2021,
				...node,
			},
		},
		rules: {

			// Manually include recommended ESLint rules based on "eslint:recommended"
			'no-undef': 'error',
			'no-unused-vars': 'warn',
			'no-extra-semi': 'error',
			'no-redeclare': 'error',

			// Custom rules as per your original config
			indent: [ 'error', 'tab' ],
			quotes: [ 'error', 'single' ],
			semi: [ 'error', 'always' ],
			curly: [ 'error', 'multi-or-nest', 'consistent' ],
			'brace-style': [ 'error', '1tbs' ],
			'comma-spacing': 'error',
			'function-paren-newline': [ 'error', 'multiline-arguments' ],
			'function-call-argument-newline': [ 'error', 'consistent' ],
			'object-property-newline': [
				'error',
				{ allowAllPropertiesOnSameLine: true, },
			],
			'object-curly-newline': [
				'error',
				{ multiline: true, },
			],
			'array-element-newline': [ 'error', 'consistent' ],
			'array-bracket-newline': [
				'error',
				{ multiline: true, },
			],
			'key-spacing': 'error',
			'keyword-spacing': 'error',
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': 'error',
			'no-trailing-spaces': 'error',
			'operator-linebreak': [
				'error',
				'before',
				{
					overrides: {
						'||': 'after',
						'&&': 'after',
						'=': 'after',
						'+=': 'after',
						'-=': 'after',
						'*=': 'after',
						'/=': 'after',
					},
				},
			],
			'multiline-ternary': [ 'error', 'always-multiline' ],
			'space-before-blocks': 'error',
			'space-infix-ops': 'error',
			'arrow-spacing': 'error',
			'object-curly-spacing': [ 'error', 'always' ],
			'array-bracket-spacing': [ 'error', 'always' ],
			'lines-around-comment': [
				'error',
				{
					beforeBlockComment: true,
					beforeLineComment: true,
				},
			],
			'one-var': [
				'error',
				{
					initialized: 'never',
					uninitialized: 'consecutive',
				},
			],
			'no-mixed-operators': 'error',
			'dot-notation': 'error',
			'no-lonely-if': 'error',
			'no-else-return': 'error',
			'no-var': 'error',
			yoda: 'error',
		},
	},
];
