'use strict'

const _  = require('lodash')
const qs = require('querystring')

module.exports = async (req, spec, scope, callback) => {
  try {
    const scopeObject = qs.parse(scope, ';', ':')

    const { idnId, facilityId } = scopeObject
    const { facilities } = req.authenticationTokenPayload
    const integerId = Number(facilityId)
    const facility  = _.find(facilities, { idnId, integerId })

    if (!facility) {
      throw Error('Bad facility scope')
    }

    req.requestNamespace.set('idnId', idnId)
    req.requestNamespace.set('facilityId', facilityId)
    req.requestNamespace.set('facilityScope', scope)

  } catch (error) {
    return callback(error)

  }

  return callback()
}