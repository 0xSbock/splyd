import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

import TransactionDoc, { User, Id } from './transactionDoc'
import { DocUrlContext } from './context'
import { usernameTaken } from './utils'

const header = (
  <div className="flex flex-wrap align-items-center justify-content-between gap-2">
    <span className="text-xl text-900 font-bold">List of Users</span>
  </div>
)

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

  return (
    <>
      <List>
        {doc?.users.map((u) => (
          <ListItem
            key={u.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleUserDelete(u.id)}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            {u.name}
          </ListItem>
        ))}
      </List>
    </>
  )
}
export default UserList
