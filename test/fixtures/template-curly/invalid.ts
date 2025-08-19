// Invalid template literal usage - should be flagged
const name = "John"
const badMessage = "Hello ${name}!" // Should use backticks
const anotherBad = 'Value: ${value}' // Should use backticks
const multipleBad = "Name: ${name}, Age: ${age}" // Multiple expressions
const singleQuoteBad = 'Template ${expression} here' // Single quotes with template
