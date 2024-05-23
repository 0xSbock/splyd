import { expect, test } from 'vitest'
import { next as A } from '@automerge/automerge'

import calculateTransactions from './calculateTransactions'
import { Id } from './transactionDoc'

const TestUsers = [0, 1, 2].map((i) => ({
  id: `U${i}`,
  name: `U${i}`,
  createdAt: new Date(),
}))

const TestPayments = [
  {
    amount: new A.Float64(1000),
    from: TestUsers[0].id,
    to: TestUsers[1].id,
  },
  {
    amount: new A.Float64(2000),
    from: TestUsers[0].id,
    to: TestUsers[2].id,
  },
  {
    amount: new A.Float64(5000),
    from: TestUsers[1].id,
    to: TestUsers[2].id,
  },
].map((base, i) => ({
  ...base,
  id: `payment-${i}` as Id,
  currency: '€',
  createdAt: new Date(),
  date: new Date(),
}))

test('minimize between 3', () => {
  const res = calculateTransactions({
    expenses: [],
    users: TestUsers,
    payments: TestPayments,
  })
  console.log(res)
})
