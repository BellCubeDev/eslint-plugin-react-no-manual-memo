import { RuleTester } from '@typescript-eslint/rule-tester'
import { rule } from '../rules/no-hook-memo/no-hook-memo.rule'
import { normalizeIndent } from './test-utils'

const ruleTester = new RuleTester({
	languageOptions: {
		parserOptions: { ecmaFeatures: { jsx: true } },
	},
})

ruleTester.run('no-hook-memo', rule, {
	valid: [
		{
			name: 'useMemo is not imported from React',
			code: normalizeIndent`
				import { useMemo } from 'other-library'

				function Component() {
					const value = useMemo(() => 1, [])
					return null
				}
			`,
		},
		{
			name: 'useCallback is not imported from React',
			code: normalizeIndent`
				import { useCallback } from 'other-library'

				function Component() {
					const callback = useCallback(() => {}, [])
					return null
				}
			`,
		},
		{
			name: 'regular function calls',
			code: normalizeIndent`
				import React from 'react'

				function Component() {
					const value = someOtherFunction(() => 1, [])
					return null
				}
			`,
		},
		{
			name: 'useMemo not related to React',
			code: normalizeIndent`
				const useMemo = (fn) => fn

				function CoolComponent() {
					const value = useMemo(() => 1)
					return <>{value}</>
				}
			`,
		},
		{
			name: 'useMemo outside of component',
			code: normalizeIndent`
				import { useMemo } from 'react'

				const value = useMemo(() => 1, [])
			`,
		},
		{
			name: 'useCallback outside of component',
			code: normalizeIndent`
				import { useCallback } from 'react'

				const callback = useCallback(() => {}, [])
			`,
		},
		{
			name: 'useMemo in non-component function',
			code: normalizeIndent`
				import { useMemo } from 'react'

				function utilityFunction() {
					const value = useMemo(() => 1, [])
					return value
				}
			`,
		},
		{
			name: 'useCallback once in memo-only custom hook should not be flagged (handled by no-custom-memo-hook)',
			code: normalizeIndent`
				import React, { useCallback } from 'react'

				function useCallbacks() {
					const callback = useCallback(() => {
						console.log('callback')
					}, [])

					return { callback }
				}
			`,
		},
		{
			name: 'useCallback twice in memo-only custom hook should not be flagged (handled by no-custom-memo-hook)',
			code: normalizeIndent`
				import React, { useCallback } from 'react'

				function useCallbacks() {
					const callback1 = useCallback(() => {
						console.log('callback1')
					}, [])

					const callback2 = useCallback(() => {
						console.log('callback2!!!')
					}, [])

					return { callback1, callback2 }
				}
			`,
		},
		{
			name: 'useMemo in memo-only custom hook should not be flagged (handled by no-custom-memo-hook)',
			code: normalizeIndent`
				import React, { useMemo } from 'react'

				function useMemoValues() {
					const value = useMemo(() => {
						return { expensive: 'calculation' }
					}, [])

					return { value }
				}
			`,
		},
		{
			name: 'useMemo twice in memo-only custom hook should not be flagged (handled by no-custom-memo-hook)',
			code: normalizeIndent`
				import React, { useMemo } from 'react'

				function useMemoValues() {
					const value1 = useMemo(() => {
						return { expensive: 'calculation' }
					}, [])

					const value2 = useMemo(() => {
						return [1, 2, 3, 4, 5]
					}, [])

					return { value1, value2 }
				}
			`,
		},
		{
			name: 'Mixed memo hooks in memo-only custom hook should not be flagged (handled by no-custom-memo-hook)',
			code: normalizeIndent`
				import React, { useCallback, useMemo } from 'react'

				function useMixed() {
					const callback = useCallback(() => {
						console.log('callback')
					}, [])

					const value = useMemo(() => {
						return { computed: 'value' }
					}, [])

					return { callback, value }
				}
			`,
		},
	],
	invalid: [
		{
			name: 'useMemo with simple arrow function expression',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = useMemo(() => 1 + 2, [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = 1 + 2
					return null
				}
			`,
		},
		{
			name: 'useMemo with arrow function and return statement',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = useMemo(() => { return 1 + 2 }, [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = 1 + 2
					return null
				}
			`,
		},
		{
			name: 'useMemo with object expression',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = useMemo(() => ({ foo: 'bar' }), [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = { foo: 'bar' }
					return null
				}
			`,
		},
		{
			name: 'useMemo with function expression',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = useMemo(function() { return 1 + 2 }, [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useMemo } from 'react'

				function Component() {
					const value = 1 + 2
					return null
				}
			`,
		},
		{
			name: 'React.useMemo with simple arrow function',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import React from 'react'

				function Component() {
					const value = React.useMemo(() => 1 + 2, [])
					return null
				}
			`,
			output: normalizeIndent`
				import React from 'react'

				function Component() {
					const value = 1 + 2
					return null
				}
			`,
		},
		{
			name: 'useCallback with arrow function',
			errors: [{ messageId: 'noUseCallback' }],
			code: normalizeIndent`
				import { useCallback } from 'react'

				function Component() {
					const callback = useCallback(() => console.log('hello'), [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useCallback } from 'react'

				function Component() {
					const callback = () => console.log('hello')
					return null
				}
			`,
		},
		{
			name: 'useCallback with function expression',
			errors: [{ messageId: 'noUseCallback' }],
			code: normalizeIndent`
				import { useCallback } from 'react'

				function Component() {
					const callback = useCallback(function() { console.log('hello') }, [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useCallback } from 'react'

				function Component() {
					const callback = function() { console.log('hello') }
					return null
				}
			`,
		},
		{
			name: 'React.useCallback with arrow function',
			errors: [{ messageId: 'noUseCallback' }],
			code: normalizeIndent`
				import React from 'react'

				function Component() {
					const callback = React.useCallback((x) => x * 2, [])
					return null
				}
			`,
			output: normalizeIndent`
				import React from 'react'

				function Component() {
					const callback = (x) => x * 2
					return null
				}
			`,
		},
		{
			name: 'useMemo in custom hook that calls another custom hook',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo } from 'react'
				import { useStableRandomNumber } from './useStableRandomNumber'

				function useCustomHook() {
					const randomNumber = useStableRandomNumber()
					const value = useMemo(() => randomNumber + 2, [randomNumber])
					return value
				}
			`,
			output: normalizeIndent`
				import { useMemo } from 'react'
				import { useStableRandomNumber } from './useStableRandomNumber'

				function useCustomHook() {
					const randomNumber = useStableRandomNumber()
					const value = randomNumber + 2
					return value
				}
			`,
		},
		{
			name: 'useCallback in custom hook that calls another custom hook',
			errors: [{ messageId: 'noUseCallback' }],
			code: normalizeIndent`
				import { useCallback } from 'react'
				import { useStableRandomNumber } from './useStableRandomNumber'

				function useCustomHook() {
					const randomNumber = useStableRandomNumber()
					const callback = useCallback(() => console.log(randomNumber), [randomNumber])
					return callback
				}
			`,
			output: normalizeIndent`
				import { useCallback } from 'react'
				import { useStableRandomNumber } from './useStableRandomNumber'

				function useCustomHook() {
					const randomNumber = useStableRandomNumber()
					const callback = () => console.log(randomNumber)
					return callback
				}
			`,
		},
		{
			name: 'useMemo in a custom hook that calls useEffect',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo, useEffect } from 'react'

				function useCustomHook() {
					useEffect(() => {
						console.log('effect')
					}, [])

					const value = useMemo(() => 1 + 2, [])
					return value
				}
			`,
			output: normalizeIndent`
				import { useMemo, useEffect } from 'react'

				function useCustomHook() {
					useEffect(() => {
						console.log('effect')
					}, [])

					const value = 1 + 2
					return value
				}
			`,
		},
		{
			name: 'useCallback in a custom hook that calls useEffect',
			errors: [{ messageId: 'noUseCallback' }],
			code: normalizeIndent`
				import { useCallback, useEffect } from 'react'

				function useCustomHook() {
					useEffect(() => {
						console.log('effect')
					}, [])

					const callback = useCallback(() => console.log('callback'), [])
					return callback
				}
			`,
			output: normalizeIndent`
				import { useCallback, useEffect } from 'react'

				function useCustomHook() {
					useEffect(() => {
						console.log('effect')
					}, [])

					const callback = () => console.log('callback')
					return callback
				}
			`,
		},
		{
			name: 'useMemo with complex function',
			errors: [{ messageId: 'noUseMemo' }],
			code: normalizeIndent`
				import { useMemo } from 'react'

				const Component = () => {
					const value = useMemo(() => {
						const x = 1
						const y = 2
						return x + y
					}, [])
					return null
				}
			`,
			output: normalizeIndent`
				import { useMemo } from 'react'

				const Component = () => {
					const value = (() => {
						const x = 1
						const y = 2
						return x + y
					})()
					return null
				}
			`,
		},
		{
			name: 'Multiple hooks in same component',
			errors: [
				{ messageId: 'noUseMemo' },
				{ messageId: 'noUseCallback' }
			],
			code: normalizeIndent`
				import { useMemo, useCallback } from 'react'

				const Component = function Component() {
					const value = useMemo(() => 1 + 2, [])
					const callback = useCallback(() => console.log(value), [value])
					return null
				}
			`,
			output: normalizeIndent`
				import { useMemo, useCallback } from 'react'

				const Component = function Component() {
					const value = 1 + 2
					const callback = () => console.log(value)
					return null
				}
			`,
		},
		{
			name: 'Invalid useMemo call: no arguments',
			errors: [
				{ messageId: 'noUseMemo' }
			],
			code: normalizeIndent`
				import React from 'react'
				function Component() {
					const value = React.useMemo()
					return <>{value}</>
				}
			`,
			output: null,
		},
		{
			name: 'Invalid useCallback call: no arguments',
			errors: [
				{ messageId: 'noUseCallback' }
			],
			code: normalizeIndent`
				import React from 'react'
				function Component() {
					const callback = React.useCallback()
					return <button onClick={callback}>Click me</button>
				}
			`,
			output: null,
		},
		{
			name: 'useCallback: first argument is identifier',
			errors: [
				{ messageId: 'noUseCallback' }
			],
			code: normalizeIndent`
				import React from 'react'
				const coolFunction = () => { console.log('cool') }
				function Component() {
					const callback = React.useCallback(coolFunction, [])
					return <button onClick={callback}>Click me</button>
				}
			`,
			output: normalizeIndent`
				import React from 'react'
				const coolFunction = () => { console.log('cool') }
				function Component() {
					const callback = coolFunction
					return <button onClick={callback}>Click me</button>
				}
			`,
		},
		{
			name: 'useMemo: first argument is identifier',
			errors: [
				{ messageId: 'noUseMemo' }
			],
			code: normalizeIndent`
				import React from 'react'
				const computeValue = () => 42
				function Component() {
					const value = React.useMemo(computeValue, [])
					return <>{value}</>
				}
			`,
			output: normalizeIndent`
				import React from 'react'
				const computeValue = () => 42
				function Component() {
					const value = computeValue()
					return <>{value}</>
				}
			`,
		},
		{
			name: 'useMemo: no arguments',
			errors: [
				{ messageId: 'noUseMemo' }
			],
			code: normalizeIndent`
				import { useMemo } from 'react'
				function Component() {
					const value = useMemo()
					return <>{value}</>
				}
			`,
			output: null,
		},
		{
			name: 'useCallback: no arguments',
			errors: [
				{ messageId: 'noUseCallback' }
			],
			code: normalizeIndent`
				import { useCallback } from 'react'
				function Component() {
					const callback = useCallback()
					return <button onClick={callback}>Click me</button>
				}
			`,
			output: null,
		}
	],
})
