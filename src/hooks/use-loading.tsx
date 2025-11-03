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
    console.log('[LoadingProvider] Setting up subscription to loadingManager')
    const unsubscribe = loadingManager.subscribe((loading) => {
      console.log('[LoadingProvider] Received loading state update:', loading, {
        previousState: isLoading,
        timestamp: new Date().toISOString()
      })
      setIsLoading(loading)
    })
    return () => {
      console.log('[LoadingProvider] Cleaning up subscription')
      unsubscribe()
    }
  }, [])

  const setLoading = (loading: boolean) => {
    console.log('[LoadingProvider] setLoading called directly:', loading)
    loadingManager.setLoading(loading)
    setIsLoading(loading)
  }

  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    const startTime = Date.now()
    console.log('[LoadingProvider] withLoading called, setting loading to true')
    loadingManager.setLoading(true)
    try {
      console.log('[LoadingProvider] Awaiting promise...')
      const result = await promise
      const duration = Date.now() - startTime
      console.log('[LoadingProvider] Promise resolved after', duration, 'ms')
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error('[LoadingProvider] Promise rejected after', duration, 'ms:', error)
      throw error
    } finally {
      const duration = Date.now() - startTime
      console.log('[LoadingProvider] Setting loading to false after', duration, 'ms')
      setTimeout(() => {
        console.log('[LoadingProvider] Timeout fired, setting loading to false')
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

