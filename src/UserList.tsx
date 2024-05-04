import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'
import { FloatLabel } from 'primereact/floatlabel'
import { InputText } from 'primereact/inputtext'

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

  const DeleteUser = (user: User) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      onClick={() => handleUserDelete(user.id)}
    />
  )

  const onDialogOpen = (user: User) => {
    setToEditID(user.id)
    setNewUsername(user.name)
  }

  const onDialogHide = () => {
    setToEditID(undefined)
    setNewUsername('')
  }

  const EditUser = (user: User) => (
    <Button
      icon="pi pi-pencil"
      severity="info"
      onClick={() => onDialogOpen(user)}
    />
  )

  const userEditing = doc?.users.find((u: User) => u.id === toEditID)

  return (
    <>
      <Dialog
        header={`Edit User: ${userEditing?.name}`}
        visible={toEditID !== undefined}
        style={{ width: '50vw' }}
        onHide={() => onDialogHide}
      >
        <FloatLabel>
          <InputText
            id="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <label htmlFor="newUsername">New Username</label>
        </FloatLabel>
        <Button onClick={() => handleEditSave(userEditing?.id)}>Save</Button>
      </Dialog>
      <div className="card">
        <DataTable
          value={doc?.users}
          header={header}
          tableStyle={{ minWidth: '60rem' }}
        >
          <Column field="name" header="Name" />
          <Column field="createdAt" header="Created At" body={createdAt} />
          <Column header="Edit" body={EditUser} />
          <Column header="Delete" body={DeleteUser} />
        </DataTable>
      </div>
    </>
  )
}
export default UserList
