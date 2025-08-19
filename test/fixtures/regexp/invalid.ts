// Invalid regexp usage - should be flagged
const unusedCapture = /(foo)-(bar)/ // Capturing groups not used
const oneUsed = /(foo)-(bar)-\1/ // Only first group used, second unused
const multipleUnused = /(a)(b)(c)-\1/ // Groups 2 and 3 unused
const complexUnused = /start-(group1)-(group2)-end/ // Both groups unused
