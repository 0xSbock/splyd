import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import {
  Box,
  List,
  Alert,
  Button,
  ListItem,
  Snackbar,
  Typography,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import { usernameTaken } from './utils'
import { DocUrlContext } from './context'
import TransactionDoc, { User, Id } from './transactionDoc'
import EmptyListInfo from './EmptyListInfo'

const UserList = () => {
  const [docUrl, _] = useContext(DocUrlContext)
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
  const emptyListInfo = (
    <EmptyListInfo
      heading={'Currently no users in document'}
      info={'To add new users click on the action button in the bottom right.'}
    />
  )
  const list = (
    <List>
      {doc?.users.map((u: User) => (
        <ListItem key={u.id}>
          <Stack
            direction="row"
            sx={{ width: '100%', pr: 2 }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body1" gutterBottom>
              {u.name}
            </Typography>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <IconButton
                edge="end"
                onClick={() => handleEditIconClick(u.id)}
                aria-label="edit"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleUserDelete(u.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
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
      {renderList ? list : emptyListInfo}
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
