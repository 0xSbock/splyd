import { useState, useContext } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

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
    </>
  )
}

export default UserAdd
