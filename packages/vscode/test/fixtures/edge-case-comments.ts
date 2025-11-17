// Test fixture for comment handling edge cases
// Rules should work correctly even with comments in tricky positions

// ISSUE: Unsorted imports with comments between them
import { z } from 'zod' // This is zod
// Comment between imports
import { a } from 'another' // This is another
import /* inline comment */ { m } from 'middle'

// ISSUE: Object with comments and unsorted keys
const obj = {
  // Comment before zebra
  zebra: 1,
  /* Multi-line comment
     before alpha */
  alpha: 2,
  // Comment before beta
  beta: 3, // Inline comment
}

// ISSUE: Assignment in condition with comment
function test1() {
  let x = 0
  // This should be === not =
  if (x = 10) { // ISSUE: assignment
    return x
  }
}

// ISSUE: Top-level arrow function with comment
const myFunc = /* comment */ () => {
  return 'test'
}

// ISSUE: Unsorted exports with comments
export const /* comment */ zebra = 1
// Comment between exports
export const alpha = 2
export const /* inline */ beta = 3

// ISSUE: Comments in regex (should not confuse the linter)
const regex = /\/\/ this looks like a comment but it's in a regex/
const regex2 = /\/\* also looks like a comment \*\//

// ISSUE: Strings that look like code
const fakeCode = "const x = () => {}"
const fakeImport = 'import { z } from "package"'
const fakeComment = "// this is not a real comment"

console.log(test1(), myFunc(), regex, regex2, fakeCode, fakeImport, fakeComment)
