'use strict'

const JWT    = require('jsonwebtoken')
const KMS    = require('./kms')
const config = require('@slatestudio/dyno/lib/config')
const errors = require('./errors')
const verifyPermissions = require('./verifyPermissions')

class Authentication {
  constructor(token, req) {
    this.token = token
    this.req   = req
    this.jwt   = null

    this.publicKey         = config.service.publicKey
    this.encryptionContext = config.service.encryptionContext

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
          await KMS.decrypt(this.token, this.encryptionContext)

        this.req.authenticationTokenPayload.userId    = 'kms'
        this.req.authenticationTokenPayload.roleIds   = [ 'kms' ]
        this.req.authenticationTokenPayload.sessionId = 'system'

      } else {
        this.req.authenticationTokenPayload =
          JWT.verify(this.token, this.publicKey)

      }

    } catch (error) {
      log.debug(error)
      throw new errors.BadAuthenticationTokenError(error)

    }
  }

  async verifySession() {
    return null
  }

  async verifyPermissions() {
    const { roleIds } = this.req.authenticationTokenPayload

    if (roleIds) {
      await verifyPermissions(this.req, roleIds)
    }
  }
}

module.exports = Authentication
