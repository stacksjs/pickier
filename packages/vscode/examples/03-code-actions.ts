/**
 * Example 3: Enhanced Code Actions
 *
 * HOW TO TEST:
 * 1. Put your cursor on any squiggly underline
 * 2. Press Cmd+. (or Ctrl+. on Windows/Linux)
 * 3. See 4 different code action options:
 *    - Fix: [issue description]
 *    - Disable [rule] for this line
 *    - Disable [rule] for entire file
 *    - 📖 View documentation for [rule]
 * 4. Try each action type
 */

// Test 1: Try code actions on 'debugger'
// Expected actions:
// - Fix: Remove debugger statement
// - Disable no-debugger for this line
// - Disable no-debugger for entire file
// - View documentation
function test1() {
  debugger
}

// Test 2: Try code actions on 'let'
// Expected actions:
// - Fix: Use 'const' instead
// - Disable prefer-const for this line
// - Disable prefer-const for entire file
// - View documentation
function test2() {
  let neverChanged = 42
  return neverChanged
}

// Test 3: Try code actions on unused variable
// Expected actions:
// - (No auto-fix available for this one)
// - Disable pickier/no-unused-vars for this line
// - Disable pickier/no-unused-vars for entire file
// - View documentation
function test3() {
  const unused = 'value'
  return 100
}

// Test 4: Try "Disable for this line" action
// After selecting, it should add:
// // eslint-disable-next-line no-console
// console.log('test')
function test4() {
  console.log('This will trigger console warning')
}

// Test 5: String concatenation - try the fix action
// Should convert to template literal
function test5() {
  const name = 'Alice'
  const greeting = 'Hello, ' + name + '!'
  return greeting
}

/**
 * ✅ EXPECTED RESULTS:
 * - Each diagnostic shows 3-4 code actions
 * - "Disable for this line" adds comment above the line
 * - "Disable for entire file" adds comment at top
 * - "View documentation" opens browser with rule docs
 * - "Fix" applies the auto-fix
 */
