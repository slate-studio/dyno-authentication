'use strict'

class NoAuthenticationTokenError extends Error {
  constructor() {
    super('No authentication token')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
  }
}

class BadAuthenticationTokenError extends Error {
  constructor(error) {
    super('Bad authentication token')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.originalError  = error
    this.statusCode     = 401
  }
}

class InvalidSessionError extends Error {
  constructor() {
    super('Invalid session')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
  }
}

class OperationAccessDeniedError extends Error {
  constructor(operationId) {
    super(`Operation access denied for: ${operationId}`)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Forbidden'
    this.statusCode     = 403
  }
}

module.exports = {
  NoAuthenticationTokenError,
  InvalidSessionError,
  BadAuthenticationTokenError,
  OperationAccessDeniedError
}
