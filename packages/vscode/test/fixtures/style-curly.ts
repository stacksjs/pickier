// Test fixture for style/curly rule
// Control flow statements should use braces

function testCurly() {
  const x = 10
  const y = 20

  // ISSUE: if without braces
  if (x > 5)
    console.log('Greater than 5')

  // ISSUE: else without braces
  if (x < 100)
    console.log('Less than 100')
  else
    console.log('Greater or equal to 100')

  // ISSUE: for loop without braces
  for (let i = 0; i < 10; i++)
    console.log(i)

  // ISSUE: while loop without braces
  while (x < y)
    break

  // OK: Proper braces
  if (x > 0) {
    console.log('Positive')
  }

  for (let j = 0; j < 5; j++) {
    console.log(j)
  }

  return x + y
}
