// @ts-check

import { getDocsUrl } from './src/utils/get-docs-url.js';

const START_OPTIONS_LIST = '<!-- begin auto-generated rule options list -->';
const END_OPTIONS_LIST = '<!-- end auto-generated rule options list -->';

/** @type {import('eslint-doc-generator').GenerateOptions} */
export default {
	pathRuleDoc: './docs/{name}.md',
	ignoreConfig: ['flat/all', 'flat/recommended'],
	ruleDocSectionInclude: [
		'Rule Details',
		'Examples',
		'❌ Incorrect',
		'✅ Correct',
		'When Not To Use',
		'Options',
		'Version',
		'Implementation',
	],
	ruleDocSectionOptions: true,
	ruleDocTitleFormat: 'prefix-name',
	ruleDocNotices: [
		'deprecated',
		'requiresTypeChecking',

		'description',

		'fixableAndHasSuggestions',

		'configs',
		'options',
	],
	urlRuleDoc(ruleName, _pathOfFileBeingEdited) {
		return getDocsUrl(ruleName)
	},
	postprocess(content, _pathOfFileBeingEdited) {
		const optionsListBeginIndex = content.indexOf(START_OPTIONS_LIST) + START_OPTIONS_LIST.length;
		const optionsListEndIndex = content.indexOf(END_OPTIONS_LIST);

		const optionsList = content.slice(optionsListBeginIndex, optionsListEndIndex).trim();

		if (optionsList.length !== 0) return content;

		return content.slice(0, optionsListBeginIndex) + '\n\n_None_\n\n' + content.slice(optionsListEndIndex);
	}
};
