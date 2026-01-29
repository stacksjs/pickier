// Test fixture for noDebugger and noConsole rules
// Default: noDebugger = 'error', noConsole = 'warn'

function testFunction() {
  // ISSUE: debugger statement

  // ISSUE: console.log call
  console.log('Debug message')

  // ISSUE: console.warn call
  console.warn('Warning message')

  // ISSUE: console.error call
  console.error('Error message')

  const x = 1

  // ISSUE: debugger in conditional
  if (x > 0) {
  }

  // ISSUE: console.info
  console.info('Info message')

  // ISSUE: console.debug
  console.debug('Debug call')

  // ISSUE: console.trace
  console.trace('Trace call')

  return x
}
