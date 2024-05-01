import { AutomergeUrl } from '@automerge/automerge-repo'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { next as A } from '@automerge/automerge'

interface CounterDoc {
  counter: A.Counter
}

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const [doc, changeDoc] = useDocument<CounterDoc>(docUrl)

  return (
    <>
      <pre>{JSON.stringify(doc, null, 2)}</pre>
    </>
  )
}

export default App
