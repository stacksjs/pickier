// Test fixture for semicolon formatting
// Default: semi = false (no semicolons)

// ISSUE: Has semicolons when they should be removed
const x = 1;
const y = 2;

function test() {
  return x + y;
}

// ISSUE: Semicolons in object properties
const obj = {
  name: 'test',
  value: 42,
};

// ISSUE: Semicolons in class
class MyClass {
  prop = 1;

  method() {
    return this.prop;
  }
}

// ISSUE: Semicolons in export statements
export const foo = 'bar';
export function baz() {
  return 'qux';
}

// OK: No semicolons (target format)
const a = 1
const b = 2

function good() {
  return a + b
}

export const works = 'yes'

console.log(test(), obj, new MyClass(), good(), works)
