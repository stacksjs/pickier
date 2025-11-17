// Test fixture for ts/no-ts-export-equal rule
// Disallows CommonJS exports = syntax in TypeScript files

// ISSUE: Using exports = syntax (CommonJS in TypeScript file)
// This is old CommonJS syntax that should be avoided in TypeScript

class MyClass {
  constructor() {}
}

// ISSUE: exports = (CommonJS-style)
exports = MyClass

// OK: Use ES6 export default instead
// export default MyClass

// OK: Use named exports
// export { MyClass }
// export { MyClass as default }
