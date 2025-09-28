// @ts-check

import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";

// @ts-ignore Needed due to moduleResolution Node vs Bundler
import { tanstackConfig } from '@tanstack/config/eslint';
import pluginCspell from '@cspell/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin';

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url));

export default [
	includeIgnoreFile(gitignorePath, "Imported .gitignore patterns"),
	...tanstackConfig,
	eslintPluginPlugin.configs['all-type-checked'],
	{
		rules: {
			'eslint-plugin/test-case-property-ordering': ['error', ['name', 'errors', 'code', 'output']],
		}
	},
	{
		name: 'tanstack/temp',
		plugins: {
			cspell: pluginCspell,
		},
		rules: {
			'cspell/spellchecker': [
				'warn',
				{
					cspell: {
						words: [
							'Promisable', // Our public interface
							'TSES', // @typescript-eslint package's interface
							'codemod', // We support our codemod
							'datatag', // Query options tagging
							'extralight', // Our public interface
							'jscodeshift',
							'refetches', // Query refetch operations
							'retryer', // Our public interface
							'solidjs', // Our target framework
							'tabular-nums', // https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric
							'tanstack', // Our package scope
							'todos', // Too general word to be caught as error
							'tsqd', // Our public interface (TanStack Query Devtools shorthand)
							'tsup', // We use tsup as builder
							'typecheck', // Field of vite.config.ts
							'vue-demi', // dependency of @tanstack/vue-query
							'ɵkind', // Angular specific
							'ɵproviders', // Angular specific
						],
					},
				},
			],
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'no-case-declarations': 'off',
		},
	},
	{
		files: ['**/*.spec.ts*', '**/*.test.ts*', '**/*.test-d.ts*'],
		plugins: { vitest },
		rules: vitest.configs.recommended.rules,
		settings: { vitest: { typecheck: true } },
	},
	{
		plugins: { vitest },
		rules: {
			...vitest.configs.recommended.rules,
			'vitest/expect-expect': [
				'warn',
				{
					assertFunctionNames: ['expect', 'expectArrayEqualIgnoreOrder'],
				},
			],
		},
	},
	{
		ignores: ['src/__tests__/entrypoint.test.ts']
	}
];
