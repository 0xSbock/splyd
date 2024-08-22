import Graph from 'graphology'
import { Attributes } from 'graphology-types'
import { Id, User, Expense, Payment } from './transactionDoc'

export interface GraphDataBase {
  users: User[]
  expenses: Expense[]
  payments: Payment[]
}

export interface PreComputedEdge {
  from: Id
  to: Id
  amount: number
}

export type TransactionGraph = Record<Id, Record<Id, number>>

export interface OptimizationCandidate {
  root: Id
  targets: {
    from: Id
    to: Id
  }
}

export type computeInOutResult = Record<
  string,
  {
    in: number
    out: number
  }
>

// TODO: Loads of optimization to be done here!
// return either a candidate or null if no candidates were found
export function* findCandidate(g: Graph): Generator<OptimizationCandidate> {
  for (const node of g.nodes()) {
    const neighbors = g.outNeighbors(node)
    for (const neighbor of neighbors) {
      for (const neighborsNeighbor of g.outNeighbors(neighbor)) {
        if (neighborsNeighbor === node) {
          continue
        }
        if (neighbors.includes(neighborsNeighbor)) {
          yield {
            root: node,
            targets: {
              from: neighbor,
              to: neighborsNeighbor,
            },
          }
        }
      }
    }
  }
}

export const cleanUpGraph = (graph: Graph | null) => {
  // if graph is not given we don't need to clean it up
  if (!graph) return

  // remove edges with no value transfer
  const zeroAmount = graph.filterEdges((_edge, attrs) => attrs.amount === 0)
  zeroAmount.forEach((edge) => graph.dropEdge(edge))

  const noTransactions = graph.filterNodes((node) => graph.degree(node) === 0)
  noTransactions.forEach((node) => graph.dropNode(node))

  // flip negative edges
  // e.g. A -(-20€)-> B => B -(20€)-> A
  const negativeEdges = graph.filterEdges((_edge, attrs) => attrs.amount < 0)
  negativeEdges.forEach((edge) => {
    const oldAttrs = graph.getEdgeAttributes(edge)
    const newAmount = oldAttrs.amount * -1
    const sourceId = graph.getSourceAttribute(edge, 'id') as Id
    const targetId = graph.getTargetAttribute(edge, 'id') as Id
    graph.dropEdge(edge)
    // FIXME: currency should be an edge attribute
    graph.addEdge(targetId, sourceId, {
      ...oldAttrs,
      amount: newAmount,
      label: `${newAmount} €`,
    })
  })
}

export function optimizeTransaction(
  g: Graph,
  candidate: OptimizationCandidate
) {
  const { root, targets } = candidate
  const edgeToBeRemoved = g.edge(targets.from, targets.to)
  const amount = g.getEdgeAttribute(edgeToBeRemoved, 'amount') as number
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
      // FIXME: why are the Float64 automerge objects suddenly numbers?
      if (typeof amount === typeof {}) {
        transactionGraph[from][to] += Number(amount.value)
        transactionGraph[to][from] -= Number(amount.value)
      } else {
        transactionGraph[from][to] += Number(amount)
        transactionGraph[to][from] -= Number(amount)
      }
    }
  })
  expenses.forEach((expense: Expense) => {
    const { by, amount } = expense
    const participantNumber = expense.for.length
    expense.for.forEach((f: Id) => {
      if (by !== f) {
        // FIXME: why are the Float64 automerge objects suddenly numbers?
        if (typeof amount === typeof {}) {
          transactionGraph[by][f] += Number(amount.value) / participantNumber
          transactionGraph[f][by] -= Number(amount.value) / participantNumber
        } else {
          transactionGraph[by][f] += Number(amount) / participantNumber
          transactionGraph[f][by] -= Number(amount) / participantNumber
        }
      }
    })
  })
  // generate all 2-combinations of user ids
  const userCombinations: Id[][] = userIds.flatMap((v, i) =>
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

export function computeInOut(g: Graph): computeInOutResult {
  const res: computeInOutResult = {}
  g.forEachNode((node: string, _attr) => {
    res[node] = {
      in: g
        .mapInEdges(node, (_e, attr: Attributes) => attr.amount as number)
        .reduce((a: number, b: number) => a + b, 0),
      out: g
        .mapInEdges(node, (_e, attr: Attributes) => attr.amount as number)
        .reduce((a: number, b: number) => a + b, 0),
    }
  })
  return res
}

export function generateGraph({
  users,
  expenses,
  payments,
}: GraphDataBase): Graph {
  const graph = new Graph({
    multi: false,
    allowSelfLoops: false,
    type: 'directed',
  })
  const inOutSum: Record<string, { in: number; out: number }> = {}
  users.forEach((u: User) => {
    graph.addNode(u.id, { ...u })
    inOutSum[u.id] = { in: 0, out: 0 }
  })
  preComputeEdges({ users, expenses, payments }).forEach(
    (p: PreComputedEdge) => {
      graph.addEdge(p.to, p.from, { amount: p.amount })
      inOutSum[p.from].out += p.amount
      inOutSum[p.to].in += p.amount
    }
  )
  graph.updateEachNodeAttributes((_name, attr) => ({
    ...attr,
    ...inOutSum[attr.id as Id],
  }))
  return graph
}
