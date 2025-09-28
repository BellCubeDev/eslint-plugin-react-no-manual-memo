import { RuleTester } from '@typescript-eslint/rule-tester'
import { describe } from 'vitest'

import { NoCustomMemoHookMessageIDs, rule } from '../rules/no-custom-memo-hook/no-custom-memo-hook.rule'
import { normalizeIndent } from './test-utils';

describe('no-custom-memo-hook', () => {
	const ruleTester = new RuleTester({
		languageOptions: {
			parser: require('@typescript-eslint/parser'),
			parserOptions: {
				ecmaFeatures: { jsx: true },
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
	})

	ruleTester.run('no-custom-memo-hook', rule, {
		valid: [
			{
				name: 'Custom hook that calls other hooks (useState)',
				code: normalizeIndent`
					import React, { useState, useCallback } from 'react'

					function useCounter() {
						const [count, setCount] = useState(0)
						const increment = useCallback(() => setCount(c => c + 1), [])
						return { count, increment }
					}
				`,
			},
			{
				name: 'Custom hook that calls other hooks (useEffect)',
				code: normalizeIndent`
					import React, { useEffect, useMemo } from 'react'

					function useWindowSize() {
						const [size, setSize] = useState({ width: 0, height: 0 })

						useEffect(() => {
							const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight })
							window.addEventListener('resize', handler)
							return () => window.removeEventListener('resize', handler)
						}, [])

						const memoizedSize = useMemo(() => size, [size])
						return memoizedSize
					}
				`,
			},
			{
				name: 'Custom hook with JSX (returns JSX)',
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					function useButton() {
						const handleClick = useCallback(() => {
							console.log('clicked')
						}, [])

						return <button onClick={handleClick}>Click me</button>
					}
				`,
			},
			{
				name: 'Custom hook with JSX in callback',
				code: normalizeIndent`
					import React, { useMemo } from 'react'

					function useRender() {
						const render = useMemo(() => {
							return () => <div>Hello World</div>
						}, [])

						return render
					}
				`,
			},
			{
				name: 'Regular function (not a hook)',
				code: normalizeIndent`
					import React, { useCallback, useMemo } from 'react'

					function createHelpers() {
						const helper1 = useCallback(() => {}, [])
						const helper2 = useMemo(() => ({}), [])
						return { helper1, helper2 }
					}
				`,
			},
			{
				name: 'Hook that only uses useCallback but also calls another hook',
				code: normalizeIndent`
					import React, { useCallback, useRef } from 'react'

					function useCallbacks() {
						const ref = useRef()
						const callback = useCallback(() => {
							console.log(ref.current)
						}, [])
						return callback
					}
				`,
			},
			{
				name: 'Hook that uses React.useState (not memo-only)',
				code: normalizeIndent`
					import React from 'react'

					function useToggle() {
						const [value, setValue] = React.useState(false)
						const toggle = React.useCallback(() => setValue(v => !v), [])
						return [value, toggle]
					}
				`,
			},
			{
				name: 'Arrow function hook that calls other hooks',
				code: normalizeIndent`
					import React, { useState, useCallback } from 'react'

					const useCounter = () => {
						const [count, setCount] = useState(0)
						const increment = useCallback(() => setCount(c => c + 1), [])
						return { count, increment }
					}
				`,
			},
			{
				name: 'Custom hook that calls no hooks (effectively just a regular function; covered by @eslint-react/eslint-plugin\'s @eslint-react/no-unnecessary-use-prefix)',
				code: normalizeIndent`
					function useMyAwesomeHook() {
						return {
							doSomething: () => console.log('something'),
							doSomethingElse: () => console.log('something else')
						}
					}
				`,
			},
			{
				name: '(coverage) Hook variable declared but not assigned',
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					let useSomething;
				`,
			},
			{
				name: '(coverage) Hook variable initialized to non-function',
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					const useSomething = 42;
				`,
			},

			{
				name: 'Function is not a custom hook',
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					function regularFunction() {
						const callback = useCallback(() => {
							console.log("We won't flag this because it's not a hook")
						}, [])
						return callback
					}
				`,
			},
			{
				name: 'Not in a function',
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					const callback = useCallback(() => {
						console.log("We won't flag this because it's not in a function")
					}, [])
				`,
			},
		],
		invalid: [
			{
				name: 'Custom hook with only useCallback',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookCallback,
						data: { hookName: 'useCallbacks' },
					},
				],
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					function useCallbacks() {
						const callback1 = useCallback(() => {
							console.log('callback1')
						}, [])

						const callback2 = useCallback(() => {
							console.log('callback2')
						}, [])

						return { callback1, callback2 }
					}
				`,
			},
			{
				name: 'Custom hook with only useMemo',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookMemo,
						data: { hookName: 'useMemoValues' },
					},
				],
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
				name: 'Custom hook with both useCallback and useMemo',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookBoth,
						data: { hookName: 'useMixed' },
					},
				],
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
			{
				name: 'Arrow function hook with only useCallback',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookCallback,
						data: { hookName: 'useArrowCallback' },
					},
				],
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					const useArrowCallback = () => {
						const callback = useCallback(() => {
							console.log('arrow callback')
						}, [])

						return callback
					}
				`,
			},
			{
				name: 'Function expression hook with only useMemo',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookMemo,
						data: { hookName: 'useExpressionMemo' },
					},
				],
				code: normalizeIndent`
					import React, { useMemo } from 'react'

					const useExpressionMemo = function() {
						const value = useMemo(() => {
							return { data: 'memoized' }
						}, [])

						return value
					}
				`,
			},
			{
				name: 'Hook using React.useCallback and React.useMemo',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookBoth,
						data: { hookName: 'useReactMemo' },
					},
				],
				code: normalizeIndent`
					import React from 'react'

					function useReactMemo() {
						const callback = React.useCallback(() => {
							console.log('React callback')
						}, [])

						const value = React.useMemo(() => {
							return { react: 'memo' }
						}, [])

						return { callback, value }
					}
				`,
			},
			{
				name: 'Hook with complex logic but only memo hooks',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookBoth,
						data: { hookName: 'useComplexMemo' },
					},
				],
				code: normalizeIndent`
					import React, { useCallback, useMemo } from 'react'

					function useComplexMemo(data) {
						const processedData = useMemo(() => {
							if (!data) return []
							return data.map(item => ({
								...item,
								processed: true,
								timestamp: Date.now()
							}))
						}, [data])

						const handleUpdate = useCallback((id, updates) => {
							console.log('Updating:', id, updates)
							// Complex logic here
							const existing = processedData.find(item => item.id === id)
							if (existing) {
								return { ...existing, ...updates }
							}
							return null
						}, [processedData])

						const handleDelete = useCallback((id) => {
							console.log('Deleting:', id)
							return processedData.filter(item => item.id !== id)
						}, [processedData])

						return {
							data: processedData,
							updateItem: handleUpdate,
							deleteItem: handleDelete
						}
					}
				`,
			},
			{
				name: 'Works with const + arrow function declaration',
				errors: [
					{
						messageId: NoCustomMemoHookMessageIDs.noMemoOnlyHookCallback,
						data: { hookName: 'useCallbacks' },
					},
				],
				code: normalizeIndent`
					import React, { useCallback } from 'react'

					const useCallbacks = () => {
						const callback1 = useCallback(() => {
							console.log('callback1')
						}, [])

						const callback2 = useCallback(() => {
							console.log('callback2')
						}, [])

						return { callback1, callback2 }
					}
				`,
			}
		],
	})
})
