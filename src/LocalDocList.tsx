import { useState, useContext, useEffect } from 'react'
import {
  Avatar,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material'

import AssignmentIcon from '@mui/icons-material/Assignment'
import MenuIcon from '@mui/icons-material/Menu'

import { next as A } from '@automerge/automerge'
import {
  AnyDocumentId,
  AutomergeUrl,
  isValidAutomergeUrl,
  isValidDocumentId,
} from '@automerge/automerge-repo'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'

import TransactionDoc, { Id } from './transactionDoc'
import { DocUrlContext } from './context'

import AppBar from './AppBar'
import EmtpyListInfo from './EmptyListInfo'

import { useAppBarHeight } from './MuiHelper'

const LocalDocsList = () => {
  const repo = useContext(RepoContext)
  const [_, setDocUrl] = useContext(DocUrlContext)
  const [docs, setDocs] = useState<{ id: Id; doc: TransactionDoc }[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [groupName, setGroupName] = useState<string>('')

  const appBarHeight = useAppBarHeight()

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
      if (db?.objectStoreNames?.contains('documents')) {
        const transaction = db?.transaction(['documents'])
        const objectStore = transaction.objectStore('documents')
        // FIXME:
        // @ts-expect-error we don't need to type this as this code should be replaced by querying the repo
        // using the provided api
        objectStore.getAllKeys().onsuccess = async (event) => {
          const docs: { id: Id; doc: TransactionDoc }[] = await Promise.all(
            event.target.result
              .filter(
                ([_id, type, _data]: [AnyDocumentId, string, string]) =>
                  type === 'snapshot'
              )
              .map(([id, _type, _data]: [AnyDocumentId, string, string]) => id)
              .map(
                async (
                  id: AnyDocumentId
                ): Promise<{ id: Id; doc: TransactionDoc }> => ({
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
        setDocUrl(docNew.url)
      }
    }
  }
  const loadDoc = (id: Id) => {
    const url = `automerge:${id}`
    if (isValidDocumentId(id) && isValidAutomergeUrl(url)) {
      const doc = repo?.find(url)
      if (setDocUrl) {
        setDocUrl(doc?.url)
      }
    }
  }

  const listDocs = docs.map((d) => ({
    id: d.id,
    name: d.doc.name,
    users: d.doc.users.map((u) => u.name).join(', ') || 'No Users',
  }))

  const noDocs = (
    <EmtpyListInfo
      heading="No docs found!"
      info="Create a new Document by clicking the button below."
    />
  )

  return (
    <>
      <AppBar position="sticky" open={false}>
        <Toolbar
          sx={{
            pr: '24px', // keep right padding when drawer closed
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ marginRight: '36px' }}
            disabled
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Splyd
          </Typography>
        </Toolbar>
      </AppBar>

      <Stack
        sx={{
          minHeight: `calc(100vh - ${appBarHeight}px)`,
          padding: '5%',
        }}
        direction="column"
        justifyContent="space-between"
        alignItems="center"
      >
        {listDocs.length > 0 ? (
          <Box sx={{ width: '100%', padding: '5%' }}>
            <Typography component="h1" variant="h5">
              Choose an existing Document
            </Typography>
            <List>
              {listDocs.map((d) => (
                <ListItem
                  key={d.id}
                  onClick={() => loadDoc(d.id as AutomergeUrl)}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <AssignmentIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={d.name} secondary={d.users} />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          noDocs
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          sx={{ maxWidth: '75%' }}
          fullWidth
        >
          Create New Doc
        </Button>
      </Stack>
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
    </>
  )
}

export default LocalDocsList
