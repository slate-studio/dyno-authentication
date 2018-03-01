'use strict'

const Authentication = require('./authentication')

module.exports = async (req, spec, token, callback) => {
  try {
    const authentication = new Authentication(token, req)

    await authentication.verifyToken()
    await authentication.verifyOperationId()
    await authentication.verifySession()

  } catch(error) {
    return callback(error)

  }

  return callback()
}
