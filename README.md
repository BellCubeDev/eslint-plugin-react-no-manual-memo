# eslint-plugin-react-no-manual-memo

[![npm version](https://badge.fury.io/js/eslint-plugin-react-no-manual-memo.svg)](https://badge.fury.io/js/eslint-plugin-react-no-manual-memo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ESLint plugin for codebases using React Compiler. Flags manual memoization (`useMemo`, `useCallback`, `React.memo`), reminding you to let the compiler do its thing ✨

## Why?

[As the React Compiler docs state](https://react.dev/learn/react-compiler/introduction):

> React Compiler adds automatic memoization more precisely and granularly than is possible with [`useMemo`](https://react.dev/reference/react/useMemo), [`useCallback`](https://react.dev/reference/react/useCallback), and [`React.memo`](https://react.dev/reference/react/memo). If you choose to keep manual memoization, React Compiler will analyze them and determine if your manual memoization matches its automatically inferred memoization. If there isn’t a match, the compiler will choose to bail out of optimizing that component.

When using React Compiler, manual memoization is no longer necessary in most cases. When the compiler sees manual memoization that does *not* match the memoization it generated, it will bail out to prevent breaking your components. __This leaves potential performance on the table *and* makes your components harder to read!__

This plugin helps you identify, and catch yourself writing, and remove these manual memoization patterns, since they are now largely redundant. In cases where manual memoization can improve on what the compiler is able to output, you're always free to disable the relevant rules!


## Installation

```bash
npm install --save-dev eslint-plugin-react-no-manual-memo
# or
yarn add --dev eslint-plugin-react-no-manual-memo
# or
pnpm add --save-dev eslint-plugin-react-no-manual-memo
```


## Rules

<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
⚠️ Configurations set to warn in.\
🌐 Set in the `all` configuration.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                                                                           | Description                                                                         | 💼   | ⚠️ | 🔧 |
| :----------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :--- | :- | :- |
| [no-component-memo](https://github.com/BellCubeDev/eslint-plugin-react-no-manual-memo/blob/main/docs/no-component-memo.md)     | Disallow React.memo() in favor of React Compiler automatic memoization              | 🌐 ✅ |    | 🔧 |
| [no-custom-memo-hook](https://github.com/BellCubeDev/eslint-plugin-react-no-manual-memo/blob/main/docs/no-custom-memo-hook.md) | Disallow custom hooks that only use useCallback and useMemo                         | 🌐   | ✅  |    |
| [no-hook-memo](https://github.com/BellCubeDev/eslint-plugin-react-no-manual-memo/blob/main/docs/no-hook-memo.md)               | Disallow manual memoization hooks (useMemo, useCallback) in favor of React Compiler | 🌐   | ✅  | 🔧 |

<!-- end auto-generated rules list -->


## Usage

### Flat Config (ESLint 9+)

Use the recommended config inside `defineConfig()`:

```js
import { defineConfig } from "eslint/config";
import reactNoManualMemo from 'eslint-plugin-react-no-manual-memo';

export default defineConfig([
	reactNoManualMemo.configs['flat/recommended'],
]);
```

> [!NOTE]
> ESLint will throw an error if you try to use the flat config without wrapping your config in `defineConfig()`.
>
> See the [docs section](https://eslint.org/docs/latest/use/configure/combine-configs#apply-a-config-array) about using third-party configs for more information.

<details>
<summary>Or configure it manually:</summary>

```js
import { defineConfig } from "eslint/config";
import reactNoManualMemo from 'eslint-plugin-react-no-manual-memo';

export default defineConfig([
	{
		plugins: {
			'react-no-manual-memo': reactNoManualMemo,
		},
		rules: {
			'react-no-manual-memo/no-hook-memo': 'error',
			// ...and any other rules you want to enable
		},
	},
]);
```

</details>

### Legacy Config (.eslintrc)

Use the recommended config:

```json
{
	"extends": ["plugin:react-no-manual-memo/recommended"]
}
```

<details>
<summary>Or configure it manually:</summary>

```json
{
	"plugins": ["react-no-manual-memo"],
	"rules": {
		"react-no-manual-memo/no-hook-memo": "error",
		// ...and any other rules you want to enable
	}
}
```

</details>

## License

MIT
