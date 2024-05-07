import { useContext } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import TransactionDoc from './transactionDoc'
import { DocUrlContext } from './context'

const TransactionList = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, _] = useDocument<TransactionDoc>(docUrl)
  const createTransactionTabs = () =>
    doc?.transactions.map((tx) => (
      /* FIXME: removed primereact components
      <AccordionTab key={tx.id} header={tx.title}>
        <pre>{JSON.stringify(tx, null, 2)}</pre>
      </AccordionTab>
      */
      <p>TODO</p>
    ))
  return <h1>TODO</h1>
  // FIXME:  removed primereact components
  // <Accordion multiple={true}>{createTransactionTabs()}</Accordion>
}

export default TransactionList
