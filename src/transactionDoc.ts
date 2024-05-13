import { next as A } from '@automerge/automerge'

// TODO: type for uuid?
export type Id = string

export type User = {
  id: Id
  name: string
  createdAt: Date
}

export type TransactionParticipant = {
  userId: Id
  // FIXME: only same amount of value is allowed currently
  share?: A.Float64
}

export type Transaction = {
  amount: A.Float64
  createdAt: Date
  currency: string
  id: Id
  participants: TransactionParticipant[]
  paying: Id | undefined
  title: string
  date?: Date
  description?: string
}

export type Expense = {
  id: Id
  title: string
  amount: A.Float64
  currency?: string
  by: Id // user id
  for: Id[] // user ids
  date?: Date
}

type TransactionDoc = {
  version: A.Uint
  users: User[]
  expenses: Expense[]
  transactions: Transaction[]
}

export default TransactionDoc
