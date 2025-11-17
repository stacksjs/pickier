// Test fixture for deeply nested and complex structures
// This should stress-test multiple rules at once

// ISSUE: Deeply nested objects with unsorted keys
const complexConfig = {
  zebra: {
    yaml: {
      value: 1,
      alpha: 2,
    },
    beta: 3,
  },
  alpha: {
    nested: {
      zoo: 1,
      bar: 2,
      apple: 3,
    },
  },
}

// ISSUE: Complex chained method calls with inconsistent formatting
const result = data
  .filter(x => x > 0).map(x => x * 2)
  .reduce((a, b) => a + b, 0)
  .toString().split('').reverse()
  .join('')

// ISSUE: Nested arrays with inconsistent newlines
const matrix = [
  [1, 2, 3],
  [4, 5,
    6],
  [7,
    8,
    9],
]

// ISSUE: Complex destructuring with unused vars
const {
  used: usedValue,
  unused: unusedValue,
  nested: {
    alsoUsed,
    alsoUnused,
  },
} = getData()

// ISSUE: Multiple issues - unsorted imports, unused, wrong quotes
import { z, a, m } from "unsorted-package"
import { unusedImport } from 'another-package'

// Complex function with multiple issues
const complexFunction = (
  paramZ: string,
  paramA: number,
  unusedParam: boolean,
) => {
  // ISSUE: Assignment in condition
  let x = 0
  if (x = 10) {
    console.log(x)
  }

  return paramZ + paramA
}

// Helper function
function getData() {
  return {
    used: 1,
    unused: 2,
    nested: { alsoUsed: 3, alsoUnused: 4 },
  }
}

const data = [1, -2, 3, -4, 5]
console.log(usedValue, alsoUsed, complexFunction('test', 1, true), complexConfig, result, matrix)
