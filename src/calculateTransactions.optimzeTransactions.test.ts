import Graph from 'graphology'
import { expect, test } from 'vitest'
import { findCandidates, optimizeTransactions } from './calculateTransactions'

test('basic optimization', () => {
  const testGraph = new Graph({
    multi: false,
    allowSelfLoops: false,
    type: 'directed',
  })

  // initizalize graph
  const ids = ['U0', 'U1', 'U2']
  ids.forEach((i) => testGraph.addNode(i))
  testGraph.addDirectedEdge(ids[0], ids[1], { amount: 1000 })
  testGraph.addDirectedEdge(ids[0], ids[2], { amount: 2000 })
  testGraph.addDirectedEdge(ids[1], ids[2], { amount: 5000 })

  optimizeTransactions(testGraph, findCandidates(testGraph))
  expect(testGraph.order).toEqual(3)
  expect(testGraph.size).toEqual(2)
  expect(
    testGraph.getEdgeAttribute(testGraph.edge('U0', 'U1'), 'amount')
  ).toEqual(-4000)
  expect(
    testGraph.getEdgeAttribute(testGraph.edge('U0', 'U2'), 'amount')
  ).toEqual(7000)
})
