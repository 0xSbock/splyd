import { useContext } from 'react'

import { isValidAutomergeUrl } from '@automerge/automerge-repo'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import { random } from 'graphology-layout'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import { Grid } from '@mui/material'

import { DocUrlContext } from './context'
import TransactionDoc from './transactionDoc'
import GraphVisualization from './GraphVisualization'
import Settlement from './Settlement'

import {
  generateGraph,
  findCandidate,
  optimizeTransaction,
  cleanUpGraph,
} from './graphProcessing'

const Overview = () => {
  const [docUrl, _] = useContext(DocUrlContext)
  if (isValidAutomergeUrl(docUrl)) {
    console.log('valid url passed', docUrl)
  }
  const [doc, _changeDoc] = useDocument<TransactionDoc>(docUrl)
  let graph = null
  if (doc) {
    const { users, expenses, payments } = doc
    console.log(users, expenses, payments)
    graph = generateGraph(doc)
    for (const candidate of findCandidate(graph)) {
      optimizeTransaction(graph, candidate)
    }
    graph.updateEachNodeAttributes((name, attr) => {
      const username = doc?.users.find((u) => u.id === name)?.name
      return {
        ...attr,
        size: 15,
        label: username,
      }
    })
    graph.updateEachEdgeAttributes((_edge, attr) => ({
      ...attr,
      label: `${attr.amount}€`,
      size: 5,
    }))
    random.assign(graph, { scale: 200 })
    forceAtlas2.assign(graph, {
      iterations: 10,
      settings: {
        gravity: 2,
      },
    })

    cleanUpGraph(graph)
  }
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <h1>Overview</h1>
        </Grid>
        <Grid item xs={12}>
          <Settlement
            graph={graph}
            defaultCurrency={doc?.settings.defaultCurrency || '€'}
          />
        </Grid>
        <Grid item xs={12}>
          <GraphVisualization graph={graph} />
        </Grid>
      </Grid>
    </>
  )
}
export default Overview
