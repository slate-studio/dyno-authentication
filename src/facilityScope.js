'use strict'

const _  = require('lodash')
const qs = require('querystring')
const verifyPermissions = require('./verifyPermissions')

module.exports = async (req, spec, scope, callback) => {
  try {
    const scopeObject = qs.parse(scope, ';', ':')

    const { idnId, facilityId }       = scopeObject
    const { facilities, permissions } = req.authenticationTokenPayload

    const integerId = Number(facilityId)
    req.facility    = _.find(facilities, { idnId, integerId })

    if (!req.facility) {
      throw Error('Bad facility scope')
    }

    req.permissions   = _.find(permissions, { facilityId })
    const { roleIds } = req.permissions

    await verifyPermissions(req, roleIds)

    req.requestNamespace.set('idnId', idnId)
    req.requestNamespace.set('facilityId', facilityId)
    req.requestNamespace.set('facilityScope', scope)

  } catch (error) {
    return callback(error)

  }

  return callback()
}
