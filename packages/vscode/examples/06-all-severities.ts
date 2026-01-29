/**
 * Example 6: Different Severity Levels
 *
 * HOW TO TEST:
 * 1. See how errors (red) and warnings (yellow) are displayed
 * 2. CodeLens shows both: "X errors, Y warnings"
 * 3. Problems panel groups by severity
 * 4. Hover shows different icons for each severity
 */

// ============================================
// ERRORS (Red squiggly underlines)
// ============================================

// Error 1: debugger statement
function errorExample1() {
}

// Error 2: unused variable (configured as error)
function errorExample2() {
  const unused = 'value'  // ❌ ERROR
  return 42
}

// Error 3: prefer-const (configured as error)
function errorExample3() {
  let neverChanges = 100  // ❌ ERROR
  return neverChanges
}

// ============================================
// WARNINGS (Yellow squiggly underlines)
// ============================================

// Warning 1: console.log
function warningExample1() {
  console.log('debug message')  // ⚠️ WARNING
}

// Warning 2: quote style
function warningExample2() {
  const msg = "should use single quotes"  // ⚠️ WARNING
  return msg
}

// Warning 3: prefer-template
function warningExample3() {
  const greeting = 'Hello' + ' ' + 'World'  // ⚠️ WARNING
  return greeting
}

/**
 * ✅ EXPECTED RESULTS:
 * - CodeLens shows: "⚠️ Pickier: 3 errors, 3 warnings (X auto-fixable)"
 * - Errors have red underlines
 * - Warnings have yellow underlines
 * - Hover shows different icons: $(error) vs $(warning)
 * - Problems panel separates errors from warnings
 */
