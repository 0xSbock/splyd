import { useContext } from 'react'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import TransactionDoc from './transactionDoc'
import { DocUrlContext } from './context'
import { Accordion, AccordionTab } from 'primereact/accordion'

const TransactionList = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, _] = useDocument<TransactionDoc>(docUrl)
  const createTransactionTabs = () =>
    doc?.transactions.map((tx) => (
      <AccordionTab key={tx.id} header={tx.title}>
        <pre>{JSON.stringify(tx, null, 2)}</pre>
      </AccordionTab>
    ))
  return <Accordion multiple={true}>{createTransactionTabs()}</Accordion>
}

export default TransactionList
