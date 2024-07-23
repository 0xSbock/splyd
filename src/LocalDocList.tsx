import { useState, useContext, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'

import { next as A } from '@automerge/automerge'
import {
  AnyDocumentId,
  AutomergeUrl,
  DocHandle,
} from '@automerge/automerge-repo'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'

import TransactionDoc, { Id } from './transactionDoc'
import { DocUrlContext } from './context'

const LocalDocsList = () => {
  const repo = useContext(RepoContext)
  const [_, setDocUrl] = useContext(DocUrlContext)
  const [docs, setDocs] = useState<DocHandle<TransactionDoc>[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [groupName, setGroupName] = useState<string>('')

  useEffect(() => {
    // FIXME: replace all this error prone code by on `repo.handles` call and map it /o\
    const dbName = 'automerge'
    // TODO: should we pass a version?
    const request = indexedDB.open(dbName)
    request.onerror = (event) => {
      return (
        <>
          <h1>Error: localIndexedDB could not be accessed</h1>
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </>
      )
    }

    request.onsuccess = (event) => {
      // @ts-expect-error use repo to find all available docs
      const db = event.target.result
      if (
        db &&
        db.objectStoreNames &&
        db.objectStoreNames.contains('documents')
      ) {
        const transaction = db?.transaction(['documents'])
        const objectStore = transaction.objectStore('documents')
        // FIXME:
        // @ts-expect-error we don't need to type this as this code should be replaced by querying the repo
        // using the provided api
        objectStore.getAllKeys().onsuccess = async (event) => {
          const docs: DocHandle<TransactionDoc>[] = await Promise.all(
            event.target.result
              .filter(
                ([_id, type, _data]: [AnyDocumentId, string, string]) =>
                  type === 'snapshot'
              )
              .map(([id, _type, _data]: [AnyDocumentId, string, string]) => id)
              .map(
                async (
                  id: AnyDocumentId
                ): Promise<{ id: Id; doc: DocHandle<TransactionDoc> }> => ({
                  id: id as string,
                  // @ts-expect-error again... just use the repo
                  doc: await repo.find(id).doc(),
                })
              )
          )
          setDocs(docs)
        }
      }
    }
  }, [repo])
  const createNewDoc = () => {
    if (repo) {
      const doc = repo.create<TransactionDoc>()
      doc.change((d) => {
        d.version = new A.Uint(0)
        d.users = []
        d.payments = []
        d.expenses = []
        d.name = groupName
        d.settings = {
          defaultCurrency: '€',
        }
      })
      const docNew = repo?.find(doc.url)
      // TODO: setDocUrl could theoretically be unedfined, maybe add some error state for that?
      if (setDocUrl) {
        setDocUrl(docNew.url as AutomergeUrl)
      }
    }
  }
  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <pre>{JSON.stringify(docs, null, 2)}</pre>
      <Button variant="outlined" onClick={() => setDialogOpen(true)}>
        Create New Doc
      </Button>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const formJson = Object.fromEntries(formData.entries())
            const groupName = formJson.groupname as string
            if (groupName.length <= 1) {
              // FIXME: proper error handling!
              alert('choose a longer group name')
            } else {
              createNewDoc()
              setDialogOpen(false)
            }
          },
        }}
      >
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create a new group please enter the groups name below
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="groupname"
            label="Group Name"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LocalDocsList
