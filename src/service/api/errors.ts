// Custom error class for session expiration
export class SessionExpiredError extends Error {
  constructor(message: string = 'Session expired. Please login again.') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}

