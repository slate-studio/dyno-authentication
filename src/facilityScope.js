'use strict'

const qs = require('querystring')
const verifyPermissions = require('./verifyPermissions')

module.exports = async (req, spec, scope, callback) => {
  try {
    const scopeObject = qs.parse(scope, ';', ':')

    const { idnId, facilityId }       = scopeObject
    const { facilities, permissions } = req.authenticationTokenPayload

    const integerId = Number(facilityId)
    if (isNaN(integerId)) {
      req.facility = facilities.find(f => f._integerId === integerId)

    } else {
      req.facility = facilities.find(f => f.id === facilityId)

    }

    if (!req.facility) {
      throw Error('Bad facility scope')
    }

    req.permissions   = permissions.find(p => p.facilityId === facilityId)
    const { roleIds } = req.permissions

    await verifyPermissions(req, roleIds)

    req.requestNamespace.set('idnId', idnId)
    req.requestNamespace.set('facilityId', facilityId)
    req.requestNamespace.set('facilityScope', scope)
    req.requestNamespace.set('facility', req.facility)
    req.requestNamespace.set('permissions', req.permissions)

  } catch (error) {
    log.debug(error)
    return callback(error)

  }

  return callback()
}
