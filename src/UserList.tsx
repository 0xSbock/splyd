import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
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
  const [toEditId, setToEditId] = useState<Id | undefined>(undefined)
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const handleDialogClose = () => {
    setOpenDialog(false)
  }
  const handleUserDelete = (id: Id) => {
    const userIndex = doc?.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) {
      // TODO: handle error case
      console.error('Trying to delete unexisting user!')
      return
    }
    changeDoc((d) => A.deleteAt(d.users, userIndex as number))
  }

  const handleEditIconClick = (id: Id) => {
    setToEditId(id)
    setOpenDialog(true)
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
            const newUsername = formJson.newUsername
            if (!toEditId || !newUsername) return
            if (usernameTaken(doc, newUsername)) {
              console.info('username already taken. thus, cannot rename.')
              return
            }
            changeDoc((d) => {
              const userIndex = d.users.findIndex((u) => u.id === toEditId)
              if (userIndex === -1) return
              d.users[userIndex].name = newUsername
            })
            handleDialogClose()
          },
        }}
      >
        <DialogTitle>Edit Username</DialogTitle>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      {renderList ? list : noUsersFound}
    </>
  )
}
export default UserList
