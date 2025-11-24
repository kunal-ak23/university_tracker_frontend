"use client"

import { getSession, signOut } from "next-auth/react"
import { loadingManager } from "./interceptor"
import { buildApiError, SessionExpiredError } from "./errors"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function postFormDataClient(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<any> {
  const session = (await getSession()) as { accessToken?: string; refreshToken?: string } | null
  const accessToken = session?.accessToken
  const refreshToken = session?.refreshToken
  
  if (!accessToken) {
    throw new SessionExpiredError()
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

    if (response.status === 401 && refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken
          })
        })

        if (!refreshResponse.ok) {
          await signOut({ redirect: true, callbackUrl: "/login?error=session_expired" })
          throw new SessionExpiredError("Refresh token expired. Please login again.")
        }

        const { access: newAccessToken } = await refreshResponse.json()
        
        response = await fetch(url, {
          ...options,
          body: formData,
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
            ...options.headers,
          },
        })
      } catch (error) {
        await signOut({ redirect: true, callbackUrl: "/login?error=session_expired" })
        if (error instanceof SessionExpiredError) {
          throw error
        }
        throw new SessionExpiredError("Failed to refresh token. Please login again.")
      }
    } else if (response.status === 401) {
      throw new SessionExpiredError()
    }

    if (!response.ok) {
      throw await buildApiError(response)
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  } catch (error) {
    throw error
  } finally {
    setTimeout(() => {
      loadingManager.setLoading(false)
    }, 100)
  }
}

