import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { ASTUtils } from '../../utils/ast-utils';
import { detectMemoOnlyHooks } from '../../utils/detect-memo-only-hooks';
import { detectReactImports } from '../../utils/detect-react-imports';
import { getDocsUrl } from '../../utils/get-docs-url';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { ExtraRuleDocs } from '../../types';

export const name = 'no-hook-memo';

const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(getDocsUrl);

function isUseMemoOrUseCallback(
	node: TSESTree.CallExpression,
	helpers: { isReactImport: (node: TSESTree.Identifier) => boolean; }
): { isHook: boolean; hookName: 'useMemo' | 'useCallback' | null; } {
	// Handle React.useMemo() or React.useCallback()
	if (
		node.callee.type === AST_NODE_TYPES.MemberExpression &&
		node.callee.object.type === AST_NODE_TYPES.Identifier &&
		node.callee.object.name === 'React' &&
		node.callee.property.type === AST_NODE_TYPES.Identifier &&
		(node.callee.property.name === 'useMemo' || node.callee.property.name === 'useCallback')
	) {
		return { isHook: true, hookName: node.callee.property.name };
	}

	// Handle useMemo() or useCallback() (imported directly)
	if (
		node.callee.type === AST_NODE_TYPES.Identifier &&
		(node.callee.name === 'useMemo' || node.callee.name === 'useCallback') &&
		helpers.isReactImport(node.callee)
	) {
		return { isHook: true, hookName: node.callee.name };
	}

	return { isHook: false, hookName: null };
}



function isSimpleArrowFunction(func: TSESTree.ArrowFunctionExpression): func is (TSESTree.ArrowFunctionExpression & {expression: true}) | (TSESTree.ArrowFunctionExpression & {body: TSESTree.BlockStatement & {body: {length: 1; 0: TSESTree.ReturnStatement}}}) {
	// () => expression
	if (func.expression) {
		return true;
	}

	// () => { return expression }
	if (
		func.body.type === AST_NODE_TYPES.BlockStatement &&
		func.body.body.length === 1 &&
		func.body.body[0]!.type === AST_NODE_TYPES.ReturnStatement
	) {
		return true;
	}

	return false;
}

export const rule = createRule({
	name,
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow manual memoization hooks (useMemo, useCallback) in favor of React Compiler',
			recommended: 'warn',
		},
		messages: {
			noUseMemo: 'Avoid using useMemo directly in components. Let React Compiler handle memoization inside components automatically.',
			noUseCallback: 'Avoid using useCallback directly in components. Let React Compiler handle memoization inside components automatically.',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],

	create: detectReactImports((context, _, reactHelpers) => {
		// eslint-disable-next-line no-shadow
		return detectMemoOnlyHooks((context, _, memoHelpers) => {
			const sourceCode = context.sourceCode;

			function getAutoFix(
				node: TSESTree.CallExpression,
				hookName: 'useMemo' | 'useCallback'
			): TSESLint.ReportFixFunction | null {
				const [funcArg] = node.arguments;
				if (!funcArg) return null;

				if (hookName === 'useCallback') {
					// For useCallback, just unwrap the function
					return (fixer: TSESLint.RuleFixer) => {
						return fixer.replaceText(node, sourceCode.getText(funcArg));
					};
				}

				// For useMemo, handle simple cases only
				if (funcArg.type === AST_NODE_TYPES.ArrowFunctionExpression && isSimpleArrowFunction(funcArg)) {
					return (fixer: TSESLint.RuleFixer) => {
						if (funcArg.expression) {
							// () => expression
							return fixer.replaceText(node, sourceCode.getText(funcArg.body));
						} else {
							// () => { return expression }
							const returnStmt = funcArg.body.body[0];
							return fixer.replaceText(node, sourceCode.getText(returnStmt.argument!));
						}
					};
				}

				// Simple function expressions with single return
				if (
					funcArg.type === AST_NODE_TYPES.FunctionExpression &&
					funcArg.body.body.length === 1 &&
					funcArg.body.body[0]?.type === AST_NODE_TYPES.ReturnStatement &&
					funcArg.body.body[0].argument
				) {
					return (fixer: TSESLint.RuleFixer) => {
						const returnStmt = funcArg.body.body[0] as TSESTree.ReturnStatement;
						return fixer.replaceText(node, sourceCode.getText(returnStmt.argument!));
					};
				}

				// Unwrap the useMemo hook and call the function directly if it's too complex to unwrap any further than that
				if (funcArg.type === AST_NODE_TYPES.ArrowFunctionExpression || funcArg.type === AST_NODE_TYPES.FunctionExpression) {
					return (fixer: TSESLint.RuleFixer) => {
						return fixer.replaceText(node, `(${sourceCode.getText(funcArg)})()`);
					};
				}

				// For identifiers passed to useMemo, unwrap and call directly
				if (funcArg.type === AST_NODE_TYPES.Identifier) {
					return (fixer: TSESLint.RuleFixer) => {
						return fixer.replaceText(node, `${sourceCode.getText(funcArg)}()`);
					};
				}

				return null;
			}

			return {
				CallExpression: (node: TSESTree.CallExpression) => {
					const { isHook, hookName } = isUseMemoOrUseCallback(node, reactHelpers);

					if (!isHook || !hookName) return;

					const fnAncestor = ASTUtils.getFunctionAncestor(sourceCode, node);

					// eslint-disable-next-line eslint-plugin/no-property-in-node
					const fnAncestorId = fnAncestor?.id ?? (fnAncestor?.parent && 'id' in fnAncestor.parent && fnAncestor.parent.id && 'name' in fnAncestor.parent.id ? fnAncestor.parent.id : undefined);

					// Only flag hooks inside React components
					if (!fnAncestor || (fnAncestorId && !ASTUtils.isValidReactComponentOrHookName(fnAncestorId))) {
						return;
					}

					// Skip if we're in a custom hook that would be flagged by no-custom-memo-hook
					if (
						fnAncestorId?.name.startsWith('use') &&
						memoHelpers.isWithinMemoOnlyCustomHook(node)
					) {
						return;
					}

					const messageId = hookName === 'useMemo' ? 'noUseMemo' : 'noUseCallback';
					const fix = getAutoFix(node, hookName);

					context.report({
						node,
						messageId,
						fix,
					});
				},
			};
		})(context, _);
	}),
});
