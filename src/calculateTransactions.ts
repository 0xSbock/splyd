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

/*
 * sum the transactions into a single value between two participants
 * e.g. preCompute(A --5-> B, B -10-> A) => B --5-> A
 */
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
  const res: PreComputedEdge[] = []
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

type computeInOutResult = {
  [id: Id]: {
    in: number
    out: number
  }
}
export function computeInOut(g: Graph): computeInOutResult {
  const res: computeInOutResult = {}
  g.forEachNode((node, _attr) => {
    res[node] = {
      in: g.inEdges
        // @ts-expect-error TODO: figure out if graph does not provide sufficient typing
        .map((_e: unknown, attr: unknown) => attr.amount)
        .reduce((a: number, b: number) => a + b, 0),
      out: g.outEdges
        // @ts-expect-error TODO: figure out if graph does not provide sufficient typing
        .map((_e: unknown, attr: unknown) => attr.amount)
        .reduce((a: number, b: number) => a + b, 0),
    }
  })
  return res
}

export type optimizationCandidate = {
  root: Id
  targets: {
    from: Id
    to: Id
  }
}

// TODO: Loads of optimization to be done here!
// e.g. stop the candidates loop as soon as it's determined to be a candidate
export function findCandidates(g: Graph): Array<optimizationCandidate> {
  const candidates: optimizationCandidate[] = []
  g.forEachNode((node, _attr) => {
    const neighbors = g.outNeighbors(node)
    for (const neighbor of neighbors) {
      for (const neighborsNeighbor of g.outNeighbors(neighbor)) {
        if (neighborsNeighbor === node) {
          continue
        }
        if (neighbors.includes(neighborsNeighbor)) {
          candidates.push({
            root: node,
            targets: {
              from: neighbor,
              to: neighborsNeighbor,
            },
          })
        }
      }
    }
  })
  return candidates
}

export function optimizeTransactions(
  g: Graph,
  candidates: optimizationCandidate[]
) {
  for (const { root, targets } of candidates) {
    const edgeToBeRemoved = g.edge(targets.from, targets.to)
    const amount: number = g.getEdgeAttribute(edgeToBeRemoved, 'amount')
    g.updateEdgeAttribute(
      g.edge(root, targets.from),
      'amount',
      (preAmount: number) => preAmount - amount
    )
    g.updateEdgeAttribute(
      g.edge(root, targets.to),
      'amount',
      (preAmount: number) => preAmount + amount
    )
    g.dropEdge(edgeToBeRemoved)
  }
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
  const inOutSum: { [key: string]: { in: number; out: number } } = {}
  users.forEach((u: User) => {
    graph.addNode(u.id, { ...u })
    inOutSum[u.id] = { in: 0, out: 0 }
  })
  preComputeEdges({ users, expenses, payments }).forEach(
    (p: PreComputedEdge) => {
      graph.addEdge(p.from, p.to, { amount: p.amount })
      inOutSum[p.from].out += p.amount
      inOutSum[p.to].in += p.amount
    }
  )
  graph.updateEachNodeAttributes((_, attr) => ({
    ...attr,
    ...inOutSum[attr.id],
  }))
}
