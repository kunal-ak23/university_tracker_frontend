"use client"

import { getSession } from "next-auth/react"
import { useLoading } from "@/hooks/use-loading"
import { buildApiError, SessionExpiredError } from "./errors"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ClientAPIClient {
  private async getHeaders() {
    const session = (await getSession()) as { accessToken?: string } | null
    const accessToken = session?.accessToken

    if (!accessToken) {
      throw new SessionExpiredError()
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getHeaders()
    const mergedHeaders = {
      ...headers,
      ...options.headers,
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: mergedHeaders,
    })

    if (!response.ok) {
      throw await buildApiError(response)
    }

    if (response.status !== 204) {
      return await response.json()
    }
    return null
  }
}

export const clientApiClient = new ClientAPIClient()

// Hook-based API client wrapper that automatically handles loading state
export function useAPIClient() {
  const { setLoading, withLoading } = useLoading()

  const fetch = async (endpoint: string, options: RequestInit = {}) => {
    return withLoading(clientApiClient.fetch(endpoint, options))
  }

  const post = async (endpoint: string, data: any) => {
    return withLoading(
      clientApiClient.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      })
    )
  }

  const patch = async (endpoint: string, data: any) => {
    return withLoading(
      clientApiClient.fetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
    )
  }

  const put = async (endpoint: string, data: any) => {
    return withLoading(
      clientApiClient.fetch(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    )
  }

  const del = async (endpoint: string) => {
    return withLoading(
      clientApiClient.fetch(endpoint, {
        method: "DELETE",
      })
    )
  }

  return { fetch, post, patch, put, delete: del }
}

