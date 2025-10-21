/**
 * Example 9: Clean File (No Issues)
 *
 * HOW TO TEST:
 * 1. Open this file
 * 2. See CodeLens showing: "✓ Pickier: No issues found"
 * 3. No squiggly underlines
 * 4. Problems panel shows no issues for this file
 * 5. This demonstrates what a "perfect" file looks like
 */

// ✅ Proper const usage (not let)
const PI = 3.14159

// ✅ All variables are used
function calculateArea(radius: number): number {
  const area = PI * radius * radius
  return area
}

// ✅ Using template literals (not concatenation)
function greet(name: string): string {
  return `Hello, ${name}!`
}

// ✅ No debugger statements
function debug(value: unknown): void {
  // Use proper logging instead of console.log
  if (process.env.NODE_ENV === 'development') {
    // Conditional logging is okay
  }
}

// ✅ No unused variables
function compute(x: number, y: number): number {
  const sum = x + y
  const product = x * y
  return sum + product  // Both variables are used
}

// ✅ Proper single quotes
const message = 'This uses single quotes consistently'

// ✅ All parameters are used
function fullName(first: string, last: string): string {
  return `${first} ${last}`
}

/**
 * ✅ EXPECTED RESULTS:
 * - CodeLens: "$(check) Pickier: No issues found"
 * - No squiggly underlines anywhere
 * - No items in Problems panel for this file
 * - Hover on any code shows no diagnostics
 * - This is the target state for all files!
 */

export {
  calculateArea,
  greet,
  debug,
  compute,
  message,
  fullName,
}
