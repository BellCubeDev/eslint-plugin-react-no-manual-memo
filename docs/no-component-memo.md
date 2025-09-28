# react-no-manual-memo/no-component-memo

Disallow React.memo() in favor of React Compiler automatic memoization.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`.

<!-- end auto-generated rule header -->

> [!NOTE]
> Relevant React Docs: [`React.memo` - Do I still need React.memo if I use React Compiler?](https://react.dev/reference/react/memo#react-compiler-memo)

## Rule Details

With React Compiler, wrapping components in `React.memo` is almost always unnecessary. The compiler automatically optimizes component re-renders and can provide better performance than manual memoization.

This rule flags usage of:
- `React.memo` (namespace usage & wildcard imports)
- `memo` (named imports)

**Exception:** The rule allows `React.memo` when wrapping components imported from external packages (npm modules), since React Compiler cannot optimize components from external libraries. It will err on the side of considering a package external if there is any uncertainty (e.g. in the case of `@components/user-profile`, this is probably an internal alias, but the rule will still consider it external to avoid false positives since there's no practical way to tell if it is internal or external). I do not anticipate this to be an issue since I can't imagine too many repos have *separate modules* for memorized versions of *internal components*.

> [!NOTE]
> The above exception only applies to full import statements. Dynamic imports are not supported at this time (e.g. `React.lazy(() => React.memo(await import('./MyComponent')))`). If you need to memoize a dynamically-imported internal component, you will need to disable this rule for that line.

## Examples

### ❌ Incorrect

```jsx
import React from 'react';

// React.memo default import usage (auto-fixable)
const MyComponent = React.memo(function MyComponent({ name, age }) {
	return <div>
		<h1>{name}</h1>
		<p>Age: {age}</p>
	</div>;
});
```

```jsx
import * as React from 'react';

// React.memo wildcard import usage (auto-fixable)
const MyComponent = React.memo(function ({ name, age }) {
  return (
	<div>
	  <h1>{name}</h1>
	  <p>Age: {age}</p>
	</div>
  );
});
```

```jsx
import { memo } from 'react';

// Direct memo import usage (auto-fixable)
const AnotherComponent = memo(({ items }) => {
	return <ul>
		{items.map(item => (
			<li key={item.id}>{item.name}</li>
		))}
	</ul>;
});
```

```jsx
import { memo } from 'react';

// Memo with component reference (auto-fixable)
const BaseComponent = ({ title }) => <h1>{title}</h1>;
const MemoizedComponent = memo(BaseComponent);
```

```jsx
import * as React from 'react';

