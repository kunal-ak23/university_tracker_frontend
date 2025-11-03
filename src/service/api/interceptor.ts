"use client"

/* eslint-disable @typescript-eslint/ban-ts-comment */

// Global loading state manager
class LoadingManager {
  private loadingState = false
  private listeners: Set<(loading: boolean) => void> = new Set()

  setLoading(loading: boolean) {
    console.log('[LoadingManager] setLoading called:', loading, {
      currentState: this.loadingState,
      listenerCount: this.listeners.size,
      timestamp: new Date().toISOString()
    })
    if (this.loadingState !== loading) {
      this.loadingState = loading
      console.log('[LoadingManager] State changed, notifying listeners:', this.listeners.size)
      this.listeners.forEach(listener => {
        try {
          listener(loading)
        } catch (error) {
          console.error('[LoadingManager] Error notifying listener:', error)
        }
      })
    } else {
      console.log('[LoadingManager] State unchanged, skipping notification')
    }
  }

  subscribe(listener: (loading: boolean) => void) {
    console.log('[LoadingManager] New subscriber added, total:', this.listeners.size + 1)
    this.listeners.add(listener)
    return () => {
      console.log('[LoadingManager] Subscriber removed, remaining:', this.listeners.size - 1)
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
  const startTime = Date.now()
  console.log('[interceptFetch] Starting fetch, setting loading to true', {
    timestamp: new Date().toISOString()
  })
  loadingManager.setLoading(true)
  try {
    console.log('[interceptFetch] Waiting for fetch promise...')
    const response = await fetchPromise
    const duration = Date.now() - startTime
    console.log('[interceptFetch] Fetch completed', {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      url: response.url
    })
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[interceptFetch] Fetch failed', {
      error,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    })
    throw error
  } finally {
    // Small delay to prevent flickering for fast requests
    const duration = Date.now() - startTime
    console.log('[interceptFetch] Setting loading to false after', duration, 'ms')
    setTimeout(() => {
      console.log('[interceptFetch] Timeout fired, setting loading to false')
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

