/* eslint-disable */

import { ESLint } from 'eslint';
import { expect, test } from 'vitest';
import plugin, { type Plugin } from '../index';
import * as noHookMemo from '../rules/no-hook-memo/no-hook-memo.rule';

test('plugin can be loaded by ESLint', async () => {
	// Verify the plugin has expected structure
	expect(plugin).toBeDefined();
	expect(plugin.rules).toBeDefined();
	expect(plugin.rules[noHookMemo.name]).toBeDefined();

	// Create ESLint instance with the plugin
	const eslint = new ESLint(
		{
			plugins: {
				'react-no-manual-memo': plugin satisfies Plugin as any,
			},
			baseConfig: [
				{
					rules: {
						'react-no-manual-memo/no-hook-memo': 'error',
					},
				}
			]
		}
	);

	// Verify we can perform linting (basic smoke test)
	const results = await eslint.lintText('// Empty file');
	expect(results).toBeDefined();
	expect(Array.isArray(results)).toBe(true);
	expect(results.length).toBe(1);
}, 30_000);
