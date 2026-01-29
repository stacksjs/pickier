/**
 * Example 7: Auto-fixable vs Manual Fixes
 *
 * HOW TO TEST:
 * 1. CodeLens shows how many issues are auto-fixable
 * 2. Hover shows ✨ icon for auto-fixable issues
 * 3. Code actions show "Fix" option only for auto-fixable
 * 4. Click "Fix all" to fix only auto-fixable issues
 */

// ============================================
// AUTO-FIXABLE ISSUES (✨)
// ============================================

// Auto-fix 1: debugger removal
function autoFix1() {
}

// Auto-fix 2: prefer-const
function autoFix2() {
  let x = 10  // ✨ Can change to const
  return x
}

// Auto-fix 3: string concatenation → template literal
function autoFix3() {
  const name = 'World'
  const msg = 'Hello ' + name  // ✨ Can convert to template
  return msg
}

// Auto-fix 4: quote style
function autoFix4() {
  const text = "double quotes"  // ✨ Can change to single
  return text
}

// ============================================
// MANUAL FIXES REQUIRED (no auto-fix)
// ============================================

// Manual 1: unused variable
// Cannot auto-fix - need to decide: use it, remove it, or prefix with _
function manualFix1() {
  const unused = 'value'
  return 42
}

// Manual 2: unused parameters
// Cannot auto-fix - need developer decision
function manualFix2(param1: string, unusedParam: number) {
  return param1
}

// Manual 3: console.log (could auto-remove, but needs decision)
function manualFix3() {
  console.log('Is this debug or intentional?')
}

/**
 * ✅ EXPECTED RESULTS:
 * - CodeLens: "⚠️ Pickier: X errors, Y warnings (4 auto-fixable)"
 * - Hover on auto-fixable shows: "✨ Auto-fix available"
 * - Hover on manual shows help but no ✨ icon
 * - Code actions on auto-fixable show "Fix: [description]"
 * - Code actions on manual show "Disable" but not "Fix"
 * - "Fix all" fixes only the 4 auto-fixable issues
 */
