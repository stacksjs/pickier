// Test fixture for boundary conditions and edge cases

// Empty structures (should not crash)
const emptyObj = {}
const emptyArr = []
const emptyFunc = () => {}

// Single element (sorting should work)
const singleObj = { a: 1 }
const singleArr = [1]

// ISSUE: Two elements unsorted
const twoObj = { z: 1, a: 2 }
const twoArr = [2, 1]

// Very long identifier names
const thisIsAVeryLongVariableNameThatMightCauseIssuesWithLineLength = 'value'
const anotherVeryLongVariableNameForTestingPurposes = 'another value'

// ISSUE: Object with numeric string keys (sorting behavior)
const numericKeys = {
  '10': 'ten',
  '2': 'two',
  '1': 'one',
  '20': 'twenty',
}

// ISSUE: Object with mixed key types
const mixedKeys = {
  '2': 'string two',
  'zebra': 'z',
  '1': 'string one',
  'alpha': 'a',
}

// Nested empty structures
const nestedEmpty = {
  a: {},
  b: [],
  c: () => {},
}

// ISSUE: Single character identifiers (unsorted)
const z = 1
const a = 2
const m = 3

// Minimal expressions
const x = 1
if (x) x
const y = x ? x : 0

// ISSUE: Import with single item
import { z as zed } from 'package'

// ISSUE: Export with single item
export const single = 1

// Trailing commas in various positions
const withTrailing = {
  a: 1,
  b: 2,
}

const arrTrailing = [
  1,
  2,
]

// ISSUE: Destructuring with rename (unsorted source)
const { zebra: renamedZ, alpha: renamedA } = { zebra: 1, alpha: 2 }

// Regex edge cases
const emptyRegex = /(?:)/
const dotRegex = /./
const anchorRegex = /^$/

// String edge cases
const emptyString = ''
const singleChar = 'a'
const whitespace = '   '
const newlines = '\n\n\n'

// Number edge cases
const zero = 0
const negative = -1
const float = 0.1
const scientific = 1e10

// ISSUE: Function with no parameters
const noParams = () => { return 42 }

// ISSUE: Function with single parameter
const oneParam = (x: number) => x * 2

console.log(emptyObj, emptyArr, emptyFunc(), singleObj, singleArr, twoObj, twoArr)
console.log(thisIsAVeryLongVariableNameThatMightCauseIssuesWithLineLength, anotherVeryLongVariableNameForTestingPurposes)
console.log(numericKeys, mixedKeys, nestedEmpty, z, a, m, x, y, zed, single)
console.log(withTrailing, arrTrailing, renamedZ, renamedA, emptyRegex, dotRegex, anchorRegex)
console.log(emptyString, singleChar, whitespace, newlines, zero, negative, float, scientific)
console.log(noParams(), oneParam(5))
