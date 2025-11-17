// Test fixture for pickier/sort-imports and pickier/sort-named-imports
// Imports should be sorted alphabetically

// ISSUE: Imports not sorted
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { a, b, c } from './helpers'

// ISSUE: Named imports not sorted
import { zebra, apple, banana } from './fruits'

// ISSUE: Mixed order
import type { User } from './types'
import { config } from './config'
import type { Settings } from './settings'

// OK: Properly sorted (for comparison)
// import { readFileSync } from 'node:fs'
// import { join } from 'node:path'
// import { a, b, c } from './helpers'
// import { z } from 'zod'
