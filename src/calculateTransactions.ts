import Graph from 'graphology'
import TransactionDoc, { Expense, Id, Payment, User } from './transactionDoc'

interface PreComputedEdge {
  from: Id
  to: Id
  amount: number
}

interface TransactionGraph {
  [key: Id]: {
    [key: Id]: number
  }
}

export function preComputeEdges(doc: TransactionDoc): PreComputedEdge[] {
  const userIds = doc?.users.map((u: User) => u.id)

  const transactionGraph: TransactionGraph = userIds
    .map((outerId) => ({
      [outerId]: userIds
        .map((innerId) => ({ [innerId]: 0 }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {})

  doc.payments.forEach(({ from, to, amount }: Payment) => {
    if (from !== to) {
      transactionGraph[from][to] += Number(amount)
      transactionGraph[to][from] -= Number(amount)
    }
  })
  doc.expenses.forEach((expense: Expense) => {
    const { by, amount } = expense
    const participantNumber = expense.for.length
    expense.for.forEach((f: Id) => {
      if (by !== f) {
        transactionGraph[by][f] += Number(amount) / participantNumber
        transactionGraph[f][by] -= Number(amount) / participantNumber
      }
    })
  })

  // generate all 2-combinations of user ids
  const userCombinations: Array<Array<Id>> = userIds.flatMap((v, i) =>
    userIds.slice(i + 1).map((w) => [v, w])
  )
  let res: PreComputedEdge[] = []
  userCombinations.forEach(([u1, u2]) => {
    if (transactionGraph[u1][u2] === 0) return
    if (transactionGraph[u1][u2] > 0) {
      res.push({
        from: u1,
        to: u2,
        amount: transactionGraph[u1][u2],
      })
    } else {
      res.push({
        from: u2,
        to: u1,
        amount: transactionGraph[u2][u1],
      })
    }
  })
  return res
}

export default function calcualteTransactions(doc: TransactionDoc | undefined) {
  if (!doc) return {}

  const graph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })
  doc?.users.forEach((u: User) => {
    graph.addNode(u.id, { ...u })
  })
  preComputeEdges(doc).forEach((p: PreComputedEdge) => {
    graph.addEdge(p.from, p.to, { amount: p.amount })
  })
}
