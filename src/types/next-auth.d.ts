import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    id?: string
    first_name?: string
    last_name?: string
    username?: string
    is_superuser?: boolean
    is_staff?: boolean
    is_active?: boolean
    accessToken?: string
    refreshToken?: string
  }

  interface Session {
    accessToken?: string
    refreshToken?: string
  }
} 