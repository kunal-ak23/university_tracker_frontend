// Custom error class for session expiration
export class ApiError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(message: string, status: number, statusText: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

export class SessionExpiredError extends ApiError {
  constructor(message: string = 'Session expired. Please login again.') {
    super(message, 401, 'Unauthorized')
    this.name = 'SessionExpiredError'
  }
}

function deriveMessageFromRecord(record: Record<string, unknown>): string | null {
  const prioritizedKeys = ['detail', 'error', 'message']
  for (const key of prioritizedKeys) {
    const value = record[key]
    if (typeof value === 'string') {
      return value
    }
    if (Array.isArray(value) && value.length) {
      const first = value[0]
      if (typeof first === 'string') {
        return first
      }
    }
  }

  for (const value of Object.values(record)) {
    if (typeof value === 'string') {
      return value
    }
    if (Array.isArray(value) && value.length) {
      const first = value[0]
      if (typeof first === 'string') {
        return first
      }
      if (typeof first === 'object' && first !== null) {
        return JSON.stringify(first)
      }
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value)
    }
  }

  return null
}

function deriveMessageFromData(data: unknown): string | null {
  if (!data) {
    return null
  }

  if (typeof data === 'string') {
    return data
  }

  if (Array.isArray(data)) {
    const first = data[0]
    if (typeof first === 'string') {
      return first
    }
    if (typeof first === 'object' && first !== null) {
      return deriveMessageFromRecord(first as Record<string, unknown>)
    }
    return null
  }

  if (typeof data === 'object') {
    return deriveMessageFromRecord(data as Record<string, unknown>)
  }

  return null
}

export async function buildApiError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') || ''
  let parsedBody: unknown = null

  try {
    if (contentType.includes('application/json')) {
      parsedBody = await response.json()
    } else {
      const textBody = await response.text()
      parsedBody = textBody || null
    }
  } catch {
    parsedBody = null
  }

  const derivedMessage = deriveMessageFromData(parsedBody)
  const fallbackMessage = `Request failed with status ${response.status}`
  const message = derivedMessage || fallbackMessage

  return new ApiError(message, response.status, response.statusText, parsedBody ?? undefined)
}

