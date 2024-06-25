import Graph from 'graphology'
import { expect, test } from 'vitest'
import { findCandidates } from './calculateTransactions'


test('basic candidate search', () => {
  const testGraph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })

  const ids = ["0", "1", "2"]
  ids.forEach(i => testGraph.addNode(i))

  testGraph.addDirectedEdge(ids[0], ids[1])
  testGraph.addDirectedEdge(ids[0], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[2])
  expect(findCandidates(testGraph)).toStrictEqual(["0"])
})

test('four node', () => {
  const testGraph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })

  const ids = ["0", "1", "2", "3"]
  ids.forEach(i => testGraph.addNode(i))

  testGraph.addDirectedEdge(ids[0], ids[1])
  testGraph.addDirectedEdge(ids[0], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[3])
  testGraph.addDirectedEdge(ids[2], ids[3])
  expect(findCandidates(testGraph)).toStrictEqual(["0", "1"])
})

test('complete graph', () => {
  const testGraph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })

  let ids = []
  for (let i = 0; i < 10; i++) {
    ids.push(i.toString())
    testGraph.addNode(i.toString())
  }
  for (const idX of ids) {
    for (const idY of ids) {
      if (idX !== idY) {
        testGraph.addDirectedEdge(idX, idY)
      }
    }
  }
  expect(findCandidates(testGraph)).toStrictEqual(ids)
})
