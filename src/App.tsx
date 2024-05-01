import { AutomergeUrl } from '@automerge/automerge-repo'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { Button } from 'primereact/button';

import TransactionDoc from './transactionDoc'

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const [doc, _changeDoc] = useDocument<TransactionDoc>(docUrl)

  return (
    <>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
      <Button>Test</Button>
    </>
  )
}

export default App
