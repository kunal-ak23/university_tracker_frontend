"use client"

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getSession } from "next-auth/react"
import { useLoading } from "@/hooks/use-loading"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

class ClientAPIClient {
  private async getHeaders() {
    const session = await getSession()
    return {
      "Content-Type": "application/json",
      // @ts-ignore
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
    }
  }

  async fetch(endpoint: string, options: RequestInit = {}) {
    // Get loading context from hook - but we need to call this from component
    // So we'll create a wrapper that components can use
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
      throw new Error(`API error: ${response.statusText}`)
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

