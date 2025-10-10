// Test fixture for style/consistent-list-newline rule
// Arrays and object literals should have consistent newline placement

// ISSUE: Inconsistent array - some items on same line, some on new lines
const array1 = [
  1, 2,
  3,
  4, 5, 6,
]

// ISSUE: Inconsistent object properties
const obj1 = {
  name: 'John', age: 30,
  email: 'john@example.com',
  address: '123 Main St', city: 'NYC',
}

// ISSUE: Function arguments inconsistent
function test(
  a: number, b: number,
  c: number,
  d: number, e: number,
) {
  return a + b + c + d + e
}

// OK: All on one line
const array2 = [1, 2, 3, 4, 5]

// OK: All on separate lines
const array3 = [
  1,
  2,
  3,
  4,
  5,
]

// OK: All object properties on separate lines
const obj2 = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
}

// OK: All object properties on one line
const obj3 = { name: 'Jane', age: 25 }

console.log(array1, obj1, test(1, 2, 3, 4, 5), array2, array3, obj2, obj3)
