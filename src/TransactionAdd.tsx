import { useState, useContext } from 'react'
import { next as A } from '@automerge/automerge'
import { useDocument } from '@automerge/automerge-repo-react-hooks'
import { InputText } from 'primereact/inputtext'
import {
  InputNumber,
  InputNumberValueChangeEvent,
} from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import { InputTextarea } from 'primereact/inputtextarea'
import { Divider } from 'primereact/divider'
import { Button } from 'primereact/button'

import TransactionDoc, {
  Transaction,
  TransactionParticipant,
  User,
} from './transactionDoc'
import { DocUrlContext } from './context'
import { Checkbox } from 'primereact/checkbox'

const TransactionsAdd = () => {
  const docUrl = useContext(DocUrlContext)
  const [doc, changeDoc] = useDocument<TransactionDoc>(docUrl)
  const emptyTranscation = {
    amount: new A.Float64(0),
    createdAt: new Date(),
    // TODO: set up  different currencies
    currency: 'EUR',
    id: self.crypto.randomUUID(),
    participants: [],
    paying: undefined,
    title: '',
    date: undefined,
    description: undefined,
  }
  const [newTransaction, setNewTransaction] =
    useState<Transaction>(emptyTranscation)
  const [paying, setPaying] = useState<User | undefined>(undefined)
  const [newParticipant, setNewParticipant] = useState<User | undefined>(
    undefined
  )

  const handleNewParticipant = () => {
    // TODO: handle error case
    if (!newParticipant) {
      console.log('no new Participant')
      return
    }

    const newTransactionParticipant: TransactionParticipant = {
      userId: newParticipant.id,
    }
    setNewTransaction({
      ...newTransaction,
      participants: [...newTransaction.participants, newTransactionParticipant],
    })
    setNewParticipant(undefined)
  }

  const participants = newTransaction.participants.map((p) => {
    const user = doc?.users.find((u) => u.id === p.userId)
    return (
      <div className="card flex flex-wrap gap-3 p-fluid" key={p.userId}>
        <div className="flex-auto">Name: {user?.name}</div>
        <div className="flex-auto"></div>
        <div className="flex-auto">
          Total:{' '}
          {newTransaction.amount.value *
            (1 / newTransaction.participants.length)}
          {newTransaction.currency}
        </div>
      </div>
    )
  })

  const finalize = () => {
    console.log(newTransaction)
    changeDoc((d) =>
      d.transactions.push({
        ...newTransaction,
        paying: paying?.id,
      })
    )
    setNewTransaction(emptyTranscation)
    setNewParticipant(undefined)
  }

  return (
    <>
      <div className="card flex flex-wrap gap-3 p-fluid">
        <div className="flex-auto">
          <label htmlFor="title" className="font-bold block mb-2">
            Title
          </label>
          <InputText
            id="title"
            value={newTransaction.title}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, title: e.target.value })
            }
          />
        </div>
        <div className="flex-auto">
          <label htmlFor="Amount" className="font-bold block mb-2">
            Amount
          </label>
          <InputNumber
            inputId="amount"
            value={newTransaction.amount.value}
            onValueChange={(e: InputNumberValueChangeEvent) =>
              setNewTransaction({
                ...newTransaction,
                amount: new A.Float64(e.value || 0),
              })
            }
            mode="currency"
            // TODO: enable changing the currency?
            currency="EUR"
            locale="de-DE"
          />
        </div>
        <div className="flex-auto">
          <label htmlFor="date" className="font-bold block mb-2">
            Date
          </label>
          <Calendar
            id="date"
            value={newTransaction.date || new Date()}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                date: e.value || undefined,
              })
            }
            showTime
            showButtonBar
            hourFormat="24"
          />
        </div>
        <div className="flex-auto">
          <label htmlFor="paying" className="font-bold block mb-2">
            Paying
          </label>
          <Dropdown
            id="paying"
            value={paying}
            onChange={(e: DropdownChangeEvent) => setPaying(e.value)}
            options={doc?.users}
            optionLabel="name"
            placeholder="Select the person Paying"
            className="w-full md:w-14rem"
            checkmark={true}
            highlightOnSelect={true}
          />
        </div>
        <div className="flex-auto">
          <label htmlFor="description">Description</label>
          <InputTextarea
            id="description"
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                description: e.target.value,
              })
            }
            rows={5}
            cols={30}
          />
        </div>
        {newTransaction.participants.length > 0 && (
          <>
            <Divider align="left">
              <div className="inline-flex align-items-center">
                <i className="pi pi-user mr-2"></i>
                <b>Participants</b>
              </div>
            </Divider>
            {participants}
          </>
        )}
        <Divider align="left">
          <div className="inline-flex align-items-center">
            <i className="pi pi-user mr-2"></i>
            <b>New Participants</b>
          </div>
        </Divider>
        <div className="card">
          <div className="flex-auto">
            <label htmlFor="newParticipant" className="font-bold block mb-2">
              New Transaction Participant
            </label>
            <Dropdown
              id="newParticipant"
              value={newParticipant}
              onChange={(e: DropdownChangeEvent) => setNewParticipant(e.value)}
              options={doc?.users.filter(
                (u) =>
                  !newTransaction.participants
                    .map((i) => i.userId)
                    .includes(u.id)
              )}
              optionLabel="name"
              placeholder="Select a new person participating in the payment"
              className="w-full md:w-14rem"
              checkmark={true}
              highlightOnSelect={true}
            />
            <Button onClick={() => handleNewParticipant()}>
              Add Participant
            </Button>
          </div>
        </div>

        <div className="card">
          <div className="flex-auto">
            <Button onClick={() => finalize()}>Add Transaction</Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default TransactionsAdd
