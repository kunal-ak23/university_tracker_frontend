"use client"

import { getSession, signOut } from "next-auth/react"
import { interceptFetch } from "./interceptor"
import { buildApiError, SessionExpiredError } from "./errors"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

type SessionWithTokens = {
  accessToken?: string
  refreshToken?: string
}

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const session = (await getSession()) as SessionWithTokens | null
    const accessToken = session?.accessToken
    const refreshToken = session?.refreshToken

    if (!accessToken) {
      throw new SessionExpiredError()
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    }

    let response = await interceptFetch(
      fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })
    )

    if (response.status === 401 && refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        })

        if (!refreshResponse.ok) {
          await signOut({ redirect: true, callbackUrl: "/login?error=session_expired" })
          throw new SessionExpiredError("Refresh token expired. Please login again.")
        }

        const { access: newAccessToken } = await refreshResponse.json()

        response = await interceptFetch(
          fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccessToken}`,
              ...options.headers,
            },
          })
        )
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

    if (response.status !== 204) {
      return await response.json()
    }
    return null
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: string;
    phone_number: string;
  }) {
    return this.fetch("/auth/register/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  async getUserProfile() {
    return this.fetch("/auth/me/")
  },
}