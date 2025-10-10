// Test fixture for trailing whitespace and blank lines
// Default: trimTrailingWhitespace = true, maxConsecutiveBlankLines = 1

// ISSUE: Line with trailing spaces below
const x = 1


// ISSUE: Multiple consecutive blank lines above (3 lines)

const y = 2

// ISSUE: Trailing whitespace at end of line above
function test() {
  return x + y
}


// ISSUE: Too many blank lines above (2 lines when max is 1)
const z = 3
