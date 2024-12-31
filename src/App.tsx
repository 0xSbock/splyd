import { useState, useMemo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { AutomergeUrl, Repo } from '@automerge/automerge-repo'
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
import { BrowserWebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'

import { BrowserRouter, Routes, Route } from 'react-router'

import LocalDocsList from './LocalDocList'
import Overview from './Overview'
import Users from './Users'
import UserAdd from './UserAdd'
import PaymentList from './PaymentList'
import PaymentAdd from './PaymentAdd'
import ExpenseList from './ExpenseList'
import ExpenseAdd from './ExpenseAdd'
import Menu from './Menu'

import { ErrorBoundary } from 'react-error-boundary'

import { DocUrlContext } from './context'
import FallbackComponent from './FallBackComponent'

function App() {
  const defaultTheme = createTheme({ palette: { mode: 'dark' } })
  const [docUrl, setDocUrl] = useState<undefined | AutomergeUrl>(undefined)

  const repo = useMemo(
    () =>
      new Repo({
        storage: new IndexedDBStorageAdapter(),
        network: [
          new BroadcastChannelNetworkAdapter(),
          new BrowserWebSocketClientAdapter(
            import.meta.env.PROD
              ? `wss://${window.location.host}/ws/`
              : 'ws://localhost:3030'
          ),
        ],
      }),
    []
  )

  return (
    <ThemeProvider theme={defaultTheme}>
      <RepoContext.Provider value={repo}>
        <DocUrlContext.Provider value={[docUrl, setDocUrl]}>
          <CssBaseline />
          <ErrorBoundary FallbackComponent={FallbackComponent}>
            <BrowserRouter>
              <Routes>
                <Route index element={<LocalDocsList />} />
                <Route element={<Menu />}>
                  <Route path=":id">
                    <Route index element={<Overview />} />
                    <Route path="users">
                      <Route index element={<Users />} />
                      <Route path="add" element={<UserAdd />} />
                    </Route>
                    <Route path="payments">
                      <Route index element={<PaymentList />} />
                      <Route path="add" element={<PaymentAdd />} />
                    </Route>
                    <Route path="expenses">
                      <Route index element={<ExpenseList />} />
                      <Route path="add" element={<ExpenseAdd />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </DocUrlContext.Provider>
      </RepoContext.Provider>
    </ThemeProvider>
  )
}

export default App
