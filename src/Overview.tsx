import { useContext } from 'react'

import { useDocument } from '@automerge/automerge-repo-react-hooks'

import { Grid, Typography, Paper } from '@mui/material'

import { DocUrlContext } from './context'
import TransactionDoc from './transactionDoc'
import Settlement from './Settlement'

import {
  generateGraph,
  findCandidate,
  optimizeTransaction,
  cleanUpGraph,
} from './graphProcessing'

const Overview = () => {
  const [docUrl, _] = useContext(DocUrlContext)
  const [doc, _changeDoc] = useDocument<TransactionDoc>(docUrl)
  let graph = null
  if (doc) {
    graph = generateGraph(doc)
    for (const candidate of findCandidate(graph)) {
      optimizeTransaction(graph, candidate)
    }
    cleanUpGraph(graph)
  }
  return (
    <>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Settlement
              graph={graph}
              defaultCurrency={doc?.settings.defaultCurrency ?? '€'}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}
export default Overview
