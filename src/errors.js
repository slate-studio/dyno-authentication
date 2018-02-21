'use strict'

class NoAuthenticationTokenError extends Error {
  constructor() {
    super('No authentication token provided')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
  }
}

class BadAuthenticationTokenError extends Error {
  constructor(error) {
    super(`Authentication token error: ${error}`)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
    this.error          = error
  }
}

class OperationAccessDeniedError extends Error {
  constructor(operationId) {
    super(`Access denied for operation: ${operationId}`)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Forbidden'
    this.statusCode     = 403
  }
}

class OperationHashCollisionError extends Error {
  constructor(operationIds) {
    super(`Operation hash collision error: ${operationIds}`)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Internal Server Error'
    this.statusCode     = 500
    this.operationIds   = operationIds
  }
}

module.exports = {
  NoAuthenticationTokenError,
  BadAuthenticationTokenError,
  OperationAccessDeniedError,
  OperationHashCollisionError
}
