'use strict'

const crypto = require('crypto')

class JWT {
  constructor(token) {
    const [ headerBase64, payloadBase64, signature, publicKeyCompact ] = token.split('.')

    const verify    = crypto.createVerify('RSA-SHA256')
    const message   = `${headerBase64}.${payloadBase64}`
    const publicKey = JWT.publicKeyRestore(publicKeyCompact)

    this.isValid = verify.update(message).verify(publicKey, signature, 'base64')
    this.header  = JWT.base64Decode(headerBase64)
    this.payload = JWT.base64Decode(payloadBase64)
  }

  static generate(header, payload, secretKey, publicKey) {
    // NOTE: Possible header options:
    //       https://tools.ietf.org/html/rfc7519#section-4.1
    header = Object.assign({
      alg: 'RSA-SHA256',
      typ: 'JWT'
    }, header)

    const headerBase64     = this.base64Encode(header)
    const payloadBase64    = this.base64Encode(payload)
    const publicKeyCompact = this.publicKeyCompact(publicKey)

    const sign      = crypto.createSign('RSA-SHA256')
    const message   = `${headerBase64}.${payloadBase64}`
    const signature = sign.update(message).sign(secretKey, 'base64')

    return `${message}.${signature}.${publicKeyCompact}`
  }

  static publicKeyCompact(value) {
    return value.split("\n").slice(1, -1).join(',')
  }

  static publicKeyRestore(value) {
    return [ '-----BEGIN PUBLIC KEY-----'].
      concat(value.split(',')).
      concat('-----END PUBLIC KEY-----').
      join("\n")
  }

  static base64Encode(value) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }

    return new Buffer(value).toString('base64')
  }

  static base64Decode(base64) {
    const json = new Buffer(base64, 'base64').toString()
    return JSON.parse(json)
  }
}

module.exports = JWT
