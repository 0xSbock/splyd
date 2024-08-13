import { useContext } from 'react'

import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import {
  Box,
  Stack,
  Accordion,
  AccordionActions,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
  Paper,
} from '@mui/material'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { DocUrlContext } from './context'
import TransactionDoc, { Id, Payment } from './transactionDoc'
import { generateUserMap } from './utils'
import EmptyListInfo from './EmptyListInfo'

const PaymentList = () => {
  const [docUrl, _] = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)

  const renderList = (doc?.payments.length ?? 0) > 0

  const userMap = generateUserMap(doc)

  const handleDelete = (id: Id) => {
    const paymentIndex = doc?.payments.findIndex(
      (exp: Payment) => exp.id === id
    )
    changeDoc((d) => A.deleteAt(d.payments, paymentIndex!))
    doc?.payments.forEach((payment, i) => {
      if (payment.from === id || payment.to === id) {
        changeDoc((d) => A.deleteAt(d.payments, i))
      }
    })
  }

  const emptyListInfo = (
    <EmptyListInfo
      heading={'Currently no payments in document'}
      info={
        'To add new payments click on the action button in the bottom right.'
      }
    />
  )

  const paymentList = doc?.payments.map((payment, i) => (
    <Accordion key={payment.id}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`payment-${i}-content`}
        id={`payment-${i}-header`}
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
            {payment.title ? (
              <Typography variant="h6">{payment.title}</Typography>
            ) : (
              <Typography variant="h6">
                {userMap[payment.from]} → {userMap[payment.to]}
              </Typography>
            )}
            {payment.date && (
              <Typography
                variant="caption"
                sx={{ width: '15%', color: 'text.secondary', flexGrow: 1 }}
              >
                {new Date(payment.date).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
          <Typography sx={{ color: 'text.secondary' }}>
            {Number(payment.amount).toString()} {payment.currency}
          </Typography>
        </Stack>
      </AccordionSummary>
      {!!payment.title && (
        <AccordionDetails>
          <Box sx={{ m: 2 }}>
            <Typography gutterBottom variant="body1" component="div">
              {userMap[payment.from]} → {userMap[payment.to]}
            </Typography>
          </Box>
        </AccordionDetails>
      )}
      <AccordionActions>
        <Button color="error" onClick={() => handleDelete(payment.id)}>
          Delete
        </Button>
        <Button onClick={() => alert('todo')}>Edit</Button>
      </AccordionActions>
    </Accordion>
  ))

  return (
    <>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Payments
      </Typography>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        {renderList ? paymentList : emptyListInfo}
      </Paper>
    </>
  )
}

export default PaymentList
