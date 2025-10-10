// Test fixture for style/max-statements-per-line rule
// Maximum one statement per line

function testStatementsPerLine() {
  // ISSUE: Multiple statements on same line
  const x = 1; const y = 2; const z = 3;

  // ISSUE: Multiple statements with semicolons
  let a = 10; a++; console.log(a);

  // ISSUE: Chained statements
  const result = calculate(); console.log(result); return result;

  // OK: One statement per line
  const proper = 'correct'
  console.log(proper)
  return proper
}

function calculate() {
  return 42
}
