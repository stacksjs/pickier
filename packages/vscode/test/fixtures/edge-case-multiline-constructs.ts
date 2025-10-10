// Test fixture for multi-line constructs and complex formatting

// ISSUE: Multi-line arrow function (top-level)
const multilineArrow = (
  a: number,
  b: number,
  c: number,
) =>
  a + b + c

// ISSUE: Multi-line object with unsorted keys spanning many lines
const config = {
  zulu: {
    enabled: true,
    settings: {
      timeout: 1000,
      retries: 3,
    },
  },
  alpha: {
    enabled: false,
    settings: {
      timeout: 500,
      retries: 1,
    },
  },
  beta: 'simple value',
}

// ISSUE: Multi-line array with inconsistent formatting
const data = [
  1,
  2, 3,
  4,
  5, 6, 7,
  8,
]

// ISSUE: Chained calls across many lines with inconsistent newlines
const processed = items
  .filter(item => item.active)
  .map(item => ({
    ...item,
    processed: true,
  }))
  .sort((a, b) => a.name.localeCompare(b.name)).slice(0, 10)
  .reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})

// ISSUE: Multi-line conditional with assignment
function checkValue() {
  let result = null
  if (
    result = calculateSomething()
  ) {
    return result
  }
  return null
}

// ISSUE: Multi-line function call with unsorted object argument
const instance = createInstance({
  zebra: 'value',
  alpha: 'value',
  beta: {
    nested: true,
    value: 42,
    alpha: 'sorted?',
  },
})

// ISSUE: Multi-line class with unsorted heritage
class MyComponent
  extends
    BaseComponent
  implements
    Validator,
    Parser,
    Formatter {
  method() {
    return 'test'
  }
}

// ISSUE: Multi-line interface with unsorted extends
interface ComplexInterface
  extends
    Zoomable,
    Clickable,
    Draggable {
  prop: string
}

// Helper functions and interfaces
function calculateSomething() { return 42 }
function createInstance(opts: any) { return opts }
const items = [{ active: true, name: 'test', id: 1, processed: false }]
class BaseComponent {}
interface Validator { validate(): void }
interface Parser { parse(): void }
interface Formatter { format(): void }
interface Zoomable { zoom(): void }
interface Clickable { click(): void }
interface Draggable { drag(): void }

console.log(multilineArrow(1, 2, 3), config, data, processed, checkValue(), instance, new MyComponent())
