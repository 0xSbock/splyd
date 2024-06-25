import Graph from 'graphology'
import { Expense, Id, Payment, User } from './transactionDoc'

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

interface GraphDataBase {
  users: User[]
  expenses: Expense[]
  payments: Payment[]
}

export function preComputeEdges({
  users,
  expenses,
  payments,
}: GraphDataBase): PreComputedEdge[] {
  const userIds = users.map((u: User) => u.id)

  const transactionGraph: TransactionGraph = userIds
    .map((outerId) => ({
      [outerId]: userIds
        .map((innerId) => ({ [innerId]: 0 }))
        .reduce((acc, cur) => ({ ...acc, ...cur }), {}),
    }))
    .reduce((acc, cur) => ({ ...acc, ...cur }), {})

  payments.forEach(({ from, to, amount }: Payment) => {
    if (from !== to) {
      transactionGraph[from][to] += Number(amount.value)
      transactionGraph[to][from] -= Number(amount.value)
    }
  })
  expenses.forEach((expense: Expense) => {
    const { by, amount } = expense
    const participantNumber = expense.for.length
    expense.for.forEach((f: Id) => {
      if (by !== f) {
        transactionGraph[by][f] += Number(amount.value) / participantNumber
        transactionGraph[f][by] -= Number(amount.value) / participantNumber
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

// TODO: Loads of optimization to be done here!
// e.g. stop the candidates loop as soon as it's determined to be a candidate
export function findCandidates(g: Graph): Array<Id> {
  const candidates = g.filterNodes((node, _attr) => {
    const neighbors = g.outNeighbors(node)
    for (const neighbor of neighbors) {
      for (const neighborsNeighbor of g.outNeighbors(neighbor)) {
        if (neighborsNeighbor === node) {
          continue
        }
        if (neighbors.includes(neighborsNeighbor)) {
          return true
        }
      }
      return false
    }
  })
  return candidates
}

export default function calcualteTransactions({
  users,
  expenses,
  payments,
}: GraphDataBase) {
  const graph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })
  users.forEach((u: User) => {
    graph.addNode(u.id, { ...u })
  })
  preComputeEdges({ users, expenses, payments }).forEach(
    (p: PreComputedEdge) => {
      graph.addEdge(p.from, p.to, { amount: p.amount })
    }
  )
}
