import Graph from 'graphology'
import { expect, test } from 'vitest'
import { findCandidate, optimizationCandidate } from './calculateTransactions'

test('basic candidate search', () => {
  const testGraph = new Graph({
    multi: true,
    allowSelfLoops: false,
    type: 'directed',
  })

  const ids = ['0', '1', '2']
  ids.forEach((i) => testGraph.addNode(i))

  const expected: optimizationCandidate = {
    root: '0',
    targets: {
      from: '1',
      to: '2',
    },
  }

  testGraph.addDirectedEdge(ids[0], ids[1])
  testGraph.addDirectedEdge(ids[0], ids[2])
  testGraph.addDirectedEdge(ids[1], ids[2])

  for (const foundCandidate of findCandidate(testGraph)) {
    expect(foundCandidate).toStrictEqual(expected)
  }
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
      targets: {
        from: '1',
        to: '2',
      },
    },
    {
      root: '1',
      targets: {
        from: '2',
        to: '3',
      },
    },
  ]

  const foundCandidates = []
  for (const candidate of findCandidate(testGraph)) {
    foundCandidates.push(candidate)
  }

  expect(foundCandidates).toStrictEqual(expected)
})
