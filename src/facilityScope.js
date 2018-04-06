'use strict'

const qs = require('querystring')
const RequestError = require('@slatestudio/dyno/lib/requestError')
const verifyPermissions = require('./verifyPermissions')

module.exports = async(req, spec, scope, callback) => {
  if (!scope) {
    const error = new RequestError('No facility scope provided', 'Unauthorized')
    return callback(error)
  }

  const scopeObject = qs.parse(scope, ';', ':')

  const { idnId, facilityId }       = scopeObject
  const { facilities, permissions } = req.authenticationTokenPayload

  if (!idnId) {
    const error = new RequestError('Facility scope doesn\'t have idnId ' +
      'specified', 'Unauthorized')
    return callback(error)
  }

  if (!facilityId) {
    const error = new RequestError('Facility scope doesn\'t have facilityId ' +
     'specified', 'Unauthorized')
    return callback(error)
  }

  req.facility    = facilities.find(f => f.id === facilityId)
  req.permissions = permissions.find(p => p.facilityId === facilityId)

  if (!req.facility) {
    const error = new RequestError('Access denied for requested facility or ' +
      `bad facilityId: ${facilityId}`, 'Unauthorized')
    return callback(error)
  }

  if (!req.permissions) {
    const error = new RequestError('No permissions for requested facility: ' +
      facilityId, 'Unauthorized')
    return callback(error)
  }

  const { roleIds } = req.permissions

  try {
    await verifyPermissions(req, roleIds)

  } catch (error) {
    return callback(error)

  }

  req.requestNamespace.set('idnId', idnId)
  req.requestNamespace.set('facility', req.facility)
  req.requestNamespace.set('facilityId', facilityId)
  req.requestNamespace.set('facilityScope', scope)
  req.requestNamespace.set('permissions', req.permissions)
  req.requestNamespace.set('collectionNamePostfix', req.facility.collectionNamePostfix)

  return callback()
}
