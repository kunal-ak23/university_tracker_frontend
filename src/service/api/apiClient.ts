/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { getSession, signOut } from "next-auth/react";
import { interceptFetch } from "./interceptor";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    
    // @ts-ignore
    if (!session?.accessToken) {
      throw new Error('No access token found. Please login again.')
    }

    const headers = {
      "Content-Type": "application/json",
      // @ts-ignore
      Authorization: `Bearer ${session.accessToken}`,
      ...options.headers,
    };

    let response = await interceptFetch(
      fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })
    );

    // If token expired, try to refresh
    // @ts-ignore
    if (response.status === 401 && session.refreshToken) {
      try {
        // Call refresh token endpoint directly
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // @ts-ignore
            refresh: session.refreshToken
          })
        })

        if (!refreshResponse.ok) {
          // Clear session and redirect to login
          await signOut({ redirect: true, callbackUrl: '/login?error=session_expired' })
          // Return early to prevent further execution
          return Promise.reject(new Error('Refresh token expired. Please login again.'))
        }

        const { access: newAccessToken } = await refreshResponse.json()
        
        // Retry original request with new token
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
        // If refresh failed, clear session and redirect
        await signOut({ redirect: true, callbackUrl: '/login?error=session_expired' })
        return Promise.reject(error)
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
    });
  },

  async getUserProfile() {
    return this.fetch("/auth/me/");
  },
}; 