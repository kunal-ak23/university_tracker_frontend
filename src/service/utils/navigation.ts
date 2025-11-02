"use client"

import { useRouter, useSearchParams } from "next/navigation"

/**
 * Utility hook for handling navigation with return URLs
 * Allows forms to redirect back to where the user came from
 */
export function useReturnNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  /**
   * Get the return URL from query params or use browser back as fallback
   */
  const getReturnUrl = (): string | null => {
    return searchParams.get('returnTo')
  }
  
  /**
   * Navigate back to the return URL or use browser back
   */
  const navigateBack = () => {
    const returnTo = getReturnUrl()
    if (returnTo) {
      router.push(returnTo)
    } else {
      router.back()
    }
    router.refresh()
  }
  
  /**
   * Build a URL with return parameter
   */
  const buildUrlWithReturn = (url: string, currentPath?: string): string => {
    if (!currentPath) {
      // Try to get current path from window if available
      if (typeof window !== 'undefined') {
        currentPath = window.location.pathname + window.location.search
      } else {
        return url
      }
    }
    
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}returnTo=${encodeURIComponent(currentPath)}`
  }
  
  return {
    getReturnUrl,
    navigateBack,
    buildUrlWithReturn,
  }
}

/**
 * Helper function to build URLs with return parameter (for use outside components)
 */
export function buildUrlWithReturn(url: string, currentPath: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}returnTo=${encodeURIComponent(currentPath)}`
}

