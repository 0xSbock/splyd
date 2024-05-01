import { next as A } from '@automerge/automerge'

// TODO: type for uuid?
type Id = string

type User = {
  id: Id
  name: string
  createdAt: Date
}

type TransactionParticipant = {
  userId: Id
  share: A.Float64
}

type Transaction = {
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
