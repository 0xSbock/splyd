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
  share: A.Float64
}

export type Transaction = {
  id: Id
  name: string
  descripttion?: string
  amount: A.Float64
  participants: TransactionParticipant[]
  currency: string
}

type TransactionDoc = {
  version: A.Uint
  users: User[]
  transactions: Transaction[]
}

export default TransactionDoc
