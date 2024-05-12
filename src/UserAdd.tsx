import { useState, useContext } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'

import TransactionDoc, { User } from './transactionDoc'
import { DocUrlContext } from './context'
import { usernameTaken } from './utils'

const UserAdd = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [username, setUsername] = useState('')
  const [alert, setAlert] = useState<{
    open: boolean
    severity: 'success' | 'info' | 'warning' | 'error'
    message: string
  }>({ open: false, severity: 'error', message: '' })

  const handleUsernameSubmit = () => {
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
      <TextField
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        label="Name"
        variant="outlined"
      />
      <Button variant="contained" onClick={() => handleUsernameSubmit()}>
        Add User
      </Button>
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

export default UserAdd
