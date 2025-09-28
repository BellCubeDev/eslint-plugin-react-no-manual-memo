import * as noComponentMemo from './rules/no-component-memo/no-component-memo.rule';
import * as noCustomMemoHook from './rules/no-custom-memo-hook/no-custom-memo-hook.rule';
import * as noHookMemo from './rules/no-hook-memo/no-hook-memo.rule';
import type { Plugin } from '.';

export const rules = {
	[noComponentMemo.name]: noComponentMemo.rule,
	[noCustomMemoHook.name]: noCustomMemoHook.rule,
	[noHookMemo.name]: noHookMemo.rule,
} satisfies Plugin['rules'];
