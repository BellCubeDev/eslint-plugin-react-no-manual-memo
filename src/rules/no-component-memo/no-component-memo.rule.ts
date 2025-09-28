import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { getDocsUrl } from '../../utils/get-docs-url';
import { detectReactImports } from '../../utils/detect-react-imports';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { ExtraRuleDocs } from '../../types';

export const name = 'no-component-memo';

const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(getDocsUrl);

function isReactMemo(
	node: TSESTree.CallExpression,
	helpers: { isReactImport: (node: TSESTree.Identifier) => boolean; }
): boolean {
	// Handle React.memo()
	if (
		node.callee.type === AST_NODE_TYPES.MemberExpression &&
		node.callee.object.type === AST_NODE_TYPES.Identifier &&
		node.callee.object.name === 'React' &&
		node.callee.property.type === AST_NODE_TYPES.Identifier &&
		node.callee.property.name === 'memo'
	) {
		return true;
	}

	// Handle memo() (imported directly)
	if (
		node.callee.type === AST_NODE_TYPES.Identifier &&
		node.callee.name === 'memo' &&
		helpers.isReactImport(node.callee)
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
			description: 'Disallow React.memo() in favor of React Compiler automatic memoization',
			recommended: 'warn',
		},
		messages: {
			noMemo: 'Avoid React.memo(). Let React Compiler handle memoization automatically.',
		},
		fixable: 'code',
		schema: [],
	},
	defaultOptions: [],

	create: detectReactImports((context, _, helpers) => {
		const sourceCode = context.sourceCode;
		const importedComponents = new Map<string, string>();

		function isImportedFromExternalPackage(componentName: string): boolean {
			const importSource = importedComponents.get(componentName);
			if (!importSource) return false;

			// Relative imports are definitely internal
			if (importSource.startsWith('.') || importSource.startsWith('/')) {
				return false;
			}

			// For non-scoped packages, assume they're external npm packages
			// Examples: 'react', 'lodash', 'axios', 'classnames'
			if (!importSource.includes('/') || importSource.includes('node_modules')) {
				return true;
			}

			// Some common patterns for internal import aliases
			const internalAliasPatterns = [
				/^@(?:\/|[^/]*$)/, // e.g. @/components/Button (we sadly can't detect `@components/Button` without checking an infinite number of possible alias configs)
				/^[~#$]/, // e.g. ~/components/Button or #db/schema
			];

			for (const pattern of internalAliasPatterns) {
				if (pattern.test(importSource)) {
					return false;
				}
			}

			// Default to external for anything else we can't clearly identify as internal
			return true;
		}

		function isExternalComponent(node: TSESTree.CallExpression): boolean {
			const [componentArg] = node.arguments;
			if (!componentArg) return false;

			// Check if the component is a direct identifier reference to an imported component
			if (componentArg.type === AST_NODE_TYPES.Identifier) {
				return isImportedFromExternalPackage(componentArg.name);
			}

			return false;
		}

		function getAutoFix(node: TSESTree.CallExpression): TSESLint.ReportFixFunction | null {
			const [componentArg, comparisonArg] = node.arguments;
			if (!componentArg) return null;

			// Don't auto-fix if there's a comparison function
			if (comparisonArg && comparisonArg.type !== AST_NODE_TYPES.Literal) return null;

			return (fixer: TSESLint.RuleFixer) => {
				return fixer.replaceText(node, sourceCode.getText(componentArg));
			};
		}

		return {
			ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
				const source = node.source.value;

				for (const specifier of node.specifiers) {
					if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
						importedComponents.set(specifier.local.name, source);
					} else if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
						importedComponents.set(specifier.local.name, source);
					}
				}
			},

			CallExpression: (node: TSESTree.CallExpression) => {
				if (!isReactMemo(node, helpers)) return;

				// Don't flag React.memo if it's wrapping an external component
				if (isExternalComponent(node)) return;

				const fix = getAutoFix(node);

				context.report({
					node,
					messageId: 'noMemo',
					fix,
				});
			},
		};
	}),
});
