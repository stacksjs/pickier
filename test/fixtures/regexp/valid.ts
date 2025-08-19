// Valid regexp usage - should NOT be flagged
const usedCapture = /(foo)-\1/  // Backreference uses the capture
const nonCapture = /(?:foo)-bar/ // Non-capturing group
const namedCapture = /(?<word>\w+)-\k<word>/ // Named capture with backreference
const simplePattern = /foo-bar/ // No capturing groups
