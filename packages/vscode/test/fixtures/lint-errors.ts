// File with multiple lint errors for testing
debugger
console.log('test')

if (x = 1) {
  console.warn('assignment in condition')
}

let neverReassigned = 1
console.log(neverReassigned)
