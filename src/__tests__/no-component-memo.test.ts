import { RuleTester } from '@typescript-eslint/rule-tester';
import { rule } from '../rules/no-component-memo/no-component-memo.rule';
import { normalizeIndent } from './test-utils';

const ruleTester = new RuleTester({
	languageOptions: {
		parserOptions: { ecmaFeatures: { jsx: true } },
	},
});

ruleTester.run('no-component-memo', rule, {
	valid: [
		{
			name: 'memo is not imported from React',
			code: normalizeIndent`
				import { memo } from 'other-library'

				const Component = memo(function MyComponent() {
					return <div>Hello</div>
				})
			`,
		},
		{
			name: 'memo outside of React context',
			code: normalizeIndent`
				const memo = (fn) => fn

				const Component = memo(function MyComponent() {
					return <div>Hello</div>
				})
			`,
		},
		{
			name: 'regular function calls',
			code: normalizeIndent`
				import React from 'react'

				const Component = someOtherWrapper(function MyComponent() {
					return <div>Hello</div>
				})
			`,
		},
		{
			name: 'component without memo',
			code: normalizeIndent`
				import React from 'react'

				function Component() {
					return <div>Hello</div>
				}
			`,
		},
		{
			name: 'React.memo with external component (component is default import)',
			code: normalizeIndent`
				import React from 'react'
				import Button from '@mui/material/Button'

				const MemoizedButton = React.memo(Button)
			`,
		},
		{
			name: 'React.memo with external component (component is named import)',
			code: normalizeIndent`
				import React from 'react'
				import { Button } from 'antd'

				const MemoizedButton = React.memo(Button)
			`,
		},
		{
			name: 'memo with external component from scoped package',
			code: normalizeIndent`
				import { memo } from 'react'
				import { TextField } from '@material-ui/core'

				const MemoizedTextField = memo(TextField)
			`,
		},
		{
			name: 'React.memo with external component and comparison function',
			code: normalizeIndent`
				import React from 'react'
				import Card from 'react-bootstrap/Card'

				const MemoizedCard = React.memo(Card, (prevProps, nextProps) => {
					return prevProps.title === nextProps.title
				})
			`,
		},
	],
	invalid: [
		{
			name: 'React.memo with function component (default import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'

				const Component = React.memo(function MyComponent() {
					return <div>Hello</div>
				})
			`,
			output: normalizeIndent`
				import React from 'react'

				const Component = function MyComponent() {
					return <div>Hello</div>
				}
			`,
		},
		{
			name: 'React.memo with arrow function component (default import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'

				const Component = React.memo(() => {
					return <div>Hello</div>
				})
			`,
			output: normalizeIndent`
				import React from 'react'

				const Component = () => {
					return <div>Hello</div>
				}
			`,
		},
		{
			name: 'memo with function component (direct import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import { memo } from 'react'

				const Component = memo(function MyComponent(props) {
					return <div>{props.children}</div>
				})
			`,
			output: normalizeIndent`
				import { memo } from 'react'

				const Component = function MyComponent(props) {
					return <div>{props.children}</div>
				}
			`,
		},
		{
			name: 'memo with arrow function component (direct import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import { memo } from 'react'

				const Component = memo((props) => (
					<div>{props.children}</div>
				))
			`,
			output: normalizeIndent`
				import { memo } from 'react'

				const Component = (props) => (
					<div>{props.children}</div>
				)
			`,
		},
		{
			name: 'React.memo with comparison function (default import; not auto-fixable)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'

				const Component = React.memo(function MyComponent(props) {
					return <div>{props.name}</div>
				}, (prevProps, nextProps) => prevProps.name === nextProps.name)
			`,
			output: null,
		},
		{
			name: 'memo with comparison function (direct import; not auto-fixable)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import { memo } from 'react'

				const Component = memo((props) => {
					return <div>{props.value}</div>
				}, (prevProps, nextProps) => prevProps.value === nextProps.value)
			`,
			output: null,
		},
		{
			name: 'memo with component identifier',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import { memo } from 'react'

				function MyComponent(props) {
					return <div>{props.children}</div>
				}

				const MemoizedComponent = memo(MyComponent)
			`,
			output: normalizeIndent`
				import { memo } from 'react'

				function MyComponent(props) {
					return <div>{props.children}</div>
				}

				const MemoizedComponent = MyComponent
			`,
		},
		{
			name: 'Multiple memo usages',
			errors: [
				{ messageId: 'noMemo' },
				{ messageId: 'noMemo' }
			],
			code: normalizeIndent`
				import React, { memo } from 'react'

				const ComponentA = React.memo(() => <div>A</div>)
				const ComponentB = memo(() => <div>B</div>)
			`,
			output: normalizeIndent`
				import React, { memo } from 'react'

				const ComponentA = () => <div>A</div>
				const ComponentB = () => <div>B</div>
			`,
		},
		{
			name: 'React.memo  with component imported via tilde alias',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				import Button from '~/components/Button'

				const MemoizedButton = React.memo(Button)
			`,
			output: normalizeIndent`
				import React from 'react'
				import Button from '~/components/Button'

				const MemoizedButton = Button
			`,
		},
		{
			name: 'memo with component imported via @/* alias',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import { memo } from 'react'
				import Card from '@/components/Card'

				const MemoizedCard = memo(Card)
			`,
			output: normalizeIndent`
				import { memo } from 'react'
				import Card from '@/components/Card'

				const MemoizedCard = Card
			`,
		},
		{
			name: 'React.memo with component imported via relative path',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				import MyComponent from './MyComponent'

				const MemoizedComponent = React.memo(MyComponent)
			`,
			output: normalizeIndent`
				import React from 'react'
				import MyComponent from './MyComponent'

				const MemoizedComponent = MyComponent
			`,
		},
		{
			name: 'React.memo with component imported via absolute local path',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				import Header from '/src/components/Header'

				const MemoizedHeader = React.memo(Header)
			`,
			output: normalizeIndent`
				import React from 'react'
				import Header from '/src/components/Header'

				const MemoizedHeader = Header
			`,
		},
		{
			name: 'React.memo with function component (wildcard import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import * as React from 'react'

				const Component = React.memo(function MyComponent() {
					return <div>Hello</div>
				})
			`,
			output: normalizeIndent`
				import * as React from 'react'

				const Component = function MyComponent() {
					return <div>Hello</div>
				}
			`,
		},
		{
			name: 'React.memo with arrow function component (wildcard import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import * as React from 'react'

				const Component = React.memo(() => {
					return <div>Hello</div>
				})
			`,
			output: normalizeIndent`
				import * as React from 'react'

				const Component = () => {
					return <div>Hello</div>
				}
			`,
		},
		{
			name: 'React.memo with component reference (wildcard import)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import * as React from 'react'

				function MyComponent(props) {
					return <div>{props.children}</div>
				}

				const MemoizedComponent = React.memo(MyComponent)
			`,
			output: normalizeIndent`
				import * as React from 'react'

				function MyComponent(props) {
					return <div>{props.children}</div>
				}

				const MemoizedComponent = MyComponent
			`,
		},
		{
			name: 'React.memo with comparison function (wildcard import, no auto-fix)',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import * as React from 'react'

				const Component = React.memo(function MyComponent(props) {
					return <div>{props.name}</div>
				}, (prevProps, nextProps) => prevProps.name === nextProps.name)
			`,
			output: null,
		},
		{
			name: 'React.memo with component imported via hash alias',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				import Schema from '#db/schema'

				const MemoizedSchema = React.memo(Schema)
			`,
			output: normalizeIndent`
				import React from 'react'
				import Schema from '#db/schema'

				const MemoizedSchema = Schema
			`,
		},
		{
			name: 'React.memo with component imported via dollar alias',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				import Config from '$config/app'

				const MemoizedConfig = React.memo(Config)
			`,
			output: normalizeIndent`
				import React from 'react'
				import Config from '$config/app'

				const MemoizedConfig = Config
			`,
		},
		{
			name: 'Invalid React.memo call: no arguments',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				const Component = React.memo()
			`,
			output: null,
		},
		{
			name: 'Invalid React.memo call: non-function argument',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				const Component = React.memo(42)
			`,
			output: normalizeIndent`
				import React from 'react'
				const Component = 42
			`,
		},
		{
			name: 'React.memo called with anonymous function',
			errors: [{ messageId: 'noMemo' }],
			code: normalizeIndent`
				import React from 'react'
				const Component = React.memo(function (props) {
					return <div>{props.text}</div>
				})
			`,
			output: normalizeIndent`
				import React from 'react'
				const Component = function (props) {
					return <div>{props.text}</div>
				}
			`,
		}
	],
});

// TODO: Handle dynamically-imported internal vs external components (e.g. React.lazy(() => React.memo(await import('./MyComponent'))))
