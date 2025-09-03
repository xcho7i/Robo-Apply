import { createContext, useContext, useState } from "react"

// Create the context
const AdditionalContextContext = createContext(undefined)

// Provider component
export const AdditionalContextProvider = ({ children }) => {
  const [contextList, setContextList] = useState([])

  const updateContext = (index, newValue) => {
    setContextList((prev) => {
      const updated = [...prev]
      updated[index] = newValue
      return updated
    })
  }

  return (
    <AdditionalContextContext.Provider value={{ contextList, setContextList, updateContext }}>
      {children}
    </AdditionalContextContext.Provider>
  )
}

// Custom hook for easier usage
export const useAdditionalContext = () => {
  const context = useContext(AdditionalContextContext)
  if (!context) throw new Error(
    "useAdditionalContext must be used within AdditionalContextProvider"
  )
  return context
}
