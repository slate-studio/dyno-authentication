'use strict'

const crypto = require('crypto')

class BadAuthenticationTokenError extends Error {
  constructor() {
    super('Bad X-Authentication-Token value')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
  }
}

class InvalidAuthenticationTokenError extends Error {
  constructor() {
    super('Invalid X-Authentication-Token signature')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
  }
}

class InvalidSessionError extends Error {
  constructor(sessionRedisKey) {
    super('Session expired or deleted', sessionRedisKey)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Unauthorized'
    this.statusCode     = 401
  }
}

class OperationAccessDeniedError extends Error {
  constructor(operationId) {
    super('Access denied for', operationId)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Forbidden'
    this.statusCode     = 403
  }
}

class Authentication {
  constructor(authenticationToken, req) {
    this.authenticationToken = authenticationToken
    this.operationId         = req.swagger.operation.operationId
    this.session             = req.requestNamespace.get('session')
    this.sessionId           = req.requestNamespace.get('sessionId')
    this.sessionRedisKey     = `Session_${this.sessionId}`
    this.publicKey           = req.app.get('publicKey')
  }

  verifyAuthenticationToken() {
    const json   = new Buffer(this.authenticationToken, 'base64').toString()
    const object = JSON.parse(json)
    const { signature } = object

    delete object.signature

    const jsonObjectWithoutSignature = JSON.stringify(object)

    return crypto
      .createVerify('RSA-SHA256')
      .update(jsonObjectWithoutSignature)
      .verify(this.publicKey, signature, 'base64')
  }

  async verifyRedisSession() {
    const session = await redis.getAsync(this.sessionRedisKey)
    return (session !== null)
  }

  verifyOperationId() {
    return (this.session.operationIds.indexOf(this.operationId) >= 0)
  }

  async exec(callback) {
    let isAuthenticationTokenValid

    try {
      isAuthenticationTokenValid = this.verifyAuthenticationToken()

    } catch (error) {
      // log.debug('verifyAuthenticationToken error:', error)
      return callback(new BadAuthenticationTokenError())

    }

    if (!isAuthenticationTokenValid) {
      return callback(new InvalidAuthenticationTokenError())
    }

    if (!await this.verifyRedisSession()) {
      return callback(new InvalidSessionError(this.sessionRedisKey))
    }

    if (!this.verifyOperationId()) {
      return callback(new OperationAccessDeniedError(this.operationId))
    }

    return callback()
  }
}

module.exports = Authentication
