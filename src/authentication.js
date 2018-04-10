'use strict'

const JWT    = require('jsonwebtoken')
const KMS    = require('./kms')
const config = require('@slatestudio/dyno/lib/config')
const RequestError      = require('@slatestudio/dyno/lib/requestError')
const verifyPermissions = require('./verifyPermissions')

const KMS_USER_ID = 'kms'
const KMS_ROLE_ID = 'kms'

class Authentication {
  constructor(token, req) {
    this.token = token
    this.req   = req
    this.jwt   = null

    this.publicKey         = config.service.publicKey
    this.encryptionContext = config.service.encryptionContext

    if (!this.token) {
      throw new RequestError('No authentication token provided', 'Unauthorized')
    }

    this.token = this.token.replace('Bearer ', '')
    this.type  = 'JWT'

    if (this.token.split('.').length < 3) {
      this.type = 'KMS'
    }
  }

  async verifyToken() {
    if (this.type == 'KMS') {
      this.req.authenticationTokenPayload =
        await KMS.decrypt(this.token, this.encryptionContext)

      const { expiresAt } = this.req.authenticationTokenPayload
      const now = new Date()

      if (expiresAt < now) {
        const expiredError = new RequestError('Authentication token has expired', 'Unauthorized')
        expiredError.name  = 'ExpiredAuthenticationTokenError'

        throw expiredError
      }

      this.req.authenticationTokenPayload.roleIds = [ KMS_ROLE_ID ]

    } else {
      try {
        this.req.authenticationTokenPayload =
          JWT.verify(this.token, this.publicKey)

      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          const expiredError = new RequestError('Authentication token has expired', 'Unauthorized')
          expiredError.name  = 'ExpiredAuthenticationTokenError'
          throw expiredError
        }

        throw error
      }

    }

    log.debug({ authenticationTokenPayload: this.req.authenticationTokenPayload },
      'Authentication token is valid')
  }

  async verifySession() {
    const { sessionId, userId } = this.req.authenticationTokenPayload

    let isUsed

    if (userId == KMS_USER_ID) {
      isUsed = await redis.getAsync(`blacklist_sessionId_kms_${sessionId}`)
      await redis.setAsync(`blacklist_sessionId_${sessionId}`, true)

    } else {
      isUsed = await redis.getAsync(`blacklist_sessionId_${sessionId}`)

    }

    if (isUsed) {
      throw new RequestError('Session has been blacklisted', 'Unauthorized')
    }
  }

  async verifyPermissions() {
    const { roleIds } = this.req.authenticationTokenPayload

    if (roleIds) {
      await verifyPermissions(this.req, roleIds)
    }
  }
}

module.exports = Authentication
