// Test fixture for string and template literal edge cases
// Linter should not be confused by code-like content in strings

// ISSUE: Double quotes should be single (format issue)
const str1 = "Hello World"
const str2 = "Another string"

// Strings containing code-like syntax (should not trigger rules)
const codeInString = "const x = () => { return 'test' }"
const importInString = 'import { something } from "package"'
const regexInString = "/(a+)+b/"

// Template literals with expressions
const name = "World"
const greeting = `Hello ${name}!` // Should convert outer quotes?
const multiline = `
  This is a
  multiline template
  with ${name}
`

// ISSUE: Nested quotes (complex scenario)
const nested1 = "He said 'hello' to me"
const nested2 = 'She replied "hi" back'
const nested3 = `They both said "it's fine"`

// ISSUE: Strings with escape sequences
const escaped1 = "Line 1\nLine 2\tTabbed"
const escaped2 = 'Path: C:\\Users\\test'
const escaped3 = "Unicode: \u0041\u0042\u0043"

// Template literals in object (ISSUE: unsorted keys)
const messages = {
  zebra: `Zebra message with ${name}`,
  alpha: `Alpha message with ${name}`,
  beta: "Plain string",
}

// ISSUE: Arrow function with template literal
const makeGreeting = (person: string) => `Hello ${person}!`

// Regex with string-like content
const urlRegex = /https?:\/\//
const quoteRegex = /["']/g

// ISSUE: Object with various string types (unsorted)
const strings = {
  template: `Template ${name}`,
  single: 'Single quotes',
  double: "Double quotes",
  escaped: 'It\'s escaped',
  backtick: `Plain backtick`,
}

console.log(str1, str2, greeting, multiline, messages, makeGreeting('test'), strings, urlRegex, quoteRegex)
console.log(codeInString, importInString, regexInString, nested1, nested2, nested3, escaped1, escaped2, escaped3)
