// TS complex fixture with nested blocks, objects, arrays, blanks, tabs, quotes
function greet(name: string) {
  console.log('Hello, ' + name)
}

const user = { 'first': 'Ada', 'last': 'Lovelace' }

if (user) {
  for (let i = 0; i < 2; i++) {
    console.log('Loop', i)
  }
}

// keep these trailing blank lines
