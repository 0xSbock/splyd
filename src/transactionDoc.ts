import { next as A } from '@automerge/automerge'

// TODO: type for uuid?
export type Id = string

export interface User {
  id: Id
  name: string
  createdAt: Date
}

export interface TransactionParticipant {
  userId: Id
  // FIXME: only same amount of value is allowed currently
  share?: A.Float64
}

export interface Payment {
  id: Id
  amount: A.Float64
  createdAt: Date
  currency: string
  title?: string
  date?: Date
  from: Id
  to: Id
}

export interface Expense {
  id: Id
  title: string
  amount: A.Float64
  currency: string
  createdAt: Date
  by: Id // user id
  for: Id[] // user ids
  date?: Date
}

export interface Settings {
  defaultCurrency: string
}

interface TransactionDoc {
  version: A.Uint
  name: string
  users: User[]
  expenses: Expense[]
  payments: Payment[]
  settings: Settings
}

export default TransactionDoc
