'use strict'

const Operations = require('../lib').Operations
'use strict'

describe('Operations:', () => {

  it('should convert operations and dependencies', done => {
    const operationIds = [ 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'b3' ]
    const dependencies = [
      'a1.b1', 'a1.b2', 'a2.b2', 'a3.b1', 'a3.b3', 'a6.b1',
      'a6.b2', 'a6.b3', 'a6.b4', 'b3.a1', 'b3.a3', 'b3.a5',
      'a1.b1',
    ]
    const operations   = new Operations()
    const converted    = operations.convertOperationIds({ operationIds, dependencies })

    expect(JSON.stringify(converted.operationIds))
      .to.equal(JSON.stringify([3056,3057,3058,3059,3060,3061,3089]))
    
    expect(JSON.stringify(converted.dependencies))
      .to.equal(JSON.stringify({'3056':'6','3058':'6','3060':'6','3087':'0,2,5','3088':'0,1,5','3089':'2,5','3090':'5',}))

    done()
  })

  it('should convert operations', done => {
    const operationIds = [ 'a1', 'a2', 'a3', 'a4', 'a5', 'a6' ]
    const operations   = new Operations()
    const converted    = operations.convertOperationIds({ operationIds })

    expect(JSON.stringify(converted.operationIds))
      .to.equal(JSON.stringify([3056,3057,3058,3059,3060,3061]))

    done()
  })

  it('isOperationIdIncludedToHash should return true', done => {
    const operationIds = [ 3056, 3057, 3058, 3059, 3060, 3061]
    const operations   = new Operations()

    const result = operations.isOperationIdIncludedToHash('a3', operationIds)

    expect(result).to.equal(true)

    done()
  })

  it('isOperationIdIncludedToHash should return false', done => {
    const operationIds = [ 3056, 3057, 3058, 3059, 3060, 3061]
    const operations   = new Operations()

    const result = operations.isOperationIdIncludedToHash('a7', operationIds)

    expect(result).to.equal(false)

    done()
  })

  it('isOperationIdIncludedToDependencies should return true', done => {
    const operationIds = [ 3056, 3057, 3058, 3059, 3060, 3061]
    const dependencies = { '3087': '0,2,5', '3088': '0,1,5', '3089': '2,5', '3090':'5' }
    const operations   = new Operations()

    const result = operations.isOperationIdIncludedToDependencies('a1', 'b2', operationIds, dependencies)

    expect(result).to.equal(true)

    done()
  })

  it('isOperationIdIncludedToDependencies should return false', done => {
    const operationIds = [ 3056, 3057, 3058, 3059, 3060, 3061]
    const dependencies = { '3087': '0,2,5', '3088': '0,1,5', '3089': '2,5', '3090':'5' }
    const operations   = new Operations()

    const result = operations.isOperationIdIncludedToDependencies('a1', 'b20', operationIds, dependencies)

    expect(result).to.equal(false)

    done()
  })

  it('isOperationIdIncludedToDependencies should return false', done => {
    const operationIds = [ 3056, 3057, 3058, 3059, 3060, 3061]
    const dependencies = { '3087': '0,2,5', '3088': '0,1,5', '3089': '2,5', '3090':'5' }
    const operations   = new Operations()

    const result = operations.isOperationIdIncludedToDependencies('a10', 'b2', operationIds, dependencies)

    expect(result).to.equal(false)

    done()
  })

})
