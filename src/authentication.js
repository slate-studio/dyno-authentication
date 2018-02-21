'use strict'

const errors = require('./errors')
const KMS    = require('./kms')
const JWT    = require('jsonwebtoken');
const Operations = require('./operations')

class Authentication {
  constructor(token, req) {
    this.token = token
    this.req   = req
    this.jwt   = null

    this.publicKey         = req.app.get('publicKey')
    this.encryptionContext = req.app.get('encryptionContext')

    if (!this.token) {
      throw new errors.NoAuthenticationTokenError()
    }

    this.token = this.token.replace('Bearer ', '')
    this.type  = 'JWT'

    if (this.token.split('.').length < 3) {
      this.type = 'KMS'
    }
  }

  async verifyToken() {
    try {
      if (this.type == 'KMS') {
        this.req.authenticationTokenPayload =
          await KMS.verify(this.token, this.encryptionContext)

        this.req.authenticationTokenPayload.userId    = 'system'
        this.req.authenticationTokenPayload.sessionId = 'kms'

      } else {
        this.req.authenticationTokenPayload =
          JWT.verify(this.token, this.publicKey)

      }

    } catch (error) {
      throw new errors.BadAuthenticationTokenError(error)

    }
  }

  async verifyOperationId() {
    return

    // TODO: Change it to role based, pull roles specs from redis.
    const { roleIds } = this.req.authenticationTokenPayload

    const operationId       = this.req.swagger.operation.operationId
    const sourceOperationId = this.req.requestNamespace.get('sourceOperationId')

    Operations.verify(ops, sourceOperationId, operationId)

    // const operationIds = this.namespace.get('operationIds')
    // const dependencies = this.namespace.get('dependencies')

    // if (operationIds.indexOf(sourceOperationId) > -1) {
    //   return this._onError(new errors.OperationAccessDeniedError(operationId))
    // }

    // if (operationId != sourceOperationId) {
    //   const dependency = `${sourceOperationId}.${operationId}`

    //   if (dependencies.indexOf(dependency) > -1) {
    //     return this._onError(new errors.OperationAccessDeniedError(dependency))
    //   }
    // }
  }

  async verifySession() {
    return null
  }
}

module.exports = Authentication
