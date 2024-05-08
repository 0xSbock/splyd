import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

import TransactionDoc, { User, Id } from './transactionDoc'
import { DocUrlContext } from './context'
import { usernameTaken } from './utils'

const createdAt = (user: User) => user.createdAt.toDateString()

const UserList = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [toEditID, setToEditID] = useState<Id | undefined>(undefined)
  const [newUsername, setNewUsername] = useState('')

  const handleUserDelete = (id: Id) => {
    const userIndex = doc?.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) {
      // TODO: handle error case
      console.error('Trying to delete unexisting user!')
      return
    }
    changeDoc((d) => A.deleteAt(d.users, userIndex as number))
  }

  const handleEditSave = (id: Id | undefined) => {
    if (!id) return
    if (usernameTaken(doc, newUsername)) {
      console.info('username already taken. thus, cannot rename.')
      return
    }
    changeDoc((d) => {
      const userIndex = d.users.findIndex((u) => u.id === id)
      if (userIndex === -1) return
      d.users[userIndex].name = newUsername
    })
    onDialogHide()
  }

  const onDialogOpen = (user: User) => {
    setToEditID(user.id)
    setNewUsername(user.name)
  }

  const onDialogHide = () => {
    setToEditID(undefined)
    setNewUsername('')
  }

  {
    /*
  const EditUser = (user: User) => (
    <button
      icon="pi pi-pencil"
      severity="info"
      onClick={() => onDialogOpen(user)}
    />
  )
  */
  }

  const userEditing = doc?.users.find((u: User) => u.id === toEditID)
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
      {doc?.users.map((u) => (
        <ListItem key={u.id}>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            <Grid xs={10}>
              <Typography variant="body1" gutterBottom>
                {u.name}
              </Typography>
            </Grid>
            <Grid xs={1}>
              <IconButton edge="end" aria-label="edit">
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

  return <>{renderList ? list : noUsersFound}</>
}
export default UserList
