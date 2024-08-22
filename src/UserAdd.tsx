import { useState, useContext, FormEvent } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import {
  Alert,
  Button,
  Grid,
  Snackbar,
  Paper,
  TextField,
  Typography,
  FormLabel,
} from '@mui/material'

import TransactionDoc, { User } from './transactionDoc'
import { DocUrlContext } from './context'
import { usernameTaken } from './utils'

const UserAdd = () => {
  const [docUrl, _] = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [username, setUsername] = useState('')
  const [alert, setAlert] = useState<{
    open: boolean
    severity: 'success' | 'info' | 'warning' | 'error'
    message: string
  }>({ open: false, severity: 'error', message: '' })

  const handleUsernameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // check if user with that name already exists
    if (usernameTaken(doc, username)) {
      setAlert({
        open: true,
        severity: 'error',
        message: `User with name ${username} already exists`,
      })
      return
    }
    const newUser: User = {
      id: self.crypto.randomUUID(),
      name: username,
      createdAt: new Date(),
    }
    changeDoc((d) => d?.users.push(newUser))
    setAlert({
      open: true,
      severity: 'success',
      message: `Created user ${username}`,
    })

    setUsername('')
  }

  const handleAlertClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return
    setAlert({ open: false, severity: 'error', message: '' })
  }

  // TODO: this should be a proper form
  return (
    <>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Add a User
      </Typography>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ mb: 2 }} variant="subtitle1" gutterBottom>
          Add users to your document and let them participate in expenses or
          payments.
        </Typography>
        <form onSubmit={handleUsernameSubmit}>
          <FormLabel sx={{ mb: 2 }} component="legend">
            New User
          </FormLabel>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                sx={{ width: '100%' }}
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                label="Name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={4}>
              <Button
                sx={{ height: '100%', width: '100%' }}
                variant="contained"
                type="submit"
              >
                Add User
              </Button>
            </Grid>
          </Grid>
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
      </Paper>
    </>
  )
}

export default UserAdd
