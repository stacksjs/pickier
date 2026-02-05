// Small TypeScript file for benchmarking (~50 lines)
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export class UserService {
  private users: Map<number, User> = new Map()

  constructor() {
    this.users = new Map()
  }

  addUser(user: User): void {
    if (!user.id || !user.name) {
      throw new Error('Invalid user data')
    }
    this.users.set(user.id, user)
  }

  getUser(id: number): User | undefined {
    return this.users.get(id)
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  updateUser(id: number, updates: Partial<User>): boolean {
    const user = this.users.get(id)
    if (!user) {
      return false
    }
    this.users.set(id, { ...user, ...updates })
    return true
  }

  deleteUser(id: number): boolean {
    return this.users.delete(id)
  }

  findByEmail(email: string): User | undefined {
    return this.getAllUsers().find(u => u.email === email)
  }

  getUsersByRole(role: User['role']): User[] {
    return this.getAllUsers().filter(u => u.role === role)
  }
}
