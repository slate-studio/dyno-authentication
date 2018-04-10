'use strict'

const _   = require('lodash')
const aws = require('aws-sdk')

class KMS {
  static async encrypt(payload, EncryptionContext, KeyId) {
    const payloadJson = JSON.stringify(payload)
    const Plaintext   = new Buffer(payloadJson).toString('base64')

    if (_.isEmpty(KeyId)) {
      log.warn('[kms] KeyId is empty, payload is not encrypted:', payload)

      const contextJson = JSON.stringify(EncryptionContext)
      const Context     = new Buffer(contextJson).toString('base64')

      return encodeURIComponent(`${Plaintext}.${Context}`)

    } else {
      const kms   = new aws.KMS()
      const token = await kms.encrypt({ Plaintext, EncryptionContext, KeyId })
      return token
    }
  }

  static async decrypt(CiphertextBlob, EncryptionContext) {
    let Plaintext, Context

    if (CiphertextBlob.split('.').length == 2) {
      [ Plaintext, Context ] = decodeURIComponent(CiphertextBlob).split('.')

      const contextJson = new Buffer(Context, 'base64').toString()
      const contextDecoded = JSON.parse(contextJson)

      if (!_.isEqual(contextDecoded, EncryptionContext)) {
        throw new Error('Invalid KMS context')
      }

    } else {
      const kms = new aws.KMS()
      Plaintext = await kms.decrypt({ CiphertextBlob, EncryptionContext }).Plaintext

    }

    const json    = new Buffer(Plaintext, 'base64').toString()
    const decoded = JSON.parse(json)

    return decoded
  }
}

module.exports = KMS
