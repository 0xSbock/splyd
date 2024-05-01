import { AutomergeUrl } from '@automerge/automerge-repo'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

import TransactionDoc from './transactionDoc'

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const [doc, _changeDoc] = useDocument<TransactionDoc>(docUrl)

  return (
    <>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
    </>
  )
}

export default App
