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

export type Payment = {
  id: Id
  amount: A.Float64
  createdAt: Date
  currency: string
  title?: string
  date?: Date
  from: Id
  to: Id
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
  payments: Payment[]
}

export default TransactionDoc
