// Test fixture for noCondAssign rule
// Detects assignment in conditional expressions

function testCondAssign() {
  let x = 0
  let y = 5

  // ISSUE: Assignment in if condition
  if (x = 10) {
    console.log(x)
  }

  // ISSUE: Assignment in while condition
  while (y = y - 1) {
    console.log(y)
  }

  // ISSUE: Assignment in for loop condition (middle part)
  for (let i = 0; i = 10; i++) {
    console.log(i)
  }

  // OK: Comparison operators
  if (x === 10) {
    console.log('Correct')
  }

  // OK: Assignment in for loop initializer (first part)
  for (let j = 0; j < 10; j++) {
    console.log(j)
  }

  return x
}
