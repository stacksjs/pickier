// Test fixture for pickier/sort-objects and pickier/sort-keys
// Object properties should be sorted alphabetically

// ISSUE: Object keys not sorted
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
  id: 1,
}

// ISSUE: Nested object keys not sorted
const config = {
  zebra: 'value',
  apple: 'value',
  nested: {
    zoo: 1,
    bar: 2,
    alpha: 3,
  },
}

// ISSUE: Interface properties not sorted
interface Settings {
  verbose: boolean
  debug: boolean
  apiKey: string
  timeout: number
}

// OK: Properly sorted (for comparison)
const sorted = {
  age: 30,
  email: 'john@example.com',
  id: 1,
  name: 'John',
}
