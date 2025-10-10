// Test fixture for pickier/top-level-function rule
// Prefers function declarations over arrow functions at the top level

// ISSUE: Top-level const with arrow function (no export before it)
const myFunction = () => {
  return 'Hello'
}

// ISSUE: Top-level const with arrow function
const helperFunction = (x: number) => {
  return x * 2
}

// ISSUE: Top-level const with arrow function
const calculate = (a: number, b: number) => {
  return a + b
}

// OK: Function declaration
export function properFunction() {
  return 'World'
}

// OK: Function declaration with params
function goodHelper(x: number) {
  return x * 2
}

// OK: Arrow function inside function (not top-level)
function wrapper() {
  const inner = () => 'This is fine'
  return inner()
}

console.log(helperFunction(5))
console.log(goodHelper(10))
console.log(wrapper())
