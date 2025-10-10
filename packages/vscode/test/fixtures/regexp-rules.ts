// Test fixture for regexp/no-super-linear-backtracking and regexp/no-unused-capturing-group

// ISSUE: Super-linear backtracking - catastrophic backtracking potential
const badRegex1 = /(a+)+b/
const badRegex2 = /(a*)*b/
const badRegex3 = /(a|a)*b/

// ISSUE: Nested quantifiers causing potential performance issues
const badRegex4 = /(\d+)*$/
const badRegex5 = /(x+)+(y+)+/

// ISSUE: Unused capturing groups
const regex1 = /(foo)bar/ // 'foo' is captured but never used
const regex2 = /(\d{4})-(\d{2})-(\d{2})/ // If you only need the match, not the groups

// ISSUE: Multiple unused capturing groups
const regex3 = /(hello) (world) (test)/

// OK: Non-capturing groups
const goodRegex1 = /(?:a+)b/
const goodRegex2 = /(?:foo)bar/

// OK: Using the captured groups
const text = '2024-01-15'
const match = text.match(/(\d{4})-(\d{2})-(\d{2})/)
if (match) {
  console.log(match[1], match[2], match[3]) // Using captured groups
}

console.log(badRegex1, badRegex2, badRegex3, badRegex4, badRegex5)
console.log(regex1, regex2, regex3)
console.log(goodRegex1, goodRegex2)
