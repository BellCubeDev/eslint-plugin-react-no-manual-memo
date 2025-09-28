import packageJson from '../package.json'


function stripEslintPluginPrefix<T extends string>(str: T): T extends `eslint-plugin-${infer R}` ? R : T {
	return (str.replace(/^eslint-plugin-/, '') as any) as T extends `eslint-plugin-${infer R}` ? R : T
}

export const namespace = stripEslintPluginPrefix(packageJson.name)
