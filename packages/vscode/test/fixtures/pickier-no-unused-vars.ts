// Test fixture for pickier/no-unused-vars rule
// Detects variables, imports, and parameters that are declared but never used

// ISSUE: Unused import
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

// ISSUE: Unused variable
const unusedVar = 42

// ISSUE: Unused function
function unusedFunction() {
  return 'never called'
}

// ISSUE: Unused parameter
function greet(name: string, unusedParam: string) {
  return `Hello, ${name}!`
}

// ISSUE: Unused destructured variable
const { used, unused } = { used: 1, unused: 2 }

// ISSUE: Unused type import
import type { ReadStream } from 'node:fs'

// OK: Used variable
const usedVar = 100
console.log(usedVar)

// OK: Used import
const content = readFileSync('test.txt', 'utf-8')

// OK: Used in return
console.log(used)
console.log(content)

// OK: Used parameter
function add(a: number, b: number) {
  return a + b
}

console.log(add(1, 2))
console.log(greet('World', 'extra'))
