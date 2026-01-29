/**
 * Example 10: Comprehensive Feature Test
 *
 * This file combines EVERYTHING to test all features at once:
 * - Rich hover with help text
 * - CodeLens with stats and actions
 * - Multiple code action types
 * - Problems panel integration
 * - Auto-fixable vs manual issues
 * - Different severity levels
 *
 * HOW TO TEST:
 * 1. Open this file
 * 2. See CodeLens at top with full stats
 * 3. Hover over each issue - see rich help text
 * 4. Try code actions (Cmd+.) on different issues
 * 5. Check Problems panel for all issues
 * 6. Click "Fix all" in CodeLens
 * 7. See how file transforms
 */

// ============================================
// SECTION 1: Built-in Rules
// ============================================

// Issue 1: debugger (ERROR, auto-fixable)
// Hover: See help about removing debugger
// Code action: Fix, Disable line, Disable file, View docs
function section1a() {
}

// Issue 2: console.log (WARNING, not auto-fixed by default)
// Hover: See help about using proper logging
function section1b() {
  console.log('debug message')
  console.warn('warning message')
}

// Issue 3: template curly in string (ERROR, auto-fixable)
// Hover: See help about using backticks
function section1c() {
  const value = 42
  const msg = "Value is ${value}"
  return msg
}

// ============================================
// SECTION 2: Pickier Plugin Rules
// ============================================

// Issue 4: no-unused-vars (ERROR, NOT auto-fixable)
// Hover: See help about using, removing, or prefixing with _
function section2a() {
  const unused1 = 'not used'
  const unused2 = 42
  return 0
}

// Issue 5: prefer-const (ERROR, auto-fixable)
// Hover: See help about using const
// Code action: Changes let to const
function section2b() {
  let neverReassigned = 100
  let alsoNeverChanged = 200
  return neverReassigned + alsoNeverChanged
}

// Issue 6: prefer-template (WARNING, auto-fixable)
// Hover: See help about template literals
// Code action: Converts to `Hello ${name}!`
function section2c() {
  const name = 'World'
  const greeting = 'Hello ' + name + '!'
  return greeting
}

// ============================================
// SECTION 3: Style Rules
// ============================================

// Issue 7: quote style (WARNING, auto-fixable)
// Hover: See help about using single quotes
function section3a() {
  const text1 = "should be single quotes"
  const text2 = "also double"
  return text1 + text2
}

// Issue 8: indentation (if misconfigured)
// This example assumes proper indentation, but test by adding spaces

// ============================================
// SECTION 4: Complex Scenarios
// ============================================

// Issue 9: Multiple issues in one function
function section4a() {
  const unused = 'value'  // ERROR: unused var
  let x = 10  // ERROR: prefer-const
  console.log(x)  // WARNING: console
  const msg = "Hello " + "World"  // WARNING: quotes + prefer-template
  return msg
}

// Issue 10: Nested issues
function section4b() {
  if (true) {
    const temp = 'unused'
    let y = 20
    return y
  }
}

/**
 * ✅ COMPREHENSIVE TEST RESULTS:
 *
 * 1. CodeLens at top shows:
 *    "⚠️ Pickier: ~15 errors, ~8 warnings (~12 auto-fixable)"
 *    "🔧 Fix all ~12 auto-fixable issues"
 *
 * 2. Hovering over each issue shows:
 *    - Rule ID with severity icon
 *    - Descriptive message
 *    - Detailed help text
 *    - Auto-fix indicator (✨) if fixable
 *    - Links to docs and disable options
 *
 * 3. Code actions (Cmd+.) show:
 *    - Fix option (for auto-fixable issues)
 *    - Disable for this line
 *    - Disable for entire file
 *    - View documentation
 *
 * 4. Problems panel shows:
 *    - All issues grouped by severity
 *    - Click each issue to see help text
 *    - Can trigger fixes from panel
 *
 * 5. After clicking "Fix all":
 *    - All debugger statements removed
 *    - All let → const conversions
 *    - All string concatenation → template literals
 *    - All double quotes → single quotes
 *    - Remaining: unused variables (manual fix needed)
 *
 * 6. Final state:
 *    - CodeLens: "⚠️ Pickier: ~3 errors, ~1 warning"
 *    - Only non-auto-fixable issues remain
 *    - Much cleaner code!
 */
