import { useEffect, useState, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import {
  AutomergeUrl,
  isValidAutomergeUrl,
  Repo,
} from '@automerge/automerge-repo'
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'

import { DocUrlContext } from './context'
import Menu from './Menu'
import LocalDocsList from './LocalDocList'

function App() {
  // TODO: remove, this demo shouldn't need to reset the theme.
  const defaultTheme = createTheme({ palette: { mode: 'dark' } })
  const [docUrl, setDocUrl] = useState<undefined | AutomergeUrl>(undefined)

  const repo = useMemo(
    () =>
      new Repo({
        network: [new BroadcastChannelNetworkAdapter()],
        storage: new IndexedDBStorageAdapter(),
      }),
    []
  )

  useEffect(() => {
    const rootDocUrl = `${document.location.hash.substring(1)}`
    if (isValidAutomergeUrl(rootDocUrl)) {
      const doc = repo.find(rootDocUrl)
      setDocUrl(doc.url)
    }
  }, [repo])
  useEffect(() => {
    const rootDocUrl = `${document.location.hash.substring(1)}`
    if (docUrl !== undefined && docUrl !== rootDocUrl) {
      document.location.hash = docUrl as string
    }
    if (rootDocUrl === undefined) {
      document.location.hash = ''
    }
  }, [docUrl])
  return (
    <ThemeProvider theme={defaultTheme}>
      <RepoContext.Provider value={repo}>
        <DocUrlContext.Provider value={[docUrl, setDocUrl]}>
          {docUrl === undefined ? <LocalDocsList /> : <Menu />}
        </DocUrlContext.Provider>
      </RepoContext.Provider>
    </ThemeProvider >
  )
}

export default App
