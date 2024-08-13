import { Doc } from '@automerge/automerge'
import TransactionDoc, { User } from './transactionDoc'

export const usernameTaken = (
  doc: Doc<TransactionDoc> | undefined,
  username: string
) => {
  const existingUsernames = doc?.users.map((u) => u.name) ?? []
  return existingUsernames.findIndex((u) => u === username) !== -1
}

export const generateUserMap = (doc: Doc<TransactionDoc> | undefined) =>
  doc?.users
    ?.map((u: User) => ({ [u.id]: u.name }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {}) ?? {}
