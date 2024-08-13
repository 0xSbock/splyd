import { useEffect, useState } from 'react'

const storageId = 'localHandles'
const getLocalHandles = (): string[] =>
  JSON.parse(localStorage.getItem(storageId)!) as string[]

export const useLocalHandles = (): [string[], (toStore: string[]) => void] => {
  if (localStorage.getItem(storageId) === null) {
    localStorage.setItem(storageId, '[]')
  }
  const [localHandles, setLocalHandles] = useState<string[]>(getLocalHandles())

  const updateLocalStorage = (toStore: string[]) => {
    localStorage.setItem(storageId, JSON.stringify(toStore))
  }

  useEffect(() => {
    const updateBinding = () => setLocalHandles(getLocalHandles())
    window.addEventListener('storage', () => updateBinding)
    return () => window.removeEventListener('storage', updateBinding)
  }, [])

  return [localHandles, updateLocalStorage]
}
