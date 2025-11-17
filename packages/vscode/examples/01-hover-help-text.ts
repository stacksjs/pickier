/**
 * Example 1: Rich Hover with Help Text
 *
 * HOW TO TEST:
 * 1. Hover over any squiggly underline
 * 2. See the rich tooltip with:
 *    - Rule ID with severity icon
 *    - Error message
 *    - Help text with fix suggestions
 *    - "Auto-fix available" indicator
 *    - Links to docs and disable options
 */

// Hover over 'debugger' - see help text about removing it
function example1() {
  debugger
  return 'test'
}

// Hover over 'unused' - see help about prefixing with underscore
function example2() {
  const unused = 'This variable is never used'
  return 42
}

// Hover over the string - see help about template literals
function example3() {
  const name = 'World'
  const message = 'Hello ' + name
  return message
}

// Hover over 'let' - see help about using const instead
function example4() {
  let neverReassigned = 100
  return neverReassigned * 2
}

// Hover over console - see help about removing console statements
function example5() {
  console.log("This shouldn't be in production")
  return true
}

// Hover over the string with ${} - see help about using backticks
function example6() {
  const value = 42
  const msg = "The value is ${value}"
  return msg
}

/**
 * ✅ EXPECTED RESULTS:
 * - Each hover shows detailed help text
 * - Help text explains how to fix the issue
 * - Auto-fixable issues show ✨ icon
 * - Links to documentation are present
 */
