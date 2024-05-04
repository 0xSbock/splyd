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

type TransactionDoc = {
  version: A.Uint
  users: User[]
  transactions: Transaction[]
}

export default TransactionDoc
