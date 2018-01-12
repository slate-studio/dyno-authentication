'use strict'

const crypto         = require('crypto')
const Authentication = require('../lib').Authentication

const idnId      = '1'
const facilityId = '1'

const privateKey = '-----BEGIN RSA PRIVATE KEY-----\n\
MIICXQIBAAKBgQDQbjNNL833UGW8U7OPPj+km3Fyh4rQeA99sXSAFgHlKph1XJjj\n\
FRhoZn1ONQSSNAMRWss6EDk4VaNTS8wVxY72K7f2KykUj3bMOB0aK+F9yzdy17ME\n\
YLurfgTyHSEPDkQzKMERSMGt4rtQNnIdqyjn1vf4Xw5rUvf05A95h4wimQIDAQAB\n\
AoGAF4ZoqeycXa6oXPJBkQhgnI6i5l9gDpmOfgxabt6NBjWhkZWK+A54e8gdmocn\n\
Ze0S75GE4J/WJYKc9ZjXhxmOQgx3tCbIWKrhbyNvU6/0uRAaHqp36SubXD79h20v\n\
oS1yNn1ggUeNGc730NRVPc3iEFdaGhnUWPG8615p3dzPVwECQQD3KPwcR/0xi8Oj\n\
Bn+f1ER+cLIdb42Ulgnt/D93GkJEIlw14pIs0QAEJZnInVodn7IB4uW4wbdpwr1V\n\
JLXL1AT5AkEA1+KauqjEeKrDwBc48OMR4wGPmPwUNtO3szRBdB51rVMFTclCOwpG\n\
8OfhaGUldNR57YArvkST3ETbPtvxSheSoQJAXzEI0Hele6Shx7MkClG9w5jx8MZb\n\
GCQlVOR3KQ8TAJzfON23gM1KHU7CCPMZlxk/fNx/r4XkdzZKp3VJE2ToOQJBAKlm\n\
HaW0Qh6xWFLFph+W/fUTx3ry6mWvMelDaszUDeDIUVQdRYQQZ2Qnf78sBv0qsNYF\n\
Cc4N/7wKp8MmUKqj3qECQQCIwab/LwhB+YErAsmCXw8QnGEYNO9X/A3hSWd3HH4H\n\
gHPWTgTv8fX04ecJPuEKEQ3XpWoakkTlbVGQyfMO5Q2L\n\
-----END RSA PRIVATE KEY-----'

const publicKey  = '-----BEGIN PUBLIC KEY-----\n\
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQbjNNL833UGW8U7OPPj+km3Fy\n\
h4rQeA99sXSAFgHlKph1XJjjFRhoZn1ONQSSNAMRWss6EDk4VaNTS8wVxY72K7f2\n\
KykUj3bMOB0aK+F9yzdy17MEYLurfgTyHSEPDkQzKMERSMGt4rtQNnIdqyjn1vf4\n\
Xw5rUvf05A95h4wimQIDAQAB\n\
-----END PUBLIC KEY-----'

const buildAuthenticationToken = ({ idnId, facilityId, session }) => {
  const sessionId = String(session.integerId)
  const { createdAt, userId, roleId } = session

  const object = {
    idnId,
    facilityId,
    sessionId,
    userId,
    roleId,
    session,
    createdAt
  }

  const objectJson = JSON.stringify(object)

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(objectJson)
    .sign(privateKey, 'base64')

  object.signature = signature

  const objectWithSignatureJson = JSON.stringify(object)
  return new Buffer(objectWithSignatureJson).toString('base64')
}

const buildSession = (sessionId, operationIds, dependencies) => {
  return {
    integerId: parseInt(sessionId),
    userId:    '1',
    roleId:    '1',
    operationIds,
    dependencies,
    createdAt: new Date()
  }
}

const buildRequest = (sessionId, session, operationId, sourceOperationId) => {
  // const requestNamespace = new RequestNamespace({ sessionId, session })
  const requestNamespace = {
    get: key => {
      const namespace = { sessionId, session, sourceOperationId }
      return namespace[key] || null
    }
  }
  const request = {
    swagger: { operation: { operationId } },
    requestNamespace,
    app:     { get: () => publicKey }
  }

  return request
}

