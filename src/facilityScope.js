'use strict'

const qs = require('querystring')
const verifyPermissions = require('./verifyPermissions')
const RequestError = require('@slatestudio/dyno/lib/requestError')

module.exports = async(req, spec, scope, callback) => {
  try {
    const scopeObject = qs.parse(scope, ';', ':')

    const { idnId, facilityId }       = scopeObject
    const { facilities, permissions } = req.authenticationTokenPayload

    req.facility = facilities.find(f => f.id === facilityId)

    if (!req.facility) {
      throw Error('No permissions for requested facility or bad facility ID', facilityId)
    }

    req.permissions   = permissions.find(p => p.facilityId === facilityId)
    const { roleIds } = req.permissions

    await verifyPermissions(req, roleIds)

    req.requestNamespace.set('idnId', idnId)
    req.requestNamespace.set('facility', req.facility)
    req.requestNamespace.set('facilityId', facilityId)
    req.requestNamespace.set('facilityScope', scope)
    req.requestNamespace.set('permissions', req.permissions)
    req.requestNamespace.set('collectionNamePostfix', req.facility.collectionNamePostfix)

  } catch (originalError) {
    const error = new RequestError('Bad facility scope', 'Unauthorized', originalError)

    log.debug(error)
    return callback(error)

  }

  return callback()
}
