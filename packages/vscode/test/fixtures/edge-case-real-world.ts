// Test fixture for real-world code patterns
// Common patterns that might reveal bugs

// ISSUE: React-like component with multiple issues
const MyComponent = ({ name, age, unused }: Props) => {
  // ISSUE: Unused import, unsorted destructuring
  const { zebra, alpha, beta } = useContext(MyContext)

  // ISSUE: Assignment in useEffect dependency check
  let mounted = false
  if (mounted = true) {
    console.log('Component mounted')
  }

  return alpha + beta + zebra + name + age
}

// ISSUE: Builder pattern with inconsistent chaining
const query = db
  .select('*').from('users')
  .where('age', '>', 18)
  .orderBy('name').limit(10)

// ISSUE: Config object with nested unsorted keys (common pattern)
const webpackConfig = {
  output: {
    path: '/dist',
    filename: 'bundle.js',
  },
  entry: './src/index.ts',
  module: {
    rules: [],
  },
  devServer: {
    port: 3000,
  },
}

// ISSUE: API response mapping with unsorted keys
const transformResponse = (data: any) => ({
  userId: data.user_id,
  userName: data.user_name,
  email: data.email,
  createdAt: data.created_at,
  age: data.age,
})

// ISSUE: Enum-like object (unsorted)
const STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// ISSUE: Multiple const declarations with arrows (should be functions)
const fetchData = async (url: string) => {
  const response = await fetch(url)
  return response.json()
}

const processData = (data: any[]) => {
  return data.map(item => item.value)
}

const validateInput = (input: string) => {
  return input.length > 0
}

// ISSUE: Class with unsorted methods and properties
class UserService {
  private zebra: string = 'z'
  private alpha: string = 'a'
  private beta: string = 'b'

  zebraMethod() { return this.zebra }
  alphaMethod() { return this.alpha }
  betaMethod() { return this.beta }
}

// ISSUE: Type definition with unsorted properties
type User = {
  name: string
  id: number
  email: string
  age: number
}

// Helper types and values
type Props = { name: string; age: number; unused: boolean }
const MyContext = { _currentValue: { alpha: 1, beta: 2, zebra: 3 } }
function useContext(ctx: any) { return ctx._currentValue }
const db = {
  select: () => db,
  from: () => db,
  where: () => db,
  orderBy: () => db,
  limit: () => db,
}

console.log(MyComponent({ name: 'Test', age: 30, unused: true }), query, webpackConfig)
console.log(transformResponse({ user_id: 1, user_name: 'test', email: 'test@test.com', created_at: Date.now(), age: 25 }))
console.log(STATUS, fetchData, processData, validateInput, new UserService())
