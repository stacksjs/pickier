/**
 * Example 4: Problems Panel with Help Text
 *
 * HOW TO TEST:
 * 1. Open the Problems panel (View → Problems or Cmd+Shift+M)
 * 2. Look for Pickier issues in this file
 * 3. Click on any issue
 * 4. See the help text in the details section below
 * 5. Help text shows actionable advice on how to fix
 */

// Problem 1: debugger statement
// In Problems panel, click this issue
// Help text: "Remove debugger statements before committing code..."
function problem1() {
  debugger
  return 1
}

// Problem 2: unused variable
// Help text: "Either use this variable in your code, remove it, or prefix it with an underscore (_unused)..."
function problem2() {
  const unused = 'not used'
  const alsoUnused = 42
  return 0
}

// Problem 3: prefer-const
// Help text: "Change 'let neverChanged' to 'const neverChanged' since the variable is never reassigned..."
function problem3() {
  let neverChanged = 100
  return neverChanged
}

// Problem 4: console.log
// Help text: "Remove console statements before committing. Use a proper logging library..."
function problem4() {
  console.log('debug')
  console.warn('warning')
  console.error('error')
}

// Problem 5: template literal
// Help text: "Use template literals (backticks) instead of string concatenation..."
function problem5() {
  const x = 10
  const y = 20
  const msg = 'x is ' + x + ' and y is ' + y
  return msg
}

// Problem 6: template curly in string
// Help text: "Change the string quotes from ' or \" to backticks (`) to use template literal interpolation..."
function problem6() {
  const name = 'Bob'
  const message = 'Hello ${name}'
  return message
}

/**
 * ✅ EXPECTED RESULTS:
 * - Problems panel shows all issues
 * - Clicking each issue shows help text below
 * - Help text is detailed and actionable
 * - Can click "Show Fixes" from Problems panel
 * - Issues are grouped by severity (errors vs warnings)
 */
