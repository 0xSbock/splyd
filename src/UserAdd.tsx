import { useState, useContext, useEffect } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { FloatLabel } from 'primereact/floatlabel'
import { Button } from 'primereact/button'

import TransactionDoc, { User } from './transactionDoc'
import { DocUrlContext } from './context'

const UserAdd = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [username, setUsername] = useState('')

  const handleUsernameSubmit = () => {
    // check if user with that name already exists
    const existingUsernames = doc?.users.map((u) => u.name) || []
    if (existingUsernames.findIndex((u) => u === username) !== -1) {
      // TODO: show error message
      console.info('user with that name already exists')
      return
    }
    const newUser: User = {
      id: self.crypto.randomUUID(),
      name: username,
      createdAt: new Date(),
    }
    changeDoc((d) => d?.users.push(newUser))
    setUsername('')
  }

  // TODO: this should be a proper form
  return (
    <Card title="Add a new User">
      <div className="m-0">
        <FloatLabel>
          <InputText
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="username">Username</label>
        </FloatLabel>
        <Button onClick={() => handleUsernameSubmit()}>Add User</Button>
      </div>
    </Card>
  )
}

export default UserAdd
