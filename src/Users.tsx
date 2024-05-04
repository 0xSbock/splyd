import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dialog } from 'primereact/dialog'

import TransactionDoc, { User } from './transactionDoc'
import { DocUrlContext } from './context'

import UserAdd from './UserAdd'

const header = (
  <div className="flex flex-wrap align-items-center justify-content-between gap-2">
    <span className="text-xl text-900 font-bold">List of Users</span>
  </div>
)

const createdAt = (user: User) => user.createdAt.toDateString()

const Users = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [visibleEditDialog, setVisibleEditDialog] = useState(false)

  const handleUserDelete = (id: string) => {
    const userIndex = doc?.users.findIndex((user: User) => user.id === id)
    if (userIndex === -1) {
      // TODO: handle error case
      console.error('Trying to delete unexisting user!')
      return
    }
    changeDoc((d) => A.deleteAt(d.users, userIndex as number))
  }

  const DeleteUser = (user: User) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      onClick={() => handleUserDelete(user.id)}
    />
  )

  const EditUser = () => (
    <Button
      icon="pi pi-pencil"
      severity="info"
      onClick={() => setVisibleEditDialog(true)}
    />
  )

  return (
    <>
      <Dialog
        header="Header"
        visible={visibleEditDialog}
        style={{ width: '50vw' }}
        onHide={() => setVisibleEditDialog(false)}
      >
        <h1>Foobar</h1>
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

      <UserAdd />
    </>
  )
}

export default Users
