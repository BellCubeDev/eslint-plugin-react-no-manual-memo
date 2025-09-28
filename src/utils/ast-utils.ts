import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export const ASTUtils = {
	isNodeOfOneOf<T extends AST_NODE_TYPES>(
		node: TSESTree.Node,
		types: ReadonlyArray<T>,
	): node is TSESTree.Node & { type: T; } {
		return types.includes(node.type as T);
	},
	isValidReactComponentOrHookName(
		identifier: TSESTree.Identifier | null | undefined,
	): identifier is TSESTree.Identifier & {name: `use${string}` | Capitalize<string>} {
		return (
			identifier !== null &&
			identifier !== undefined &&
			/^((?:use)?[A-Z])/.test(identifier.name)
		);
	},
	getFunctionAncestor(
		sourceCode: Readonly<TSESLint.SourceCode>,
		node: TSESTree.Node,
	) {
		for (const ancestor of sourceCode.getAncestors(node)) {
			if (ASTUtils.isNodeOfOneOf(ancestor, [
				AST_NODE_TYPES.FunctionDeclaration,
				AST_NODE_TYPES.FunctionExpression,
				AST_NODE_TYPES.ArrowFunctionExpression,
			])) {
				return ancestor;
			}
		}

		return undefined;
	},
};
