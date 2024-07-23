import { useEffect, useState, useMemo } from 'react'

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
    if (rootDocUrl === docUrl) return
    document.location.hash = docUrl as string
  }, [docUrl])
  return (
    <RepoContext.Provider value={repo}>
      <DocUrlContext.Provider value={[docUrl, setDocUrl]}>
        {docUrl === undefined ? <LocalDocsList /> : <Menu />}
      </DocUrlContext.Provider>
    </RepoContext.Provider>
  )
}

export default App
