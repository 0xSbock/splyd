import { useState, useContext, useEffect, FormEvent } from 'react'

import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import {
  Button,
  FormLabel,
  FormGroup,
  Input,
  InputLabel,
  InputAdornment,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'

import { DocUrlContext } from './context'
import TransactionDoc, { Payment, Id, User } from './transactionDoc'
import { generateUserMap } from './utils'

interface FormData {
  amount?: A.Float64
  currency?: string
  title?: string
  from?: Id
  to?: Id
  date?: Date
}

type Severity = 'success' | 'info' | 'warning' | 'error'

const PaymentAdd = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)

  const [formData, setFormData] = useState<FormData>({})

  // ugly hack to fix race condition between doc loading slowly and setting state
  useEffect(() => {
    if (!formData.currency) {
      setFormData({ ...formData, currency: doc?.settings.defaultCurrency })
    }
  }, [doc?.settings.defaultCurrency])

  const [showMore, setShowMore] = useState(false)
  const [alert, setAlert] = useState<{
    open: boolean
    severity: Severity
    message: string
  }>({ open: false, severity: 'error', message: '' })

  const userMap = generateUserMap(doc)

  const handleAlertClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return
    setAlert({ open: false, severity: 'error', message: '' })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const alertDefaults = {
      open: true,
      severity: 'error' as Severity,
    }
    if (!formData.from) {
      setAlert({
        ...alertDefaults,
        message: 'Select a payment origin',
      })
      return
    }
    if (!formData.to) {
      setAlert({
        ...alertDefaults,
        message: 'Select a payment destitination',
      })
      return
    }
    if (formData.from === formData.to) {
      setAlert({
        ...alertDefaults,
        message: 'Sender and recipient have to differ',
      })
      return
    }
    if (!formData.amount) {
      setAlert({
        ...alertDefaults,
        message: 'Specify a payment amount',
      })
      return
    }
    const newPayment: Payment = {
      ...formData,
      id: self.crypto.randomUUID(),
      createdAt: new Date(),
    } as Payment
    changeDoc((d) => d.payments.push(newPayment))
    setAlert({
      open: true,
      severity: 'success',
      message: `Added Payment: ${userMap[formData.from]} -> ${userMap[formData.to]}: ${formData.amount.value} ${formData.currency}`,
    })
    setFormData({ currency: doc?.settings.defaultCurrency })
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <FormLabel component="legend">New Expense</FormLabel>
        <FormGroup>
          <InputLabel id="from-label">From</InputLabel>
          <Select
            labelId="from-label"
            id="from"
            value={formData.from || ''}
            onChange={(e: SelectChangeEvent) =>
              setFormData({ ...formData, from: e.target.value as Id })
            }
            label="from"
          >
            {doc?.users.map((u: User) => (
              <MenuItem key={`from-${u.id}`} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
          <InputLabel id="to-label">To</InputLabel>
          <Select
            labelId="to-label"
            id="to"
            value={formData.to || ''}
            onChange={(e: SelectChangeEvent) =>
              setFormData({ ...formData, to: e.target.value as Id })
            }
            label="to"
          >
            {doc?.users.map((u: User) => (
              <MenuItem key={`to-${u.id}`} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
          <InputLabel htmlFor="amount">Amount</InputLabel>
          <Input
            id="amount"
            value={formData.amount?.value || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: new A.Float64(Number(e.target.value)),
              })
            }
            startAdornment={
              <InputAdornment position="start">
                {formData.currency}
              </InputAdornment>
            }
            type="number"
          />
          {showMore && (
            <>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
            </>
          )}
          {showMore && (
            <>
              <InputLabel id="date-label">Date</InputLabel>
              <Input
                id="date"
                type="date"
                value={formData.date?.toISOString().split('T')[0] || ''}
                onChange={(e) =>
                  setFormData({ ...formData, date: new Date(e.target.value) })
                }
              />
            </>
          )}
          {showMore && (
            <>
              <InputLabel id="title-label">Title</InputLabel>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </>
          )}
          {!showMore && <Button onClick={() => setShowMore(true)}>More</Button>}
          <Button type="submit">Save</Button>
        </FormGroup>
      </form>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default PaymentAdd
