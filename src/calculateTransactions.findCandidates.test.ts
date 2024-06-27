import Graph from 'graphology'
import { expect, test } from 'vitest'
import { findCandidates, optimizationCandidate } from './calculateTransactions'

test('basic candidate search', () => {
  const testGraph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })

  const ids = ['0', '1', '2']
  ids.forEach((i) => testGraph.addNode(i))

  const expected: optimizationCandidate[] = [
    {
      root: '0',
      targets: ['1', '2'],
    },
  ]

  testGraph.addDirectedEdge(ids[0], ids[1])
  testGraph.addDirectedEdge(ids[0], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[2])
  const foundCandidates = findCandidates(testGraph)

  expect(foundCandidates[0].root).toStrictEqual(expected[0].root)
  expect(foundCandidates[0].targets.toSorted()).toStrictEqual(
    expected[0].targets.toSorted()
  )
})

test('four node', () => {
  const testGraph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })

  const ids = ['0', '1', '2', '3']
  ids.forEach((i) => testGraph.addNode(i))

  testGraph.addDirectedEdge(ids[0], ids[1])
  testGraph.addDirectedEdge(ids[0], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[3])
  testGraph.addDirectedEdge(ids[2], ids[3])

  const expected: optimizationCandidate[] = [
    {
      root: '0',
      targets: ['1', '2'],
    },
    {
      root: '1',
      targets: ['2', '3'],
    },
  ]

  const foundCandidates = findCandidates(testGraph)

  for (const n of [0, 1]) {
    expect(foundCandidates[n].root).toStrictEqual(expected[n].root)
    expect(foundCandidates[n].targets.toSorted()).toStrictEqual(
      expected[n].targets.toSorted()
    )
  }
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

  let expected: optimizationCandidate[] = []
  for (const idX of ids) {
    for (const idY of ids) {
      if (idX !== idY) {
        testGraph.addDirectedEdge(idX, idY)
      }
      for (const idZ of ids) {
        expected.push({
          root: idX,
          targets: [idY, idZ],
        })
      }
    }
  }

  for (const candidate of findCandidates(testGraph)) {
    const index = expected.findIndex(
      (el) =>
        el.root === candidate.root &&
        el.targets[0] === candidate.targets[0] &&
        el.targets[1] === el.targets[1]
    )
    expect(index >= 0)
    // TODO: remove cancdidate after it was used
  }
})
