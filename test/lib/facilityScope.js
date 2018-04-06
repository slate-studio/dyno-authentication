'use strict'

const _      = require('lodash')
const config = require('@slatestudio/dyno/lib/config')
const facilityScope = require('../../src/facilityScope')

const scope = 'idnId:1;facilityId:1'
const req = {
  swagger: { operation: { operationId: 'readMyFacilityUser' } },
  authenticationTokenPayload: {
    facilities:  [
      {
        id:   '1',
        name: 'Demo Facility'
      },
      {
        id:   '3',
        name: 'Demo Facility #2'
      }
    ],
    permissions: [{
      facilityId: '1',
      roleIds:    [ 'staff' ]
    }]
  },
  requestNamespace: {
    get: name => 'readMyFacilityUser',
    set: name => name
  }
}

config.permissions = {
  staff: {
    operationIds: [ 'readMyFacilityUser' ],
    dependencies: [ 'readMyFacilityUser.indexUnits' ]
  }
}

describe('facilityScope:', () => {

  it('should verify facility and permissions in the authenticationToken payload', done => {
    facilityScope(req, {}, scope, done)
  })

  it('should return Forbidden no access to operation', done => {
    const errorReq = _.cloneDeep(req)
    errorReq.requestNamespace.get = name => 'indexUnits'

    facilityScope(errorReq, {}, scope, error => {
      expect(error.httpStatusCode).to.equal('Forbidden')
      done()
    })
  })

  it('should verify if user has access to operations dependency', done => {
    const successReq = _.cloneDeep(req)
    successReq.swagger = { operation: { operationId: 'indexUnits' } }

    facilityScope(successReq, {}, scope, done)
  })

  it('should return Forbidden no access to operations dependency', done => {
    const errorReq = _.cloneDeep(req)
    errorReq.swagger = { operation: { operationId: 'indexStaff' } }

    facilityScope(errorReq, {}, scope, error => {
      expect(error.httpStatusCode).to.equal('Forbidden')
      done()
    })
  })

  it('should return Unauthorized when scope is not specified', done => {
    facilityScope(req, {}, '', error => {
      expect(error.httpStatusCode).to.equal('Unauthorized')
      done()
    })
  })

  it('should return Unauthorized when idnId is missing', done => {
    facilityScope(req, {}, 'facilityId:1', error => {
      expect(error.httpStatusCode).to.equal('Unauthorized')
      done()
    })
  })

  it('should return Unauthorized when facilityId is missing', done => {
    facilityScope(req, {}, 'idnId:1', error => {
      expect(error.httpStatusCode).to.equal('Unauthorized')
      done()
    })
  })

  it('should return Unauthorized when facility is not in payload', done => {
    facilityScope(req, {}, 'idnId:1;facilityId:2', error => {
      expect(error.httpStatusCode).to.equal('Unauthorized')
      done()
    })
  })

  it('should return Unauthorized when no permissions in payload', done => {
    facilityScope(req, {}, 'idnId:1;facilityId:3', error => {
      expect(error.httpStatusCode).to.equal('Unauthorized')
      done()
    })
  })

})
