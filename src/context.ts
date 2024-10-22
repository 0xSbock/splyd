import { createContext, SetStateAction, Dispatch } from 'react'
import { AutomergeUrl } from '@automerge/automerge-repo'

export const DocUrlContext = createContext<
  [
    AutomergeUrl | undefined,
    Dispatch<SetStateAction<AutomergeUrl | undefined>> | undefined,
  ]
>([undefined, undefined])

export const ContentContext = createContext<
  Dispatch<SetStateAction<Element> | Element> | undefined
>(undefined)
