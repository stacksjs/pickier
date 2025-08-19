// Valid template literal usage - should NOT be flagged
const name = "John"
const goodMessage = `Hello ${name}!` // Correct template literal
const escapedMessage = "This \\${is} escaped" // Properly escaped
const regularString = "Just a regular string" // No template syntax
const anotherTemplate = `Value: ${42 + 58}` // Expression in template
