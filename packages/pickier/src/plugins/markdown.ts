import type { PickierPlugin } from '../types'

// Heading rules
import { headingIncrementRule } from '../rules/markdown/heading-increment'
import { headingStyleRule } from '../rules/markdown/heading-style'
import { noMissingSpaceAtxRule } from '../rules/markdown/no-missing-space-atx'
import { noMultipleSpaceAtxRule } from '../rules/markdown/no-multiple-space-atx'
import { noMissingSpaceClosedAtxRule } from '../rules/markdown/no-missing-space-closed-atx'
import { noMultipleSpaceClosedAtxRule } from '../rules/markdown/no-multiple-space-closed-atx'
import { blanksAroundHeadingsRule } from '../rules/markdown/blanks-around-headings'
import { headingStartLeftRule } from '../rules/markdown/heading-start-left'
import { noDuplicateHeadingRule } from '../rules/markdown/no-duplicate-heading'
import { singleTitleRule } from '../rules/markdown/single-title'
import { noTrailingPunctuationRule } from '../rules/markdown/no-trailing-punctuation'

// List rules
import { ulStyleRule } from '../rules/markdown/ul-style'
import { listIndentRule } from '../rules/markdown/list-indent'
import { ulIndentRule } from '../rules/markdown/ul-indent'
import { olPrefixRule } from '../rules/markdown/ol-prefix'
import { listMarkerSpaceRule } from '../rules/markdown/list-marker-space'
import { blanksAroundListsRule } from '../rules/markdown/blanks-around-lists'

// Whitespace rules
import { noTrailingSpacesRule } from '../rules/markdown/no-trailing-spaces'
import { noHardTabsRule } from '../rules/markdown/no-hard-tabs'
import { noMultipleBlanksRule } from '../rules/markdown/no-multiple-blanks'
import { noMultipleSpaceBlockquoteRule } from '../rules/markdown/no-multiple-space-blockquote'
import { noBlanksBlockquoteRule } from '../rules/markdown/no-blanks-blockquote'
import { blanksAroundFencesRule } from '../rules/markdown/blanks-around-fences'
import { singleTrailingNewlineRule } from '../rules/markdown/single-trailing-newline'
import { blanksAroundTablesRule } from '../rules/markdown/blanks-around-tables'

// Link rules
import { noReversedLinksRule } from '../rules/markdown/no-reversed-links'
import { noBareUrlsRule } from '../rules/markdown/no-bare-urls'
import { noSpaceInLinksRule } from '../rules/markdown/no-space-in-links'
import { noEmptyLinksRule } from '../rules/markdown/no-empty-links'
import { linkFragmentsRule } from '../rules/markdown/link-fragments'
import { referenceLinksImagesRule } from '../rules/markdown/reference-links-images'
import { linkImageReferenceDefinitionsRule } from '../rules/markdown/link-image-reference-definitions'
import { linkImageStyleRule } from '../rules/markdown/link-image-style'
import { descriptiveLinkTextRule } from '../rules/markdown/descriptive-link-text'

// Code rules
import { lineLengthRule } from '../rules/markdown/line-length'
import { commandsShowOutputRule } from '../rules/markdown/commands-show-output'
import { fencedCodeLanguageRule } from '../rules/markdown/fenced-code-language'
import { codeBlockStyleRule } from '../rules/markdown/code-block-style'
import { codeFenceStyleRule } from '../rules/markdown/code-fence-style'

// Emphasis/Strong rules
import { noEmphasisAsHeadingRule } from '../rules/markdown/no-emphasis-as-heading'
import { noSpaceInEmphasisRule } from '../rules/markdown/no-space-in-emphasis'
import { noSpaceInCodeRule } from '../rules/markdown/no-space-in-code'
import { emphasisStyleRule } from '../rules/markdown/emphasis-style'
import { strongStyleRule } from '../rules/markdown/strong-style'

// HTML and other rules
import { noInlineHtmlRule } from '../rules/markdown/no-inline-html'
import { hrStyleRule } from '../rules/markdown/hr-style'
import { firstLineHeadingRule } from '../rules/markdown/first-line-heading'
import { requiredHeadingsRule } from '../rules/markdown/required-headings'
import { properNamesRule } from '../rules/markdown/proper-names'
import { noAltTextRule } from '../rules/markdown/no-alt-text'