// With comparison function (NOT auto-fixable)
const OptimizedComponent = React.memo(
	({ user }) => <div>{user.name}</div>,
	(prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

### ✅ Correct

```jsx
function MyComponent({ name, age }) {
	return <div>
		<h1>{name}</h1>
		<p>Age: {age}</p>
	</div>;
}
```
[*view in React Compiler Playground*](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAMygOzgFwJYSYAEAsgJ4DCEAtgA6EKY4AUwRmAhtQgDREcBzBEQC+ASiLAAOsSIwEOWMWYyiaogB4AJngBuAPlXq1GgBYBGfcE7cRGgPQXDs4xtr6AgkOSTBCO-buRib2OgZGYgDcMiIgPCBwhGh4AiggeHQQMDhEOGS0wmwACgA2UAJ4mADytPiEYKJEaDA0RADkAEYcHQglALS0ZRWYffIcuH2JdHglCDCheGA4bdGYMqxG9vZTtDMcdZgkEFoIPlIgHCUl5zFEYPuLyQgNpeWVNQdgUXHgphAA7gBJJhzTglMAoNCXMD+IA)

<br />

```jsx
const AnotherComponent = ({ items }) => {
	return <ul>
		{items.map(item => (
			<li key={item.id}>{item.name}</li>
		))}
	</ul>;
};
```
[*view in React Compiler Playground*](https://playground.react.dev/#N4Igzg9grgTgxgUxALhHCA7MAXABAQQwmwAsEYBhCAWwAdMEM8BeXACmFwEtsFqxcAXwCUuZgD5cwADoZcuGAmyw5bWfPkAeKABtx6jfOA8+YAHTUAhrTYnqYyWrmGNmnV1wBrBAE9mx3mozLgATQXEAvjMMS2oEQU0Aend9Z0NhYUEDLUTdVPlhAG5ZQUKQABo0TAAzLgBzFBAuOggYPGwfWgQpXAAFHSg6rgwAeVpsLkwBQVxqmBpcAHIAI0tlhB0AWloBoYxNxUs4bE30Oi4dckSQrhxF4oxZDgNExLPaC8sJzABZCBCEMhcNIQJYdDoQSVcGAvrdaggBP1BsMxt8sEUKuASBAAO4ASSY5BiOjAKGqYLA8SAA)

<br />

```jsx
const BaseComponent = ({ title }) => <h1>{title}</h1>;
```
[*view in React Compiler Playground*](https://playground.react.dev/#N4Igzg9grgTgxgUxALhHCA7MAXABAIQEMwEBhCAWwAdMEM8BeXACmF2wEtsAbBXAXwCUuBgD5cAHgAWARlHBOPBPwkB6WaIDcAHQwgANGkwAzDgHMUIDtQgw82AJ5U+bAArcoZjhgDyVTphgArjGMJS4AOQARoRRCNwAtFQeXhgJMAiEcNgJ6NQcvDCqACYcOBE6GLqsuri4qqp5VAWEARgAshDFCMi42iCE3Nz9uvy4YK1lpghB7p7efm1ggpoG4FIQAO4AkvQIMBiDYCjGR8pAA)

<br />

```jsx
import React, { memo } from 'react';
import Button from '@mui/material/Button';
import { TextField } from 'antd';

// ✅ Allowed: External components can be memoized (React Compiler can't optimize them)
const MemoizedExternalButton = memo(Button);
const MemoizedExternalTextField = React.memo(TextField);
```
*[view in React Compiler Playground](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZx4A0BwBGCGEBAvgQGYwQYEDkMZFHgG4AOgDtMOfAQBCUPHghj2nbjwACGKGgD0GUngQw0pADY65CpcPGTchWgBUEADzwAxNAlMATFiq5eUjE8HxsxcR0dYgFCAGEuLDRTIwIABVNSAE8Ac04oMT8AEQBRAFkAeQA5AGVHIgBBRwBJauRI6McACwQwBAJSfgIxCEJ6RjQALwQ-AwHTUwIAIyyCPB6COETkowBCcS2xMEIStyMxM0tFZQBeWXlr0TFD44JTwxgL02c3T28-O4-DxeXxPDoEQCg5AQGgsIAB3GbIN5nT5mTaJJQIEJgTbBZb9cYQKYzAgAChI5Hi2xSMFxYh4hAgWDwmGJax6GAAlAclK8ygwidMfO9zpcHkoCHdCaSrkpOU8XoR+RMhSLUd9XMD-pKYpSAHTSoF-XzykCUECHNhoHIodDYexrLJYfq0DJQHJoMQVZloXn+DiBHhLUhLbwAWiwpndnrD-EpYa22B2MB0PjQx3C4lJwHEBAIUUTSUyLKUZQgPgQSJEIDMpmr4lYYAM6atvXSUY9Xp9vNN5rAXXhzRCotMYBQbDMfWYQA) (also includes non-memoized versions for demonstration purposes)*

<br />

```jsx
const OptimizedComponent = ({ user }) => <div>{user.name}</div>;
```
[*view in React Compiler Playground*](https://playground.react.dev/#N4Igzg9grgTgxgUxALhHCA7MAXABAeQAdsBLAWxIC8EATAYQjMMwQzwF5cAKYXKMBDFwBfAJS52APlwAeGiQBuk4P0EA6DAEMyCYTID08pQG4AOhhAAaNJgBmJAOYoQ5ZjDzYAnoQS5eABQAbKAcSDCJSTDARXFsYRlwAcgAjTWSEQIBaQmDQjEyYBE04bEz0JhJAwUMSHESzDHMec1xcfX1ywkrNSIwAWQgaBGRcUxBNQMCx82FcMB7a+wRooJCwiJIo0WMrcAALCAB3AEk2QS1AsBRbCYFhIA)

<br />

## Auto-fixing

This rule provides automatic fixes for nearly all `React.memo` usage patterns.

> [!NOTE]
> When `React.memo` includes a custom comparison function, no auto-fix is provided since the comparison logic possibly different from React Compiler's, and thus needs manual review before removal or rule suppression.

## External Component Support

This rule automatically allows `React.memo` when wrapping components imported from external packages:

```jsx
// ✅ These are allowed - external components may need manual memoization
import Button from '@mui/material/Button';
import { Card } from 'antd';
import CustomComponent from 'some-npm-package';
import DesignButton from '@some-cool-company/design-system';

const MemoizedButton = React.memo(Button);
const MemoizedCard = memo(Card);
const MemoizedCustom = React.memo(CustomComponent);
const MemoizedDesign = React.memo(DesignButton);
```

```jsx
// ❌ These will be flagged - internal components should rely on React Compiler
import LocalButton from '~/components/Button';
import Header from '@/components/Header';
import UserProfile from './UserProfile';

const MemoizedLocal = React.memo(LocalButton); // ❌
const MemoizedHeader = memo(Header); // ❌
const MemoizedUserProfile = React.memo(UserProfile); // ❌
```

The rule intelligently detects external vs internal components by analyzing import paths:

**External (allowed):**
- npm packages: `lodash`, `classnames`, `react-router-dom`
- Scoped packages: `@mui/material`, `@chakra-ui/react`, `@company/ui-lib`
- Sub-packages: `react-bootstrap/Card`, `lodash/debounce`

**Internal (flagged):**
- Relative imports: `./Button`, `../components/Card`
- Absolute imports: `/src/components/Header`
- Common aliases:
	- `@/*` (e.g. `@/components/Button`)
	- Anything starting with `~` (e.g. `~components`, `~/components/Button`, `~components/Button`, etc.)
	- Anything starting with `#` (e.g. `#components`, `#/components/Button`, `#components/Button`, etc.)
	- Anything starting with `$` (e.g. `$components`, `$/components/Button`, `$components/Button`, etc.)


## Options

<!-- begin auto-generated rule options list -->

This rule has no configuration options.

<!-- end auto-generated rule options list -->

## When Not To Use

You might want to disable this rule if:

1. **No React Compiler**: Working with code that doesn't use React Compiler
2. **Very specific optimization needs**: Rare cases where manual memoization provides better results than the compiler. BE SURE TO PROFILE THESE CASES! Prefer disabling the rule via linter suppression comments for those specific cases.
3. **A component the React Compiler can't optimize**: In case a component is found that the React Compiler cannot optimize (for whatever reason), it is alright to disable this rule and memoize manually. Preferably, do this via linter suppression comments for that specific case.
4. **Dynamic imports**: If you need to memoize a dynamically-imported internal component (e.g. `React.lazy(() => React.memo(await import('./MyComponent')))`) you will need to disable this rule for that line.

## Further Reading

- [React Compiler Overview](https://react.dev/learn/react-compiler)
- [`React.memo` Documentation](https://react.dev/reference/react/memo)
- [`React.memo` Documentation - Do I still need React.memo if I use React Compiler?](https://react.dev/reference/react/memo#react-compiler-memo)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)

## Version

This rule was introduced in eslint-plugin-react-no-manual-memo v1.0.0.

## Implementation

- Rule source: [`src/rules/no-component-memo/no-component-memo.rule.ts`](../src/rules/no-component-memo/no-component-memo.rule.ts)
- Test source: [`src/__tests__/no-component-memo.test.ts`](../src/__tests__/no-component-memo.test.ts)
