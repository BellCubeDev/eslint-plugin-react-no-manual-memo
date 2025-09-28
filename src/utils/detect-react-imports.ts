import { TSESTree } from '@typescript-eslint/utils';
import type { ESLintUtils, TSESLint } from '@typescript-eslint/utils';

type Create = Parameters<
	ReturnType<typeof ESLintUtils.RuleCreator>
>[0]['create'];

type Context = Parameters<Create>[0];
type Options = Parameters<Create>[1];
type Helpers = {
	isReactImport: (node: TSESTree.Identifier) => boolean;
};

type EnhancedCreate = (
	context: Context,
	options: Options,
	helpers: Helpers,
) => ReturnType<Create>;

export function detectReactImports(create: EnhancedCreate): Create {
	return (context, optionsWithDefault) => {
		const reactImportSpecifiers: Array<TSESTree.ImportClause> = [];

		const helpers: Helpers = {
			isReactImport(node) {
				return !!reactImportSpecifiers.find((specifier) => {
					if (specifier.type === TSESTree.AST_NODE_TYPES.ImportSpecifier) {
						return node.name === specifier.local.name;
					}

					return false;
				});
			},
		};

		const detectionInstructions: TSESLint.RuleListener = {
			ImportDeclaration(node) {
				if (
					node.specifiers.length > 0 &&
					node.importKind === 'value' &&
					node.source.value === 'react'
				) {
					reactImportSpecifiers.push(...node.specifiers);
				}
			},
		};

		// Call original rule definition
		const ruleInstructions = create(context, optionsWithDefault, helpers);
		const enhancedRuleInstructions: TSESLint.RuleListener = {};

		const allKeys = new Set(
			Object.keys(detectionInstructions).concat(Object.keys(ruleInstructions)),
		);

		// Iterate over ALL instructions keys so we can override original rule instructions
		// to prevent their execution if conditions to report errors are not met.
		allKeys.forEach((instruction) => {
			enhancedRuleInstructions[instruction] = (node) => {
				if (instruction in detectionInstructions) {
					detectionInstructions[instruction]?.(node);
				}

				const ruleInstruction = ruleInstructions[instruction];

				// TODO: canReportErrors()
				if (ruleInstruction) {
					return ruleInstruction(node);
				}

				return undefined;
			};
		});

		return enhancedRuleInstructions;
	};
}
