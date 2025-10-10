// Test fixture for ts/no-top-level-await rule
// Top-level await should not be used (unless in ESM with proper config)

// ISSUE: Top-level await
const data = await fetch('https://api.example.com/data')

// ISSUE: Top-level await with Promise
const result = await Promise.resolve(42)

// ISSUE: Top-level await in expression
const config = {
  value: await loadConfig(),
}

// OK: await inside async function
async function fetchData() {
  const response = await fetch('https://api.example.com/data')
  return response
}

// OK: Regular function
export function getData() {
  return fetchData()
}

async function loadConfig() {
  return { key: 'value' }
}
