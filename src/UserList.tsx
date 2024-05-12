import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Snackbar from '@mui/material/Snackbar'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import TextField from '@mui/material/TextField'

import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

import { usernameTaken } from './utils'
import { DocUrlContext } from './context'
import TransactionDoc, { User, Id } from './transactionDoc'

const UserList = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [toEdit, setToEdit] = useState<
    { id: Id; username: string | undefined } | undefined
  >(undefined)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [alert, setAlert] = useState<{
    open: boolean
    severity: 'success' | 'info' | 'warning' | 'error'
    message: string
  }>({ open: false, severity: 'error', message: '' })

  const handleDialogClose = () => {
    setOpenDialog(false)
  }
  const handleUserDelete = (id: Id) => {
    const userIndex = doc?.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) {
      setAlert({
        open: true,
        severity: 'error',
        message: 'Trying to delete an unexisting user.',
      })
      return
    }
    changeDoc((d) => A.deleteAt(d.users, userIndex as number))
    setAlert({
      open: true,
      severity: 'success',
      // TODO: add undo method?
      message: `Deleted user`,
    })
  }

  const handleEditIconClick = (id: Id) => {
    const username = doc?.users.find((u) => u.id === id)?.name
    setToEdit({
      id,
      username,
    })
    setOpenDialog(true)
  }

  const handleAlertClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') return
    setAlert({ open: false, severity: 'error', message: '' })
  }

  const renderList = (doc?.users.length || 0) > 0
  const noUsersFound = (
    <Box component="section" sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        No users found :(
      </Typography>
    </Box>
  )
  const list = (
    <List>
      {doc?.users.map((u: User) => (
        <ListItem key={u.id}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid xs={10}>
              <Typography variant="body1" gutterBottom>
                {u.name}
              </Typography>
            </Grid>
            <Grid xs={1}>
              <IconButton
                edge="end"
                onClick={() => handleEditIconClick(u.id)}
                aria-label="edit"
              >
                <EditIcon />
              </IconButton>
            </Grid>
            <Grid xs={1}>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleUserDelete(u.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  )

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const formJson = Object.fromEntries(formData.entries())
            const newUsername = formJson.newUsername as string
            if (!toEdit?.id || !newUsername) {
              setAlert({
                open: true,
                severity: 'error',
                message: 'User ID to edit or new username does not exist',
              })
              return
            }
            if (usernameTaken(doc, newUsername)) {
              setAlert({
                open: true,
                severity: 'error',
                message: `Username ${newUsername} is already taken`,
              })
              return
            }
            changeDoc((d) => {
              const userIndex = d.users.findIndex((u) => u.id === toEdit?.id)
              if (userIndex === -1) return
              d.users[userIndex].name = newUsername
            })
            setAlert({
              open: true,
              severity: 'success',
              message: `Renamed user ${toEdit?.username} -> ${newUsername}`,
            })
            handleDialogClose()
          },
        }}
      >
        <DialogTitle>Edit Username of {toEdit?.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="newUsername"
            name="newUsername"
            label="New Username"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={toEdit?.username}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      {renderList ? list : noUsersFound}
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
export default UserList
