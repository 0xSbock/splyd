import { useContext } from 'react'

import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import {
  Box,
  Divider,
  Stack,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  Chip,
} from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { DocUrlContext } from './context'
import TransactionDoc, { User, Id, Expense } from './transactionDoc'
import { generateUserMap } from './utils'

const ExpenseList = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)

  const userMap = generateUserMap(doc)

  const handleDelete = (id: Id) => {
    const expenseIndex = doc?.expenses.findIndex(
      (exp: Expense) => exp.id === id
    )
    changeDoc((d) => A.deleteAt(d.expenses, expenseIndex as number))
  }

  return (
    <>
      {doc?.expenses.map((expense, i) => (
        <Accordion key={expense.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`expense-${i}-content`}
            id={`expense-${i}-header`}
          >
            <Stack
              sx={{ width: '100%', pr: 2 }}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack
                direction="column"
                justifyContent="space-between"
                alignItems="flex-begin"
              >
                <Typography variant="h6">{expense.title}</Typography>
                {expense.date && (
                  <Typography
                    variant="caption"
                    sx={{ width: '15%', color: 'text.secondary', flexGrow: 1 }}
                  >
                    {new Date(expense.date).toLocaleDateString()}
                  </Typography>
                )}
              </Stack>
              <Typography sx={{ color: 'text.secondary' }}>
                {Number(expense.amount).toString()} {expense.currency || '€'}
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ m: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography gutterBottom variant="body1" component="div">
                  Paid By
                </Typography>
                <Typography gutterBottom variant="body1" component="div">
                  {userMap[expense.by] || ''}
                </Typography>
              </Stack>
              <Divider sx={{ mt: 2, mb: 2 }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography gutterBottom variant="body1">
                  Expense For
                </Typography>
                <Stack direction="row" spacing={1}>
                  {expense.for.map((uid) => (
                    <Chip label={userMap[uid]} key={`${expense.id}-${uid}`} />
                  ))}
                </Stack>
              </Stack>
            </Box>
          </AccordionDetails>
          <AccordionActions>
            <Button color="error" onClick={() => handleDelete(expense.id)}>
              Delete
            </Button>
            <Button onClick={() => alert('todo')}>Edit</Button>
          </AccordionActions>
        </Accordion>
      ))}
    </>
  )
}

export default ExpenseList
