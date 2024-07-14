import { useEffect } from 'react'

import Graph from 'graphology'
import { SigmaContainer, useLoadGraph } from '@react-sigma/core'
import '@react-sigma/core/lib/react-sigma.min.css'

const sigmaStyle = { height: '500px', width: '500px' }
const sigmaSettings = {
  defaultEdgeType: 'arrow',
  renderEdgeLabels: true,
}

const LoadGraph = ({ graph }: { graph: Graph | null }) => {
  const loadGraph = useLoadGraph()
  useEffect(() => {
    if (graph) {
      loadGraph(graph)
    }
  }, [loadGraph, graph])

  return null
}

const GraphVisualization = ({ graph }: { graph: Graph | null }) => {
  return (
    <SigmaContainer style={sigmaStyle} settings={sigmaSettings}>
      <LoadGraph graph={graph} />
    </SigmaContainer>
  )
}

export default GraphVisualization
