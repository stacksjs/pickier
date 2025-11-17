// Test fixture for pickier/prefer-const
// Variables that are never reassigned should use const

function testPreferConst() {
  // ISSUE: let is never reassigned, should be const
  let neverReassigned = 10

  // ISSUE: Multiple declarators, none reassigned
  let x = 1, y = 2

  console.log(neverReassigned + x + y)

  // OK: Variable is reassigned
  let counter = 0
  counter++
  counter += 5

  // OK: Already using const
  const proper = 'correct'

  return counter + proper.length
}

// ISSUE: Top-level let never reassigned
let topLevel = 'should be const'

export function useTopLevel() {
  return topLevel
}
