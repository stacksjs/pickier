# style (built-in plugin)

Rules provided by the built-in `style` plugin. These enforce code style and formatting conventions across your codebase. Most rules include auto-fixers.

**50 rules total** (34 with auto-fix)

## Spacing Rules

| Rule | Auto-fix | Description |
|------|----------|-------------|
| [`keyword-spacing`](/rules/style-keyword-spacing) | Yes | Require space before and after keywords (`if`, `else`, `for`, `return`, etc.) |
| [`arrow-spacing`](/rules/style-arrow-spacing) | Yes | Require space before and after `=>` in arrow functions |
| [`space-infix-ops`](/rules/style-space-infix-ops) | Yes | Require spacing around infix operators (`&&`, `||`, `??`, `+=`, etc.) |
| [`object-curly-spacing`](/rules/style-object-curly-spacing) | Yes | Require spaces inside `{ }` in objects and destructuring |
| [`block-spacing`](/rules/style-block-spacing) | Yes | Require spaces inside single-line blocks `{ return x }` |
| [`space-before-blocks`](/rules/style-space-before-blocks) | Yes | Require space before opening brace of blocks |
| [`comma-spacing`](/rules/style-comma-spacing) | Yes | Require space after commas, disallow space before |
| [`semi-spacing`](/rules/style-semi-spacing) | Yes | Disallow space before `;`, require space after |
| [`rest-spread-spacing`](/rules/style-rest-spread-spacing) | Yes | Disallow space after spread/rest operator (`...`) |
| [`key-spacing`](/rules/style-key-spacing) | Yes | Require space after `:` in object properties |
| [`computed-property-spacing`](/rules/style-computed-property-spacing) | Yes | Disallow spaces inside computed property brackets `[expr]` |
| [`array-bracket-spacing`](/rules/style-array-bracket-spacing) | Yes | Disallow spaces inside array brackets `[ ]` |
| [`space-in-parens`](/rules/style-space-in-parens) | Yes | Disallow spaces inside parentheses `( )` |
| [`template-curly-spacing`](/rules/style-template-curly-spacing) | Yes | Disallow spaces inside template literal `${ }` |
| [`space-unary-ops`](/rules/style-space-unary-ops) | Yes | Space after `typeof`/`void`/`delete`, no space after `!`/`~` |
| [`switch-colon-spacing`](/rules/style-switch-colon-spacing) | Yes | Enforce spacing around `:` in `case`/`default` clauses |
| [`generator-star-spacing`](/rules/style-generator-star-spacing) | Yes | Enforce `function* foo()` (no space before `*`, space after) |
| [`yield-star-spacing`](/rules/style-yield-star-spacing) | Yes | Enforce `yield* expr` (no space before `*`, space after) |
| [`function-call-spacing`](/rules/style-function-call-spacing) | Yes | Disallow spaces between function name and `(` in calls |
| [`template-tag-spacing`](/rules/style-template-tag-spacing) | Yes | Disallow space between tag function and template literal |
| [`no-whitespace-before-property`](/rules/style-no-whitespace-before-property) | Yes | Disallow whitespace before `.` or `?.` in property access |
| [`spaced-comment`](/rules/style-spaced-comment) | Yes | Require space after `//` and `/*` in comments |

## Punctuation and Parens Rules

| Rule | Auto-fix | Description |
|------|----------|-------------|
| [`comma-dangle`](/rules/style-comma-dangle) | Yes | Require trailing commas in multiline constructs |
| [`arrow-parens`](/rules/style-arrow-parens) | Yes | Require parentheses around arrow function parameters |
| [`space-before-function-paren`](/rules/style-space-before-function-paren) | Yes | Control spacing before `(` in function declarations |
| [`quote-props`](/rules/style-quote-props) | Yes | Remove unnecessary quotes from object property keys |
| [`no-floating-decimal`](/rules/style-no-floating-decimal) | Yes | Disallow `.5` (use `0.5`) and `2.` (use `2.0`) |
| [`new-parens`](/rules/style-new-parens) | Yes | Require `new Foo()` not `new Foo` |
| [`no-extra-parens`](/rules/style-no-extra-parens) | Yes | Remove redundant parentheses in `return (x)` |
| [`wrap-iife`](/rules/style-wrap-iife) | Yes | Require parentheses around IIFEs |

## Line Break and Block Rules

| Rule | Auto-fix | Description |
|------|----------|-------------|
| [`comma-style`](/rules/style-comma-style) | Yes | Enforce comma-last style (not comma-first) |
| [`dot-location`](/rules/style-dot-location) | Yes | Dot on the property line in chained calls |
| [`operator-linebreak`](/rules/style-operator-linebreak) | Yes | Operators at the start of continued lines |
| [`multiline-ternary`](/rules/style-multiline-ternary) | No | Enforce consistent multiline ternary expressions |
| [`padded-blocks`](/rules/style-padded-blocks) | Yes | Disallow empty lines at the beginning/end of blocks |
| [`lines-between-class-members`](/rules/style-lines-between-class-members) | Yes | Require blank line between class members |
| [`brace-style`](/rules/style-brace-style) | No | Enforce consistent brace style for blocks |
| [`curly`](/rules/style-curly) | No | Enforce consistent use of curly braces |
| [`max-statements-per-line`](/rules/style-max-statements-per-line) | No | Limit statements per line |
| [`if-newline`](/rules/style-if-newline) | No | Enforce newline after `if` when without braces |
| [`consistent-chaining`](/rules/style-consistent-chaining) | No | Enforce consistent line breaks in method chains |
| [`consistent-list-newline`](/rules/style-consistent-list-newline) | No | Enforce consistent newlines in arrays, objects, imports/exports |
| [`indent-unindent`](/rules/style-indent-unindent) | No | Enforce consistent indentation in unindent-style tagged templates |

## Expression Rules

| Rule | Auto-fix | Description |
|------|----------|-------------|
| [`no-mixed-operators`](/rules/style-no-mixed-operators) | No | Disallow mixing `&&`/`||`/`??` without parentheses |
| [`indent-binary-ops`](/rules/style-indent-binary-ops) | Yes | Enforce consistent indentation of binary operator continuation lines |

## Whitespace Rules

| Rule | Auto-fix | Description |
|------|----------|-------------|
| [`no-multi-spaces`](/rules/style-no-multi-spaces) | No | Disallow multiple consecutive spaces |
| [`no-multiple-empty-lines`](/rules/style-no-multiple-empty-lines) | No | Disallow multiple consecutive blank lines |
| [`no-trailing-spaces`](/rules/style-no-trailing-spaces) | No | Disallow trailing whitespace at the end of lines |
| [`no-tabs`](/rules/style-no-tabs) | Yes | Disallow tab characters (when using spaces for indentation) |
| [`no-mixed-spaces-and-tabs`](/rules/style-no-mixed-spaces-and-tabs) | No | Disallow mixed spaces and tabs for indentation |

## Configuration

All style rules are configured via `pluginRules` using the `style/` prefix:

```ts
// pickier.config.ts
export default {
  pluginRules: {
    'style/keyword-spacing': 'warn',
    'style/arrow-spacing': 'error',
    'style/comma-dangle': 'off',
    // ...
  },
}
```

See the [Plugin System](/advanced/plugin-system) for more configuration examples.

## Best Practices

- Use style rules to complement formatting where structure matters (e.g., discourage dense one-liners)
- Start new rules at `warn` to gauge noise, then tighten to `error` where appropriate
- Most spacing rules are `off` by default — the format engine handles basic spacing; enable these for stricter enforcement
