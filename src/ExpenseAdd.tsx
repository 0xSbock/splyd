import { useState, useContext, useEffect, FormEvent } from 'react'

import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import {
  Box,
  Button,
  CircularProgress,
  Input,
  FormGroup,
  FormLabel,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  MenuItem,
  ListItemText,
  Checkbox,
  Select,
  Snackbar,
  Alert,
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'

import { DocUrlContext } from './context'
import TransactionDoc, { User, Id, Expense } from './transactionDoc'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

// ensure data is correct on submit
interface FormData {
  title?: string
  amount?: A.Float64
  currency?: string
  by?: Id
  for?: Id[]
  date?: Date
}

// TODO: can this be importet from the MUI api?
type Severity = 'success' | 'info' | 'warning' | 'error'

const ExpenseAdd = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)

  const [showMore, setShowMore] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({})
  const [alert, setAlert] = useState<{
    open: boolean
    severity: Severity
    message: string
  }>({ open: false, severity: 'error', message: '' })

  // ugly hack to fix race condition between doc loading slowly and setting state
  useEffect(() => {
    if (!formData.currency) {
      setFormData({ ...formData, currency: doc?.settings.defaultCurrency })
    }
  }, [doc?.settings.defaultCurrency])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const alertDefaults = {
      open: true,
      severity: 'error' as Severity,
    }
    if (!formData.title) {
      setAlert({
        ...alertDefaults,
        message: 'The title of the expense is missing',
      })
      return
    }
    if (!formData.amount) {
      setAlert({
        ...alertDefaults,
        message: 'The amount of the expense is missing',
      })
      return
    }
    if (!formData.by) {
      setAlert({
        ...alertDefaults,
        message: 'Please select who paid the expense',
      })
      return
    }
    if (!formData.for || formData.for?.length === 0) {
      setAlert({
        ...alertDefaults,
        message: 'Please select who the expense was for',
      })
      return
    }
    const newExpense: Expense = {
      ...formData,
      id: self.crypto.randomUUID(),
      createdAt: new Date(),
    } as Expense // it's okay to typecast here because we checked the values before
    changeDoc((d) => d.expenses.push(newExpense))
    setAlert({
      open: true,
      severity: 'success',
      message: `Added Expense: ${formData.title}`,
    })
    setFormData({ currency: doc?.settings.defaultCurrency })
  }
  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event
    setFormData({
      ...formData,
      // On autofill we get a stringified value.
      for: typeof value === 'string' ? value.split(',') : value,
    })
  }

  const handleAlertClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return
    setAlert({ open: false, severity: 'error', message: '' })
  }

  if (!doc)
    return (
      <Box sx={{ display: 'flex' }}>
        <CircularProgress />
      </Box>
    )

  return (
    <>
      <form onSubmit={onSubmit}>
        <FormLabel component="legend">New Expense</FormLabel>
        <FormGroup>
          <InputLabel htmlFor="title">Title</InputLabel>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
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
                {formData.currency || ''}
              </InputAdornment>
            }
            type="number"
          />
          {showMore && (
            <>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Input
                id="currency"
                value={formData.currency || ''}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
            </>
          )}
          <InputLabel id="by-label">By</InputLabel>
          <Select
            labelId="by-label"
            id="by"
            value={formData.by || ''}
            onChange={(e: SelectChangeEvent) =>
              setFormData({ ...formData, by: e.target.value as Id })
            }
            label="by"
          >
            {doc?.users.map((u: User) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
          <InputLabel id="for-label">For</InputLabel>
          <Select
            labelId="for-label"
            id="for"
            multiple
            value={formData.for || []}
            input={<OutlinedInput label="Tag" />}
            renderValue={(selected: Id[]) =>
              selected
                .map((s: Id) => doc?.users.find((u) => u.id === s)?.name)
                .join(',')
            }
            onChange={handleMultiSelectChange}
            MenuProps={MenuProps}
          >
            {doc?.users.map((u: User) => (
              <MenuItem key={u.id} value={u.id}>
                <Checkbox
                  checked={
                    (formData.for || []).findIndex((mu) => u.id === mu) > -1
                  }
                />
                <ListItemText primary={u.name} />
              </MenuItem>
            ))}
          </Select>
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

export default ExpenseAdd
