// Test fixture for indentation issues
// Default: 2 spaces

function testIndent() {
 // ISSUE: Only 1 space indent (should be 2)
 const x = 1

   // ISSUE: 3 space indent (not multiple of 2)
   const y = 2

    // ISSUE: 4 space indent when 2 is expected
    if (x > 0) {
     // ISSUE: Inconsistent nesting
     return y
    }

	// ISSUE: Tab character when spaces expected
	const z = 3

  // OK: Correct 2-space indent
  return z
}
