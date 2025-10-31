"use client"

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getSession, signOut } from "next-auth/react"
import { loadingManager } from "./interceptor"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function postFormDataClient(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<any> {
  const session = await getSession()
  
  // @ts-ignore
  const accessToken = session?.accessToken
  // @ts-ignore
  const refreshToken = session?.refreshToken
  
  if (!accessToken) {
    console.error('No access token in session:', session)
    throw new Error('No access token found. Please login again.')
  }

  const url = `${BASE_URL}${endpoint}`

  loadingManager.setLoading(true)
  
  try {
    let response = await fetch(url, {
      ...options,
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type - browser will set it with boundary for FormData
        ...options.headers,
      },
    })

    // If token expired, try to refresh
    if (response.status === 401 && refreshToken) {
      try {
        // Call refresh token endpoint directly
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh: refreshToken
          })
        })

        if (!refreshResponse.ok) {
          await signOut()
          throw new Error('Refresh token expired. Please login again.')
        }

        const { access: newAccessToken } = await refreshResponse.json()
        
        // Retry original request with new token
        response = await fetch(url, {
          ...options,
          body: formData,
          headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            ...options.headers,
          },
        })
      } catch (error) {
        await signOut()
        throw error
      }
    }

    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(JSON.stringify(errorData))
        }
        const errorText = await response.text()
        throw new Error(errorText || `API request failed with status ${response.status}`)
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('API request failed')
      }
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  } finally {
    setTimeout(() => {
      loadingManager.setLoading(false)
    }, 100)
  }
}

