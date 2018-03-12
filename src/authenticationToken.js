'use strict'

const Authentication = require('./authentication')

module.exports = async (req, spec, token, callback) => {
  try {
    const authentication = new Authentication(token, req)

    await authentication.verifyToken()
    await authentication.verifySession()
    await authentication.verifyPermissions()

  } catch(error) {
    log.debug(error)
    return callback(error)

  }

  return callback()
}
