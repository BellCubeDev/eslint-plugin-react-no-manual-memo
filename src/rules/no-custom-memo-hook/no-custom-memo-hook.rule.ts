import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { detectMemoOnlyHooks } from '../../utils/detect-memo-only-hooks';
import { detectReactImports } from '../../utils/detect-react-imports';
import { getDocsUrl } from '../../utils/get-docs-url';
import type { HookAnalysis } from '../../utils/detect-memo-only-hooks';
import type { ExtraRuleDocs } from '../../types';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(getDocsUrl);

export const name = 'no-custom-memo-hook';

const RECOMMENDED_FIX = `
Consider either:
- Inlining this hook's logic directly into the components that use it, allowing the React Compiler to optimize them fully
- Removing memoization and renaming to a regular function (no "use" prefix) so the React Compiler can optimize calls to the function
`.trim();

export enum NoCustomMemoHookMessageIDs {
	noMemoOnlyHookBoth = 'noMemoOnlyHookBoth',
	noMemoOnlyHookMemo = 'noMemoOnlyHookMemo',
	noMemoOnlyHookCallback = 'noMemoOnlyHookCallback',
}

export const rule = createRule({
	name: 'no-custom-memo-hook',
	defaultOptions: [],
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow custom hooks that only use useCallback and useMemo',
			recommended: 'warn',
		},
		messages: {
			[NoCustomMemoHookMessageIDs.noMemoOnlyHookBoth]:
				`Custom hook "{{ hookName }}" is a memo-only custom hook. It only calls the hooks useCallback and useMemo. ${RECOMMENDED_FIX}`,
			[NoCustomMemoHookMessageIDs.noMemoOnlyHookMemo]:
				`Custom hook "{{ hookName }}" is a memo-only custom hook. It only calls the hook useMemo. ${RECOMMENDED_FIX}`,
			[NoCustomMemoHookMessageIDs.noMemoOnlyHookCallback]:
				`Custom hook "{{ hookName }}" is a memo-only custom hook. It only calls the hook useCallback. ${RECOMMENDED_FIX}`,
		},
		schema: [],
	},
	create: detectReactImports((context, _options, _reactHelpers) => {
		// eslint-disable-next-line no-shadow
		return detectMemoOnlyHooks((context, _options, memoHelpers) => {
			function getHookName(node: TSESTree.Node): string | undefined {
				if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
					return node.id?.name;
				} else if (node.type === AST_NODE_TYPES.VariableDeclarator) {
					const id = node.id as TSESTree.Identifier | undefined;
					return id?.name;
				}
				return undefined;
			}

			function isHookName(nameToCheck: string): boolean {
				return /^use[A-Z]/.test(nameToCheck);
			}

			function reportMemoOnlyHook(node: TSESTree.Node, hookName: string, analysis: HookAnalysis): void {
				context.report({
					node,
					messageId:
						analysis.usesCallback
							? analysis.usesMemo ? NoCustomMemoHookMessageIDs.noMemoOnlyHookBoth
								: NoCustomMemoHookMessageIDs.noMemoOnlyHookCallback
							: analysis.usesMemo ? NoCustomMemoHookMessageIDs.noMemoOnlyHookMemo
								: 'INTERNAL_ERROR___ESLINT_PLUGIN_REACT_NO_MANUAL_MEMO___IN_RULE___NO_CUSTOM_MEMO_HOOK' as never,
					data: {
						hookName,
					},
				});
			}

			return {
				FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
					const hookName = getHookName(node);
					if (!hookName || !isHookName(hookName)) return;
					const analysis = memoHelpers.getMemoOnlyHookAnalysis(node);
					if (analysis.isMemoOnly) {
						reportMemoOnlyHook(node, hookName, analysis);
					}
				},

				VariableDeclarator(node: TSESTree.VariableDeclarator) {
					if (!node.init) return;
					if (node.init.type !== AST_NODE_TYPES.ArrowFunctionExpression && node.init.type !== AST_NODE_TYPES.FunctionExpression) return;

					const hookName = getHookName(node);

					if (!hookName || !isHookName(hookName)) return;

					const analysis = memoHelpers.getMemoOnlyHookAnalysis(node);
					if (analysis.isMemoOnly) {
						reportMemoOnlyHook(node, hookName, analysis);
					}
				},
			};
		})(context, _options);
	}),
});
