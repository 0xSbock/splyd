import { Doc } from '@automerge/automerge'
import TransactionDoc from './transactionDoc'

export const usernameTaken = (
  doc: Doc<TransactionDoc> | undefined,
  username: string
) => {
  const existingUsernames = doc?.users.map((u) => u.name) || []
  return existingUsernames.findIndex((u) => u === username) !== -1
}
