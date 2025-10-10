// Test fixture for style/consistent-chaining rule
// Method chains should have consistent newline placement

// ISSUE: Inconsistent chaining - some on same line, some on new lines
const result1 = [1, 2, 3]
  .map(x => x * 2).filter(x => x > 2)
  .reduce((a, b) => a + b)

// ISSUE: Mixing inline and multiline chains
const result2 = 'hello world'
  .split(' ').map(word => word.toUpperCase())
  .join('-')

// ISSUE: Inconsistent object chaining
const builder = new Builder()
  .setName('test').setAge(30)
  .setEmail('test@example.com')
  .build()

// OK: All on one line
const result3 = [1, 2, 3].map(x => x * 2).filter(x => x > 2)

// OK: All on separate lines
const result4 = [1, 2, 3]
  .map(x => x * 2)
  .filter(x => x > 2)
  .reduce((a, b) => a + b)

// Helper class for fixture
class Builder {
  setName(name: string) { return this }
  setAge(age: number) { return this }
  setEmail(email: string) { return this }
  build() { return {} }
}

console.log(result1, result2, builder, result3, result4)
