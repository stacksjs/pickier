/**
 * Example 5: Import-related Issues
 *
 * HOW TO TEST:
 * 1. See CodeLens showing import issues
 * 2. CodeLens should show "📦 Organize Imports" button
 * 3. Click it to organize imports
 * 4. Hover over import issues to see help text
 */

// Unordered imports (should be alphabetically sorted)
import { zebra } from './zoo'
import { apple } from './fruits'
import { car } from './vehicles'

// Duplicate imports (import-dedupe rule)
import { thing } from './module'
import { otherThing } from './module'  // Should be merged with above

// These imports trigger the "Organize Imports" CodeLens button

export function useImports() {
  return { zebra, apple, car, thing, otherThing }
}

/**
 * ✅ EXPECTED RESULTS:
 * - CodeLens shows "📦 Organize Imports" button
 * - Clicking it sorts and dedupes imports
 * - After organizing:
 *   import { apple } from './fruits'
 *   import { thing, otherThing } from './module'
 *   import { car } from './vehicles'
 *   import { zebra } from './zoo'
 */
