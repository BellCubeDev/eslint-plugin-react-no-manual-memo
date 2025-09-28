# react-no-manual-memo/no-custom-memo-hook

Disallow custom hooks that only use useCallback and useMemo.

💼⚠️ This rule is enabled in the 🌐 `all` config. This rule _warns_ in the ✅ `recommended` config.

<!-- end auto-generated rule header -->

## Rule Details

This rule identifies custom hooks that only use React's memoization hooks (`useCallback` and `useMemo`) without calling any other hooks or containing JSX. Custom hooks whose only purpose is to memoize values or functions are largely irrelevant when using React Compiler, except in specific cases where profiling has been performed and shows a clear benefit to using such hooks.

A custom hook is considered "memo-only" if it:
- Has a name that starts with `use` followed by an uppercase letter (follows React hook naming conventions)
- Does not contain any JSX elements or fragments
- Only calls the hooks `useCallback` and/or `useMemo`
- Does not call any other React hooks (e.g. `useState`, `useEffect`, `useMyCustomHook`)

> [!TIP]
> You may also be interested in using the [`no-unnecessary-use-prefix` rule](https://eslint-react.xyz/docs/rules/no-unnecessary-use-prefix) from `@eslint-react/eslint-plugin` to catch functions that don't call any hooks at all. Custom hooks that do not call any hooks and do not contain any JSX are also not optimized by React Compiler.

Suggested fix is to either:
- Inline the logic directly into the component that uses the hook, allowing React Compiler to optimize it; or
- Remove the memoization hooks (`useCallback`, `useMemo`) and remove the `use` prefix from the function name.

> [!IMPORTANT]
> Calls to functions beginning with `use` (e.g. `useFetch`, `useCustomHook`) are treated as hook calls when optimizing other hooks/components, even if React Compiler does not optimize the body of the custom hook itself. Renaming the function to not start with `use` will allow React Compiler to memoize calls to the function.
>
> *([view an example in React Compiler Playground](https://playground.react.dev/#N4Igzg9grgTgxgUxALhAHQHaYPTYAQC8RxJpZ5BO+eNeAqgMoCiAMkww3gBIDyPA0ngBqTAEoMAkjwByVQhQWLKWFQDMoGOABcAlhAx4oYBAEEAJmZ279ACgB0DgIYwA5mACUeYJhowEW2ANnNzs-MyhEGxswKABbABo8ADdHABtPAgA+PBjYvABqZLTEgAZ3AG5MAF9MTHVNawNzS0aAYQhYgAd9BAwtAHUrAAsuCAgAaxtPbwM8OH0wLRy4wkNjZqs9DBsARkSAJkSAZgqfPD8AmAMAHkskzIY45C9cquvsO8zKjBqVXHklICSHIaHQACoSFgSMEATTwADE6NJWhCZMIxJIZHIgTiiLUMPVtFs8I4LPYnK4PF48GdfP5AiTKaEEOFItE4okUulCNlcgUiqlSqcfvjCY08Bs2h1uhhegNhtAtKMJlMvGd5hhFss8gQSWS9nhDngTt86Zcbp9HrFnsBXu9Pt8qiB4iANaodC4UCAdF0IDAlloAJ6dBDUgAKqSgLh0GB4nUaYDwVTwqhgHTwAHIAEaOLMIVIAWk6kejGALfkc2gL8y6OlSCBgHx0iwz30wNhmNFwNc6dccjQAshAzAhnmgQGlUuPqjl+833QhExGozG4wmKs7wEMIAB3CR9BsYNJgFCqY8IKpAA))*

## Examples

### ❌ Incorrect

```jsx
import { useCallback } from 'react'

// Only uses useCallback
function useCallbacks() {
  const handleClick = useCallback(() => {
	console.log('clicked')
  }, [])

  const handleSubmit = useCallback(() => {
	console.log('submitted')
  }, [])

  return { handleClick, handleSubmit }
}
```

```jsx
import * as React from 'react'

// Only uses useMemo
function useMemoValues() {
  const expensiveValue = React.useMemo(() => {
	return calculateSomething()
  }, [])

  return expensiveValue
}
```

```jsx
import React from 'react'

// Uses both useCallback and useMemo but no other hooks
function useMixed() {
  const callback = React.useCallback(() => {}, [])
  const value = React.useMemo(() => ({}), [])
  return { callback, value }
}
```

### ✅ Correct

```jsx
// Calls no hooks at all (see top of file for note about this example)
function useUtilities() {
  const format = (text) => text.toUpperCase()
  const process = (data) => data.map(x => x * 2)
  return { format, process }
}
```

```jsx
import { useState, useCallback } from 'react'

// Uses other hooks (useState) - React Compiler can optimize this
function useCounter() {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => setCount(c => c + 1), [])
  return { count, increment }
}
```

```jsx
import { useState, useMemo, useEffect } from 'react'

// Uses useEffect - React Compiler can optimize this
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
	const handler = () => setSize({
	  width: window.innerWidth,
	  height: window.innerHeight
	})
	window.addEventListener('resize', handler)
	return () => window.removeEventListener('resize', handler)
  }, [])

  const memoizedSize = useMemo(() => size, [size])
  return memoizedSize
}
```

```jsx
import { useCallback } from 'react'

// Contains JSX - different use case
function useButton() {
  const handleClick = useCallback(() => {
	console.log('clicked')
  }, [])

  return <button onClick={handleClick}>Click me</button>
}
```

<br />

> [!CAUTION]
> The following example is [a violation](https://react.dev/reference/rules/rules-of-hooks#only-call-hooks-from-react-functions) of the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks), since `createHelpers` is not a hook or component function. It is shown only for completeness—to demonstrate that this rule specifically does not flag usage of hooks outside of valid React hooks. Please use [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks)'s rule `react-hooks/rules-of-hooks` to enforce the Rules of Hooks.

```jsx
import { useCallback } from 'react'
function createHelpers() {
  const helper1 = useCallback(() => {}, [])
  const helper2 = useMemo(() => ({}), [])
  return { helper1, helper2 }
}
```

## Auto-fixing

This rule does not provide automatic fixes due to the conscious refactoring decisions required.

## Options

<!-- begin auto-generated rule options list -->

This rule has no configuration options.

<!-- end auto-generated rule options list -->

## When Not To Use It

You might want to disable this rule if:

1. **No React Compiler**: Working with code that doesn't use React Compiler
2. **Legacy Codebase**: Your codebase contains a number of memo-only hooks already, and refactoring is not a priority. Since memo-only hooks do not harm functionality, you may choose to leave them as-is.
3. **Abstractions + Fine-Tuned Optimization**: It is not feasible to inline your logic directly into your component (which would allow React Compiler to optimize it). Knowing that, you've profiled and determined that using a memo-only hook is significantly faster than simply writing a utility function without hook-based memoization.

## Version

This rule was introduced in eslint-plugin-react-no-manual-memo v1.0.0.

## Implementation

- Rule source: [`src/rules/no-custom-memo-hook/no-custom-memo-hook.rule.ts`](../src/rules/no-custom-memo-hook/no-custom-memo-hook.rule.ts)
- Test source: [`src/__tests__/no-custom-memo-hook.test.ts`](../src/__tests__/no-custom-memo-hook.test.ts)
