import { expect, test } from 'vitest'
import { next as A } from '@automerge/automerge'

import { Id } from './transactionDoc'
import { preComputeEdges } from './calculateTransactions'

const TestUsers = [0, 1].map((i) => ({
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
    amount: new A.Float64(1000),
    from: TestUsers[1].id,
    to: TestUsers[0].id,
  },
  {
    amount: new A.Float64(1000),
    from: TestUsers[0].id,
    to: TestUsers[1].id,
  },
].map((base, i) => ({
  ...base,
  id: `payment-${i}` as Id,
  currency: '€',
  createdAt: new Date(),
}))

const TestExpenses = [
  {
    amount: new A.Float64(2000),
    by: TestUsers[1].id,
    for: TestUsers.map((u) => u.id),
  },
  {
    amount: new A.Float64(1000),
    by: TestUsers[1].id,
    for: [TestUsers[0].id],
  },
].map((base, i) => ({
  ...base,
  id: `expense-${i}`,
  title: `title-${i}`,
  currency: '€',
  createdAt: new Date(),
}))

test('preComputeEdges between 2', () => {
  const computed = preComputeEdges({
    expenses: TestExpenses,
    payments: TestPayments,
    users: TestUsers,
  })
  expect(computed[0].from).toBe(TestUsers[1].id)
  expect(computed[0].to).toBe(TestUsers[0].id)
  console.log(computed)
  expect(computed[0].amount).toBe(1000)
})
