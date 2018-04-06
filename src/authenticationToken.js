'use strict'

const Authentication = require('./authentication')
const RequestError   = require('@slatestudio/dyno/lib/requestError')

module.exports = async(req, spec, token, callback) => {
  try {
    const authentication = new Authentication(token, req)

    await authentication.verifyToken()
    await authentication.verifySession()
    await authentication.verifyPermissions()

  } catch (originalError) {
    let error

    if (error.httpStatusCode) {
      error = originalError

    } else {
      error = new RequestError('Bad authentication token', 'Unauthorized', originalError)

    }

    return callback(error)

  }

  return callback()
}
