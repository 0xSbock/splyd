import React from 'react'
import ReactDOM from 'react-dom/client'

import { isValidAutomergeUrl, Repo } from '@automerge/automerge-repo'
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { next as A } from '@automerge/automerge'
import { RepoContext } from '@automerge/automerge-repo-react-hooks'

import CssBaseline from '@mui/material/CssBaseline'

import TransactionDoc from './transactionDoc'
import { DocUrlContext } from './context'

import App from './App'

const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new IndexedDBStorageAdapter(),
})

const rootDocUrl = `${document.location.hash.substring(1)}`
let doc
if (isValidAutomergeUrl(rootDocUrl)) {
  doc = repo.find(rootDocUrl)
} else {
  doc = repo.create<TransactionDoc>()
  doc.change((d) => {
    d.version = new A.Uint(0)
    d.users = []
    d.transactions = []
    d.expenses = []
  })
}
const docUrl = (document.location.hash = doc.url)
// @ts-expect-error we'll use this later for experimentation
window.doc = doc

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <RepoContext.Provider value={repo}>
      <DocUrlContext.Provider value={docUrl}>
        <App />
      </DocUrlContext.Provider>
    </RepoContext.Provider>
  </React.StrictMode>
)
