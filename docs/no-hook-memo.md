# react-no-manual-memo/no-hook-memo

Disallow manual memoization hooks (useMemo, useCallback) in favor of React Compiler.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💼 This rule is enabled in the following configs: 🌐 `all`, ✅ `recommended`.

<!-- end auto-generated rule header -->

> [!NOTE]
> Relevant React Docs: [`useMemo`](https://react.dev/reference/react/useMemo) and [`useCallback`](https://react.dev/reference/react/useCallback)
>
> Both pages include a note saying to rely on React Compiler instead of these hooks.

## Rule Details

With React Compiler, manual memoization using `useMemo` and `useCallback` hooks is typically unnecessary. The compiler automatically optimizes your code and can often provide better performance than manual memoization.

This rule flags usage of:

- `useMemo` hook (both direct import and `React.useMemo`)
- `useCallback` hook (both direct import and `React.useCallback`)

> [!IMPORTANT]
> As of the time of writing (October 2025), React Compiler does not optimize custom hooks unless it sees hook calls or JSX in the custom hook. As such, this rule will **NOT** flag usages inside custom hooks that only use `useMemo` or `useCallback` (see the [`no-custom-memo-hook`](./no-custom-memo-hook.md) rule if you'd like to flag these hooks).
>
> This may change in the future as React Compiler evolves.

## Examples

### ❌ Incorrect

```jsx
// Using useMemo (direct import)
import { useMemo } from "react";

function FilterComponent({ items, filter }) {
	const filteredItems = useMemo(() => {
		return items.filter((item) => item.category === filter);
	}, [items, filter]);

	return <ItemList items={filteredItems} />;
}
```

```jsx
// Using useCallback (direct import)
import { useCallback } from "react";

function ButtonComponent() {
	const handleClick = useCallback(() => {
		console.log("Button clicked");
	}, []);

	return <button onClick={handleClick}>Click me</button>;
}
```

```jsx
// Using React namespace for useMemo
import React from "react";
// also supports wildcard imports: import * as React from 'react';

function ExpensiveComponent({ items }) {
	const total = React.useMemo(() => {
		return items.reduce((sum, item) => sum + item.value, 0);
	}, [items]);

	return <div>Total: {total}</div>;
}
```

```jsx
// Using React namespace for useCallback
import React from "react";
// also supports wildcard imports: import * as React from 'react';

function EventComponent({ onAction }) {
	const handleEvent = React.useCallback(
		(data) => {
			onAction(data.id);
		},
		[onAction]
	);

	return <EventListener onEvent={handleEvent} />;
}
```

```jsx
// useMemo with an external function
import React from "react";

function sum(...addends) {
	return addends.reduce((sum, val) => sum + val, 0);
}

function AdditionComponent() {
	const total = React.useMemo(() => sum(1, 2, 3), []);
	return <div>Sum: {total}</div>;
}
```

```jsx
// useCallback with an external function
import React from "react";

function LoggerComponent() {
	function logMessage(message) {
		console.log(message);
	}

	const logHello = React.useCallback(() => logMessage("Hello, world!"), []);
	return <button onClick={logHello}>Log Message</button>;
}
```

### ✅ Correct

```jsx
import React from "react";

function FilterComponent({ items, filter }) {
	const filteredItems = items.filter((item) => item.category === filter);

	return <ItemList items={filteredItems} />;
}
```

[_view in React Compiler Playground_](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZyEBmMEGBA5DGRfQNwA6Adl5VJxWgicCAMTQAbPAhgBhWjk4JOeABTACaKRjAAaApQlSYBAL4BKAsC4ECcIWCqHpCACYBJLWAIBeDZ4B0BpLSKpoIdN4AfH7h-nCkUgDmuACePt6+QUZmHNzCBEx4sMIAPB7hADJoDjHa3sBZzu6eJgQA9JG5JiA6IHacBoko6Ni4hHgpWAiWBAAK4lCJaJwA8lh4gpxerdS0DABGpPsI4gC0WAtLnKdM5HindtgS0m0u1XhsXFxq1u1tj1gJAlNgBZCAuBDIAjsECkcTiGFcVpgYFgAwILzzRbLNYbew5HrgAAWEAA7m5lNJOHCwChKDSECYgA)

<br />

```jsx
import React from "react";

function ButtonComponent() {
	const handleClick = () => {
		console.log("Button clicked");
	};

	return <button onClick={handleClick}>Click me</button>;
}
```

[_view in React Compiler Playground_](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZyEBmMEGBA5DGRfQNwA6Adl5VJxWgicCAISh48QgMK0cnBJzwAKAJQFgXAgThCwhABalOAEwA2CKabRwA1gQC8BVQ4B86zVu26I5gHSmIAHMlejEJIW0rWwRjehUOYQIAXwSPJjxYYQAeACNxSWFpKJt7YEMTc0trGySXKtsCDAQsgHo88M4XBKSQABoQHU5KNECUdGxcQjwATywEdQIABVMoQLROAHksPEFOMGSCaloGHNIchFMAWiwVtc5LpnI8S51sNHMYFuM0PTYuLiUGkSLRaryw71IOyEAFkIMYEMgCOwQKRTKZkVwkgQwJCfsMEPtlqt1lsoXt4n1wPoIAB3ACSigQME4qLAKEorIQSSAA)

<br />

```jsx
import React from "react";

function ExpensiveComponent({ items }) {
	const total = items.reduce((sum, item) => sum + item.value, 0);

	return <div>Total: {total}</div>;
}
```

[_view in React Compiler Playground_](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZyEBmMEGBA5DGRfQNwA6Adl5VJxWgicCAUQAeWBJzBoAbggDCtHJyl4AFMAJo8CDGAIBfAJQFgXAgThCwhPBDykANgQC823foB0TACZREdXUwKAwAGg89U1cAPgIQugBqSIwvWWcoBAiABmMObmECJjxYYQAeXzkYgBUHZ2Qze0cnQzKAekrZGPzDEDCQa05KNABzFHRsXDsAT0kzAgAFJygRtE4AeSw8QWkjAmpaBgAjUiOEJwBaLGXVzgumcjwL62w0JwQYDrRbNi4uTQsBDabReWDepG2QgAshBfAgGuwQM4nIiuIZ4hDvsMEAYlis1ptIdI8n1wAALCAAdwAkpxdDBOM4wChKEyEIYgA)

<br />

```jsx
import React from "react";

function EventComponent({ onAction }) {
	const handleEvent = (data) => {
		onAction(data.id);
	};

	return <EventListener onEvent={handleEvent} />;
}
```

[_view in React Compiler Playground_](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZyEBmMEGBA5DGRfQNwA6Adl5VJxWgicCAUQBuCTngDCtHJ0l4AFMAJCAggKEEAvgEoCwLgQJwhYQgAtSnACYAbBOMUEAvASW3SeUgdcA+Q2MTNU5NPEFOT29SADo0Wz0OYV1k4KY8WGEAHmcpABk0C0kEGFC8vFdgaztHCp0CAHp-ZJ0QABoQM05KNABzFHRsXEI8AE8sBEMCAAV7KD60TgB5LAjzXQJqWgYAI1JdhHsAWix5xc5jpnI8Y7NsNEcYRtsivDYuLhVgxsb7rEe3kiAFkILYEMgCOwQKR7PZoVwGmAgWBeggwLNzktVutOGAkh1wJYIAB3ACSUlKnFhYBQlBpCB0QA)

<br />

> [!NOTE]
> The following example will not be flagged by this rule **because of how React Compiler detects hooks for optimization**. Another rule, [`no-custom-memo-hook`](./no-custom-memo-hook.md), was introduced to discourage the use of hooks whose only purpose is memoization. The documentation for that rule describes this case in more detail.

```jsx
import React from "react";

function useAddition(...args) {
	const memoizedValue = React.useMemo(() => {
		return args.reduce((sum, val) => sum + val, 0);
	}, [args]);

	return memoizedValue;
}

function AdditionComponent() {
	const sum = useAddition(1, 2, 3);
	return <div>Sum: {sum}</div>;
}
```

_view in React Compiler Playground [with useMemo](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZyEBmMEGBA5DGRfQNwA6Adl5VJxWgicCUMAgCCAE0lo8gzgAoAdCtIwA5mACUBYFwIE4QsIQwIMENAC8EkgGqkANlAQEAvMWZ4lohAFlzCAUFHTcAPl19AwImPFhhNU0lJkkoRGCwKAwAGgIANydQiMy6AGp8p1yABi0OYQIAX1yAbUSwAF1arijY+IIzC2tbB2cEOobuzl5+OSECKRlZzgBhWhxOBE48EMj6o04TAhL3ETEF2XkFAEZcgCZcgGYu+t6YYQAeGTywgGUs5F0JQa7wA9F8wuMQNkQPtKGh1Ch0NhcIQ8ABPLCuYAEAAKznUaE4AHksEswI0CNRaAwAEakGkIRwAWiw+MJTKY5DwTKM2DQjgQMDBaBMbEmCj09RBIN5WH5pCWfggkgQAPYICcjnVXAaRwVIrhCHJeKgBOJpPk2lYUPAAAsIAB3ACSW0FnCcYBQlA9CAaQA) and [an equivalent version without useMemo](https://playground.react.dev/#N4Igzg9grgTgxgUxALhASwLYAcIwC4AEASggIZyEBmMEGBA5DGRfQNwA6Adl5VJxWgicCpACaiAFADoZpGAHMwASgLAuBAkzyxhcxVKaioiCRLBQMAGgIA3UgBsVAXgB8Bc3QDUth9YAMShycAL5cPHwCQgQAguJoeIKcAMK0OJwInHgSKmrCBHBCYIQeBE4i4hIAjNYATNYAzIHqmgjaMMIAPKJoNi4AyhbIqh7BHQD03b1BwSCWIAWclGjyKOjYuIR4AJ5YCKoEAAr2UPJonADyWAmFBMEE1LQMAEakTwj2ALRYx6ecH0zkPAfArYND2BAwCZoIpsMKcCS5DRjMYgrBg0jXTgAWQgogQQ3YIAc9kJXDuYAx0KWCDAhx+Z0umOUrFm4AAFhAAO4ASUyEM4DjAKEogoQwSAA)_

## Auto-fixing

This rule provides automatic fixes for all `useCallback` calls and many `useMemo` calls:

### `useCallback` Auto-fix

**Before:**

**Inline function definition:**

Unwraps the function definition

```jsx
// Before
const handleClick = useCallback(
	(item) => {
		doSomething(item);
	},
	[dependency]
);

// After
const handleClick = (item) => {
	doSomething(item);
};
```

**Identifier:**

Unwraps to the identifier

```jsx
// Before
const handleClick = React.useCallback(performAction, []);

// After
const handleClick = performAction;
```

### `useMemo` Auto-fix

**Simple arrow function:**

Unwraps the expression

```jsx
// Before
const value = useMemo(() => computeValue(), [dep]);

// After
const value = computeValue();
```

**Arrow function whose body is a single return statement:**

Unwraps the underlying expression

```jsx
// Before
const value = useMemo(() => {
	return computeValue();
}, [dep]);

// After
const value = computeValue();
```

**Object expression:**

Unwraps the object literal

```jsx
// Before
const config = useMemo(() => ({ setting: value }), [value]);

// After
const config = { setting: value };
```

**Identifier:**
Unwraps to the identifier and calls it

```jsx
// Before
const result = useMemo(calculateSomething, []);

// After
const result = calculateSomething();
```

**Complex functions:**

Unwraps to an IIFE (Immediately Invoked Function Expression)

```jsx
// Before
const result = useMemo(() => {
	if (Math.random() > 0.5) {
		return stepOne();
	} else {
		return stepTwo();
	}
}, [stepOne, stepTwo]);

// After
const result = (() => {
	if (Math.random() > 0.5) {
		return stepOne();
	} else {
		return stepTwo();
	}
})();
```

## Options

<!-- begin auto-generated rule options list -->

This rule has no configuration options.

<!-- end auto-generated rule options list -->

## When Not To Use

You might want to disable this rule if:

1. **No React Compiler**: Working with code that doesn't use React Compiler
2. **Very specific optimization needs**: Rare cases where manual memoization provides better results than the compiler. BE SURE TO PROFILE THESE CASES, and prefer disabling the rule via linter suppression comments for those specific cases.
3. **A component the React Compiler can't optimize**: In case a component is found that the React Compiler cannot optimize (for whatever reason), it is alright to disable this rule and memoize manually. Preferably, do this via linter suppression comments for that specific case.

## Further Reading

- [React Compiler Overview](https://react.dev/learn/react-compiler)
- [React useMemo Documentation](https://react.dev/reference/react/useMemo)
- [React useCallback Documentation](https://react.dev/reference/react/useCallback)

## Version

This rule was introduced in eslint-plugin-react-no-manual-memo v1.0.0.

## Implementation

- Rule source: [`src/rules/no-hook-memo/no-hook-memo.rule.ts`](../../src/rules/no-hook-memo/no-hook-memo.rule.ts)
- Test source: [`src/__tests__/no-hook-memo.test.ts`](../../src/__tests__/no-hook-memo.test.ts)
