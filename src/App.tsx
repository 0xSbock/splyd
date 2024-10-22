import { useEffect, useState, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import {
  AutomergeUrl,
  isValidAutomergeUrl,
  Repo,
} from '@automerge/automerge-repo'
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'

import { ErrorBoundary } from 'react-error-boundary'

import { DocUrlContext } from './context'
import Menu from './Menu'
import LocalDocsList from './LocalDocList'
import FallbackComponent from './FallBackComponent'

function App() {
  const defaultTheme = createTheme({ palette: { mode: 'dark' } })
  const [docUrl, setDocUrl] = useState<undefined | AutomergeUrl>(undefined)

  const repo = useMemo(
    () =>
      new Repo({
        storage: new IndexedDBStorageAdapter(),
        network: [new BroadcastChannelNetworkAdapter(), new BrowserWebSocketClientAdapter("ws://localhost:8000")],
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
          <CssBaseline />
          <ErrorBoundary FallbackComponent={FallbackComponent}>
            {docUrl === undefined ? <LocalDocsList /> : <Menu />}
          </ErrorBoundary>
        </DocUrlContext.Provider>
      </RepoContext.Provider>
    </ThemeProvider>
  )
}

export default App
