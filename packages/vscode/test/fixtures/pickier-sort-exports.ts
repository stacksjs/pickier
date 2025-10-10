// Test fixture for pickier/sort-exports rule
// Exports should be sorted alphabetically

// ISSUE: Exports not sorted alphabetically
export const zebra = 'striped'
export const apple = 'fruit'
export const banana = 'yellow'

// ISSUE: Type exports not sorted
export type User = { name: string }
export type Admin = { role: string }
export type Config = { debug: boolean }

// ISSUE: Mixed exports and types not sorted
export function zulu() {}
export const alpha = 1
export type Beta = string
export function charlie() {}

// ISSUE: Export statements not sorted
export { z } from './z'
export { a } from './a'
export { m } from './m'

// OK: Properly sorted (for comparison)
// export const alpha = 1
// export const banana = 'yellow'
// export const zebra = 'striped'
