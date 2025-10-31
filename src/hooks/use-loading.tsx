"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { loadingManager } from "@/service/api/interceptor"

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((loading) => {
      setIsLoading(loading)
    })
    return unsubscribe
  }, [])

  const setLoading = (loading: boolean) => {
    loadingManager.setLoading(loading)
    setIsLoading(loading)
  }

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    loadingManager.setLoading(true)
    try {
      return await promise
    } finally {
      setTimeout(() => {
        loadingManager.setLoading(false)
      }, 100)
    }
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

