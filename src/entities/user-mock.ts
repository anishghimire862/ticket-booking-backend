export type MockUser = {
  id: number
  name: string
  role: 'ADMIN' | 'USER'
}

export const USERS: MockUser[] = [
  {
    id: 1,
    name: 'Admin User',
    role: 'ADMIN',
  },
  {
    id: 2,
    name: 'Anish',
    role: 'USER',
  },
  {
    id: 3,
    name: 'Dipak',
    role: 'USER',
  },
]
