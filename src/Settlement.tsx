import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import Graph from 'graphology'

interface Row {
  from: string
  to: string
  amount: number
  currency: string
}

// FIXME: currency shouldn't be passed like this but stored into the edge attrs
const Settlement = ({
  graph,
  defaultCurrency,
}: {
  graph: Graph | null
  defaultCurrency: string
}) => {
  if (!graph) return null
  const rows: Row[] = []
  graph.mapEdges((_name, attrs, _source, _target, sourceAttrs, targetAttrs) => {
    const row: Row = {
      from: sourceAttrs.name,
      to: targetAttrs.name,
      amount: attrs.amount,
      currency: defaultCurrency,
    }
    rows.push(row)
  })
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={`${row.from}->${row.to}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{row.from}</TableCell>
              <TableCell>{row.to}</TableCell>
              <TableCell align="right">
                {row.amount}&nbsp;{row.currency}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default Settlement
