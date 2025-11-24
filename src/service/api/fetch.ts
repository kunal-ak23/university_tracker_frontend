/* eslint-disable @typescript-eslint/ban-ts-comment */

"use server";

import { auth } from "@/auth"
import { buildApiError, SessionExpiredError } from "./errors"


export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const session = await auth()
  const accessToken = (session as { accessToken?: string } | null)?.accessToken
  const refreshToken = (session as { refreshToken?: string } | null)?.refreshToken

  if (!accessToken) {
    throw new SessionExpiredError()
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL
  const url = `${baseURL}${endpoint}`

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    })
  } catch (error) {
    throw new Error("Network request failed", { cause: error })
  }

  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${baseURL}/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      })

      if (!refreshResponse.ok) {
        throw new SessionExpiredError("Refresh token expired. Please login again.")
      }

      const { access: newAccessToken } = await refreshResponse.json()

      response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newAccessToken}`,
          ...options.headers,
        },
      })
    } catch (error) {
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

  // For DELETE requests or when no content is expected
  if (options.method === 'DELETE' || response.status === 204) {
    return null
  }

  try {
    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json()
      return jsonData
    }
    return null;
  } catch (error) {
    throw new Error('Failed to parse response')
  }
}

export async function postFormData(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
) {
  const session = await auth()
  const accessToken = (session as { accessToken?: string } | null)?.accessToken
  const refreshToken = (session as { refreshToken?: string } | null)?.refreshToken

  if (!accessToken) {
    throw new SessionExpiredError()
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL
  const url = `${baseURL}${endpoint}`

  let response = await fetch(url, {
    ...options,
    body: formData,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(`${baseURL}/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      })

      if (!refreshResponse.ok) {
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

  return response.json()
}