// Table rules
import { tablePipeStyleRule } from '../rules/markdown/table-pipe-style'
import { tableColumnCountRule } from '../rules/markdown/table-column-count'
import { tableColumnStyleRule } from '../rules/markdown/table-column-style'

export const markdownPlugin: PickierPlugin = {
  name: 'markdown',
  rules: {
    // Heading rules (MD001, MD003, MD018-MD026)
    'heading-increment': headingIncrementRule,
    'heading-style': headingStyleRule,
    'no-missing-space-atx': noMissingSpaceAtxRule,
    'no-multiple-space-atx': noMultipleSpaceAtxRule,
    'no-missing-space-closed-atx': noMissingSpaceClosedAtxRule,
    'no-multiple-space-closed-atx': noMultipleSpaceClosedAtxRule,
    'blanks-around-headings': blanksAroundHeadingsRule,
    'heading-start-left': headingStartLeftRule,
    'no-duplicate-heading': noDuplicateHeadingRule,
    'single-title': singleTitleRule,
    'no-trailing-punctuation': noTrailingPunctuationRule,

    // List rules (MD004, MD005, MD007, MD029, MD030, MD032)
    'ul-style': ulStyleRule,
    'list-indent': listIndentRule,
    'ul-indent': ulIndentRule,
    'ol-prefix': olPrefixRule,
    'list-marker-space': listMarkerSpaceRule,
    'blanks-around-lists': blanksAroundListsRule,

    // Whitespace rules (MD009, MD010, MD012, MD022, MD027, MD028, MD031, MD047, MD058)
    'no-trailing-spaces': noTrailingSpacesRule,
    'no-hard-tabs': noHardTabsRule,
    'no-multiple-blanks': noMultipleBlanksRule,
    'no-multiple-space-blockquote': noMultipleSpaceBlockquoteRule,
    'no-blanks-blockquote': noBlanksBlockquoteRule,
    'blanks-around-fences': blanksAroundFencesRule,
    'single-trailing-newline': singleTrailingNewlineRule,
    'blanks-around-tables': blanksAroundTablesRule,

    // Link rules (MD011, MD034, MD039, MD042, MD051-MD054, MD059)
    'no-reversed-links': noReversedLinksRule,
    'no-bare-urls': noBareUrlsRule,
    'no-space-in-links': noSpaceInLinksRule,
    'no-empty-links': noEmptyLinksRule,
    'link-fragments': linkFragmentsRule,
    'reference-links-images': referenceLinksImagesRule,
    'link-image-reference-definitions': linkImageReferenceDefinitionsRule,
    'link-image-style': linkImageStyleRule,
    'descriptive-link-text': descriptiveLinkTextRule,

    // Code rules (MD013, MD014, MD040, MD046, MD048)
    'line-length': lineLengthRule,
    'commands-show-output': commandsShowOutputRule,
    'fenced-code-language': fencedCodeLanguageRule,
    'code-block-style': codeBlockStyleRule,
    'code-fence-style': codeFenceStyleRule,

    // Emphasis/Strong rules (MD036, MD037, MD038, MD049, MD050)
    'no-emphasis-as-heading': noEmphasisAsHeadingRule,
    'no-space-in-emphasis': noSpaceInEmphasisRule,
    'no-space-in-code': noSpaceInCodeRule,
    'emphasis-style': emphasisStyleRule,
    'strong-style': strongStyleRule,

    // HTML and other rules (MD033, MD035, MD041, MD043-MD045)
    'no-inline-html': noInlineHtmlRule,
    'hr-style': hrStyleRule,
    'first-line-heading': firstLineHeadingRule,
    'required-headings': requiredHeadingsRule,
    'proper-names': properNamesRule,
    'no-alt-text': noAltTextRule,

    // Table rules (MD055, MD056, MD060)
    'table-pipe-style': tablePipeStyleRule,
    'table-column-count': tableColumnCountRule,
    'table-column-style': tableColumnStyleRule,
  },
}
