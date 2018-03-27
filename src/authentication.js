'use strict'

const JWT    = require('jsonwebtoken')
const KMS    = require('./kms')
const config = require('@slatestudio/dyno/lib/config')
const errors = require('./errors')
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

        const { expiresAt } = this.req.authenticationTokenPayload
        const now = new Date()

        if (expiresAt < now) {
          throw new ExpiredAuthenticationTokenError()
        }

        this.req.authenticationTokenPayload.roleIds = [ KMS_ROLE_ID ]

      } else {
        this.req.authenticationTokenPayload =
          JWT.verify(this.token, this.publicKey)

      }
    } catch (error) {
      log.debug(error)
      throw new errors.BadAuthenticationTokenError(error)

    }

    log.debug({ authenticationTokenPayload: this.req.authenticationTokenPayload })
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
      throw new errors.InvalidSessionError()
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
