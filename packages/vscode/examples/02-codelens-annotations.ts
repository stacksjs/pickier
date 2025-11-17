/**
 * Example 2: CodeLens Annotations
 *
 * HOW TO TEST:
 * 1. Look at the TOP of this file (line 1)
 * 2. You should see CodeLens showing:
 *    - "⚠️ Pickier: X errors, Y warnings (Z auto-fixable)"
 *    - "🔧 Fix all Z auto-fixable issues" button
 * 3. Click the "Fix all" button
 * 4. Watch all auto-fixable issues get fixed
 * 5. CodeLens should change to "✓ Pickier: No issues found"
 */

// This file has MULTIPLE issues to trigger CodeLens

// Issue 1: debugger (auto-fixable)
function test1() {
  debugger
}

// Issue 2: unused variable (not auto-fixable, but shows in count)
function test2() {
  const unused = 'not used'
  return 42
}

// Issue 3: prefer-const (auto-fixable)
function test3() {
  let x = 10
  return x
}

// Issue 4: console.log (shows warning in CodeLens)
function test4() {
  console.log('debug message')
}

// Issue 5: string concatenation (auto-fixable with prefer-template)
function test5() {
  const msg = 'Hello' + ' ' + 'World'
  return msg
}

/**
 * ✅ EXPECTED RESULTS:
 * - CodeLens at top shows: "⚠️ Pickier: 2 errors, 2 warnings (3 auto-fixable)"
 * - Clicking "Fix all" fixes debugger, prefer-const, and prefer-template
 * - After fix, CodeLens shows remaining issues (unused var + console)
 * - Final state: "⚠️ Pickier: 2 warnings"
 */
