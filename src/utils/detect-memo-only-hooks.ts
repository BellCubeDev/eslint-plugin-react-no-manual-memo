import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { ESLintUtils, TSESLint, TSESTree } from '@typescript-eslint/utils';

type Create = Parameters<
	ReturnType<typeof ESLintUtils.RuleCreator>
>[0]['create'];

type Context = Parameters<Create>[0];
type Options = Parameters<Create>[1];
type Helpers = {
	getMemoOnlyHookAnalysis: (node: TSESTree.Node) => HookAnalysis;
	isWithinMemoOnlyCustomHook: (node: TSESTree.Node) => boolean;
};

type EnhancedCreate = (
	context: Context,
	options: Options,
	helpers: Helpers,
) => ReturnType<Create>;

export interface HookAnalysis {
	isMemoOnly: boolean;
	callsOtherHooks: boolean;
	containsJSX: boolean;
	usesCallback: boolean;
	usesMemo: boolean;
}

export function detectMemoOnlyHooks(create: EnhancedCreate): Create {
	return (context, optionsWithDefault) => {
		const hookAnalyses = new Map<TSESTree.Node, HookAnalysis>();
		const sourceCode = context.sourceCode;

		function isHookName(name: string): boolean {
			return /^use[A-Z]/.test(name);
		}

		function isMemoHook(name: string): boolean {
			return name === 'useCallback' || name === 'useMemo';
		}

		function isOtherHook(name: string): boolean {
			return isHookName(name) && !isMemoHook(name);
		}

		function analyzeHookFunction(node: TSESTree.Node): HookAnalysis {
			if (hookAnalyses.has(node)) {
				return hookAnalyses.get(node)!;
			}

			const analysis: HookAnalysis = {
				isMemoOnly: false,
				callsOtherHooks: false,
				containsJSX: false,
				usesCallback: false,
				usesMemo: false,
			};

			// Traverse the function body to analyze hook calls and JSX
			function traverse(currentNode: TSESTree.Node): void {
				switch (currentNode.type) {
					case AST_NODE_TYPES.JSXElement:
					case AST_NODE_TYPES.JSXFragment:
						analysis.containsJSX = true;
						break;

					case AST_NODE_TYPES.CallExpression:
						if (currentNode.callee.type === AST_NODE_TYPES.Identifier) {
							const calleeName = currentNode.callee.name;
							if (calleeName === 'useCallback') {
								analysis.usesCallback = true;
							} else if (calleeName === 'useMemo') {
								analysis.usesMemo = true;
							} else if (isOtherHook(calleeName)) {
								analysis.callsOtherHooks = true;
							}
						} else if (
							currentNode.callee.type === AST_NODE_TYPES.MemberExpression &&
							currentNode.callee.object.type === AST_NODE_TYPES.Identifier &&
							currentNode.callee.object.name === 'React' &&
							currentNode.callee.property.type === AST_NODE_TYPES.Identifier
						) {
							const methodName = currentNode.callee.property.name;
							if (methodName === 'useCallback') {
								analysis.usesCallback = true;
							} else if (methodName === 'useMemo') {
								analysis.usesMemo = true;
							} else if (isOtherHook(methodName)) {
								analysis.callsOtherHooks = true;
							}
						}
						break;
				}

				// Recursively traverse child nodes
				for (const key of sourceCode.visitorKeys[currentNode.type] || []) {
					const child = (currentNode as any)[key];
					if (Array.isArray(child)) {
						child.forEach((item) => {
							if (item && typeof item === 'object' && 'type' in item) {
								traverse(item);
							}
						});
					} else if (child && typeof child === 'object' && 'type' in child) {
						traverse(child);
					}
				}
			}

			// Get the function body for analysis
			let bodyNode: TSESTree.Node | undefined;
			if ('body' in node && node.body) { // eslint-disable-line eslint-plugin/no-property-in-node
				bodyNode = node.body as TSESTree.Node;
			} else if (
				node.type === AST_NODE_TYPES.VariableDeclarator &&
				node.init &&
				'body' in node.init // eslint-disable-line eslint-plugin/no-property-in-node
			) {
				bodyNode = node.init.body as TSESTree.Node;
			}

			if (bodyNode) {
				traverse(bodyNode);
			}

			// Determine if this is a memo-only hook
			analysis.isMemoOnly =
				(analysis.usesCallback || analysis.usesMemo) &&
				!analysis.callsOtherHooks &&
				!analysis.containsJSX;

			hookAnalyses.set(node, analysis);
			return analysis;
		}

		function findContainingFunction(node: TSESTree.Node): TSESTree.Node | undefined {
			let current = node.parent;
			while (current) {
				if (
					current.type === AST_NODE_TYPES.FunctionDeclaration ||
					current.type === AST_NODE_TYPES.FunctionExpression ||
					current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
					(current.type === AST_NODE_TYPES.VariableDeclarator &&
						current.init &&
						(current.init.type === AST_NODE_TYPES.FunctionExpression ||
							current.init.type === AST_NODE_TYPES.ArrowFunctionExpression))
				) {
					return current;
				}
				current = current.parent;
			}
			return undefined;
		}

		const helpers: Helpers = {
			getMemoOnlyHookAnalysis(node: TSESTree.Node): HookAnalysis {
				return analyzeHookFunction(node);
			},
			isWithinMemoOnlyCustomHook(node: TSESTree.Node): boolean {
				const containingFunction = findContainingFunction(node);
				if (!containingFunction) return false;
				return helpers.getMemoOnlyHookAnalysis(containingFunction).isMemoOnly;
			},
		};

		const detectionInstructions: TSESLint.RuleListener = {
			// Pre-analyze all function declarations and variable declarators that might be hooks
			FunctionDeclaration(node) {
				if (node.id && isHookName(node.id.name)) {
					analyzeHookFunction(node);
				}
			},
			VariableDeclarator(node) {
				if (
					node.id.type === AST_NODE_TYPES.Identifier &&
					isHookName(node.id.name) &&
					node.init &&
					(node.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
						node.init.type === AST_NODE_TYPES.FunctionExpression)
				) {
					analyzeHookFunction(node);
				}
			},
		};

		// Call original rule definition
		const ruleInstructions = create(context, optionsWithDefault, helpers);
		const enhancedRuleInstructions: TSESLint.RuleListener = {};

		const allKeys = new Set(
			Object.keys(detectionInstructions).concat(Object.keys(ruleInstructions)),
		);

		// Iterate over ALL instruction keys so we can override original rule instructions
		// to prevent their execution if conditions to report errors are not met.
		allKeys.forEach((instruction) => {
			enhancedRuleInstructions[instruction] = (node) => {
				if (instruction in detectionInstructions) {
					detectionInstructions[instruction]?.(node);
				}

				const ruleInstruction = ruleInstructions[instruction];

				if (ruleInstruction) {
					return ruleInstruction(node);
				}

				return undefined;
			};
		});

		return enhancedRuleInstructions;
	};
}
