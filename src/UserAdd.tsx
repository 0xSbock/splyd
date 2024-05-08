import { useState, useContext } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import TransactionDoc, { User } from './transactionDoc'
import { DocUrlContext } from './context'
import { usernameTaken } from './utils'

const UserAdd = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const [username, setUsername] = useState('')

  const handleUsernameSubmit = () => {
    // check if user with that name already exists
    if (usernameTaken(doc, username)) {
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
  return {
    /* FIXME: removed primereact components
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
    */
  }
}

export default UserAdd
