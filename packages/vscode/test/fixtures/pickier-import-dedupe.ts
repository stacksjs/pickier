// Test fixture for pickier/import-dedupe
// Detects duplicate named imports in same statement

// ISSUE: Duplicate 'a' in same import
import { a, b, a } from './helpers'

// ISSUE: Duplicate 'config' in same import
import { config, utils, config } from './config'

// ISSUE: Multiple duplicates
import { x, y, x, z, y } from './values'

// OK: No duplicates
import { unique, items, here } from './good'
