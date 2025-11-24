/* eslint-disable @typescript-eslint/ban-ts-comment */
import CredentialsProvider from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const REFRESH_MARGIN_MS = 60 * 1000
const DEFAULT_TOKEN_LIFETIME_MS = 55 * 60 * 1000

function decodeAccessTokenExpiry(accessToken: string): number {
  try {
    const [, payload] = accessToken.split(".")
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))
    if (decoded?.exp) {
      return decoded.exp * 1000
    }
  } catch (error) {
    console.warn("Failed to decode access token expiry", error)
  }
  return Date.now() + DEFAULT_TOKEN_LIFETIME_MS
}

function extractErrorMessage(data: any): string | undefined {
  if (!data) {
    return undefined
  }
  if (typeof data === "string") {
    return data
  }
  return data.detail || data.error || data.message
}

async function refreshAccessToken(token: JWT & { refreshToken?: string | null }) {
  if (!token.refreshToken) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: token.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const refreshedTokens = await response.json()
    const newAccessToken = refreshedTokens.access
    const accessTokenExpires = decodeAccessTokenExpiry(newAccessToken)

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: refreshedTokens.refresh ?? token.refreshToken,
      accessTokenExpires,
      error: undefined,
    }
  } catch (error) {
    console.error("Refresh token error:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(extractErrorMessage(data) || "Authentication failed")
          }

          if (!data.access || !data.user) {
            throw new Error("No access token received")
          }

          return {
            id: data.user.id,
            name: `${data.user.first_name} ${data.user.last_name}`.trim() || data.user.email,
            email: data.user.email,
            role: data.role,
            accessToken: data.access,
            refreshToken: data.refresh,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            username: data.user.username,
            is_superuser: data.user.is_superuser,
            is_staff: data.user.is_staff,
            is_active: data.user.is_active,
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw new Error(error instanceof Error ? error.message : "Authentication failed")
        }
      },
    }),
  ],
  callbacks: {
    // @ts-ignore
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          name: user.name,
          username: user.username,
          is_superuser: user.is_superuser,
          is_staff: user.is_staff,
          is_active: user.is_active,
          accessTokenExpires: decodeAccessTokenExpiry(user.accessToken),
          error: undefined,
        }
      }

      const accessTokenExpires = typeof token.accessTokenExpires === "number" ? token.accessTokenExpires : 0
      const shouldRefresh = Date.now() + REFRESH_MARGIN_MS >= accessTokenExpires

      if (!shouldRefresh) {
        return token
      }

      return refreshAccessToken(token)
    },
    // @ts-ignore
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.error = token.error
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        first_name: token.first_name,
        last_name: token.last_name,
        name: token.name,
        email: token.email,
        username: token.username,
        is_superuser: token.is_superuser,
        is_staff: token.is_staff,
        is_active: token.is_active,
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
}