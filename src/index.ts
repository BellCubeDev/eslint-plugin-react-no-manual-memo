import packageJson from '../package.json';
import { rules } from './rules';
import { namespace } from './namespace';
import type { ESLint, Linter } from 'eslint';
import type { ESLintUtils } from '@typescript-eslint/utils';
import type { ExtraRuleDocs } from './types';

export interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
	rules: Record<string, ESLintUtils.RuleModule<
		string,
		ReadonlyArray<unknown>,
		ExtraRuleDocs,
		ESLintUtils.RuleListener
	>>;
	configs: {
		recommended: ESLint.ConfigData;
		all: ESLint.ConfigData;
		'flat/recommended': Array<Linter.Config>;
		'flat/all': Array<Linter.Config>;
	};
}

export const plugin = {
	meta: {
		name: packageJson.name,
		version: packageJson.version,
		namespace,
	},
	configs: {
		recommended: {
			plugins: [namespace],
			rules: {
				[`${namespace}/no-hook-memo`]: 'error',
				[`${namespace}/no-component-memo`]: 'error',
				[`${namespace}/no-custom-memo-hook`]: 'warn',
			},
		},
		all: {
			plugins: [namespace],
			rules: {
				[`${namespace}/no-hook-memo`]: 'error',
				[`${namespace}/no-component-memo`]: 'error',
				[`${namespace}/no-custom-memo-hook`]: 'error',
			},
		},
		'flat/recommended': [
			{
				name: `${namespace}/flat/recommended`,
				plugins: {
					[namespace]: {}, // circular ref; assigned after the plugin object is initially created
				},
				rules: {
					[`${namespace}/no-hook-memo`]: 'error',
					[`${namespace}/no-component-memo`]: 'error',
					[`${namespace}/no-custom-memo-hook`]: 'warn',
				},
			},
		],
		'flat/all': [
			{
				name: `${namespace}/flat/all`,
				plugins: {
					[namespace]: {}, // circular ref; assigned after the plugin object is initially created
				},
				rules: {
					[`${namespace}/no-hook-memo`]: 'error',
					[`${namespace}/no-component-memo`]: 'error',
					[`${namespace}/no-custom-memo-hook`]: 'error',
				},
			},
		],
	},
	rules: rules,
} satisfies Plugin;

plugin.configs['flat/recommended'][0]!.plugins[namespace] = plugin;
plugin.configs['flat/all'][0]!.plugins[namespace] = plugin;

export default plugin;
