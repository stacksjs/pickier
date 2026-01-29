/**
 * Example 8: Disable Comments
 *
 * HOW TO TEST:
 * 1. Use code actions to add disable comments
 * 2. See how different disable options work
 * 3. Test "Disable for this line" action
 * 4. Test "Disable for entire file" action
 */

// ============================================
// EXAMPLE: Disable for specific line
// ============================================

// To test:
// 1. Put cursor on 'debugger' below
// 2. Press Cmd+.
// 3. Select "Disable no-debugger for this line"
// 4. Comment will be added above

function test1() {
}

// After applying "Disable for this line", it becomes:
function test1Fixed() {
  // eslint-disable-next-line no-debugger
}

// ============================================
// EXAMPLE: Disable for entire file
// ============================================

// To test:
// 1. Put cursor on any console.log below
// 2. Press Cmd+.
// 3. Select "Disable no-console for entire file"
// 4. Comment will be added at TOP of file

function test2() {
  console.log('test 1')
}

function test3() {
  console.log('test 2')
}

// After applying "Disable for entire file", the TOP of this file gets:
/* eslint-disable no-console */

// ============================================
// EXAMPLE: Disable multiple rules
// ============================================

function test4() {
  const unused = 'value'  // Disable no-unused-vars
  console.log('debug')  // Disable no-console
}

// You can disable multiple rules:
// eslint-disable-next-line no-debugger, no-console
// Or use separate comments for each

/**
 * ✅ EXPECTED RESULTS:
 * - "Disable for this line" adds comment above the issue
 * - "Disable for entire file" adds comment at top
 * - After disabling, the diagnostic disappears
 * - CodeLens updates to show fewer issues
 * - Can re-enable by removing the comment
 */
