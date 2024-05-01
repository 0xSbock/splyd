import { createContext } from "react"
import { AutomergeUrl } from '@automerge/automerge-repo'

export const DocUrlContext = createContext<undefined | AutomergeUrl>(undefined)
