'use strict'

const errors     = require('./errors')
const JWT        = require('./jwt')
const Operations = require('./operations')

class Authentication {
  constructor(token, req) {
    this.token     = token
    this.namespace = req.requestNamespace
    this.jwt       = null
    this.callback  = null
    this.isSuccess = true
    this.req       = req
  }

  _verifyToken() {
    if (!this.token) {
      throw new errors.NoAuthenticationTokenError()
    }

    try {
      this.token = this.token.replace('Bearer ', '')
      this.jwt = new JWT(this.token)

    } catch (error) {
      throw new errors.BadAuthenticationTokenError(error)

    }
  }

  _verifyOperationId() {
    const { ops }           = this.jwt.header
    const operationId       = this.req.swagger.operation.operationId
    const sourceOperationId = this.namespace.get('sourceOperationId')

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

  _verifySession() {
    return null
  }

  exec(callback) {
    try {
      this._verifyToken()
      this._verifyOperationId()
      this._verifySession()

    } catch(error) {
      return callback(error)

    }

    return callback()
  }
}

module.exports = Authentication
