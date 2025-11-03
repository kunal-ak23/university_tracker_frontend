"use client"

/* eslint-disable @typescript-eslint/ban-ts-comment */

// Global loading state manager
class LoadingManager {
  private loadingState = false
  private listeners: Set<(loading: boolean) => void> = new Set()

  setLoading(loading: boolean) {
    if (this.loadingState !== loading) {
      this.loadingState = loading
      this.listeners.forEach(listener => {
        try {
          listener(loading)
        } catch (error) {
          console.error('[LoadingManager] Error notifying listener:', error)
        }
      })
    }
  }

  subscribe(listener: (loading: boolean) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getLoading() {
    return this.loadingState
  }
}

export const loadingManager = new LoadingManager()

// Fetch interceptor wrapper
export async function interceptFetch(
  fetchPromise: Promise<Response>
): Promise<Response> {
  loadingManager.setLoading(true)
  try {
    const response = await fetchPromise
    return response
  } catch (error) {
    throw error
  } finally {
    // Small delay to prevent flickering for fast requests
    setTimeout(() => {
      loadingManager.setLoading(false)
    }, 100)
  }
}

// Wrapper for any async function
export function withLoading<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T {
  return (async (...args: any[]) => {
    loadingManager.setLoading(true)
    try {
      return await fn(...args)
    } finally {
      setTimeout(() => {
        loadingManager.setLoading(false)
      }, 100)
    }
  }) as T
}