const addSessionToRedis = (sessionId, session) => {
  const sessionKey  = `Session_${sessionId}`
  const sessionJson = JSON.stringify(session)
  return redis.setAsync(sessionKey, sessionJson)
}

describe('Authentication:', () => {

  it('should return true if authorized', done => {
    const sessionId = '100'
    const session   = buildSession(sessionId, [ 3056 ], [])

    const authenticationToken = buildAuthenticationToken({
      idnId, facilityId, session
    })

    const req = buildRequest(sessionId, session, 'a1', 'a1')

    addSessionToRedis(sessionId, session)
      .then(() => {
        const authentication = new Authentication(authenticationToken, req)
        authentication.exec(error => {
          expect(error).to.equal(undefined)
          done()
        })
      })
  })

  it('should return true if authorized (with dependencies)', done => {
    const sessionId = '100'
    const session   = buildSession(sessionId, [ 3056 ], { '3087': '0' })

    const authenticationToken = buildAuthenticationToken({
      idnId, facilityId, session
    })

    const req = buildRequest(sessionId, session, 'b1', 'a1')

    addSessionToRedis(sessionId, session)
      .then(() => {
        const authentication = new Authentication(authenticationToken, req)
        authentication.exec(error => {
          expect(error).to.equal(undefined)
          done()
        })
      })
  })

  it('should return OperationAccessDeniedError', done => {
    const sessionId = '100'
    const session   = buildSession(sessionId, [ 3057 ], [])

    const authenticationToken = buildAuthenticationToken({
      idnId, facilityId, session
    })

    const req = buildRequest(sessionId, session, 'a1', 'a1')

    addSessionToRedis(sessionId, session)
      .then(() => {
        const authentication = new Authentication(authenticationToken, req)
        authentication.exec(error => {
          expect(error.name).to.equal('OperationAccessDeniedError')
          done()
        })
      })
  })

  it('should return InvalidAuthenticationTokenError', done => {
    const sessionId = '1000'
    const session   = buildSession(sessionId, [ 3056 ], [])

    const signature           = 'wrong_signature'
    const json                = JSON.stringify({ signature })
    const authenticationToken = new Buffer(json).toString('base64')

    const req = buildRequest(sessionId, session, 'a1', 'a1')

    const authentication = new Authentication(authenticationToken, req)
    authentication.exec(error => {
      expect(error.name).to.equal('InvalidAuthenticationTokenError')
      done()
    })
  })


  it('should return BadAuthenticationTokenError', done => {
    const sessionId           = '1000'
    const session             = buildSession(sessionId, [ 3056 ], [])
    const authenticationToken = 'SOME_RANDOM_VALUE'

    const req = buildRequest(sessionId, session, 'a1', 'a1')

    const authentication = new Authentication(authenticationToken, req)
    authentication.exec(error => {
      expect(error.name).to.equal('BadAuthenticationTokenError')
      done()
    })
  })

  it('should return InvalidSessionError', done => {
    const sessionId = '1000'
    const session   = buildSession(sessionId, [ 3056 ], [])

    const authenticationToken = buildAuthenticationToken({
      idnId, facilityId, session
    })

    const req = buildRequest(sessionId, session, 'a1', 'a1')

    const authentication = new Authentication(authenticationToken, req)
    authentication.exec(error => {
      expect(error.name).to.equal('InvalidSessionError')
      done()
    })
  })

  it('should return OperationAccessDeniedError', done => {
    const sessionId = '100'
    const session   = buildSession(sessionId, [ 3056 ], [])

    const authenticationToken = buildAuthenticationToken({
      idnId, facilityId, session
    })

    const req = buildRequest(sessionId, session, 'a2', 'a1')

    addSessionToRedis(sessionId, session)
      .then(() => {
        const authentication = new Authentication(authenticationToken, req)
        authentication.exec(error => {
          expect(error.name).to.equal('OperationAccessDeniedError')
          done()
        })
      })
  })

})
