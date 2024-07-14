import Graph from 'graphology'

const cleanUpGraph = (graph: Graph | null) => {
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
    const sourceId = graph.getSourceAttribute(edge, 'id')
    const targetId = graph.getTargetAttribute(edge, 'id')
    graph.dropEdge(edge)
    // FIXME: currency should be an edge attribute
    graph.addEdge(targetId, sourceId, {
      ...oldAttrs,
      amount: newAmount,
      label: `${newAmount} €`,
    })
  })
}

export { cleanUpGraph }
