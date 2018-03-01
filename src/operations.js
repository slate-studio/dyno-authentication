'use strict'

const errors = require('./errors')
const _ = require('lodash')

class Operations {
  constructor(sourceOperationIds, dependencies=[]) {
    this.hash = {
      src: [],
      dep: {}
    }

    this._hashSourceOperationIds(sourceOperationIds)
    this._hashDependencies(dependencies)
  }

  _hashSourceOperationIds(sourceOperationIds) {
    sourceOperationIds = _.uniq(sourceOperationIds)
    this.hash.src = _
      .chain(sourceOperationIds)
      .uniq()
      .map(oid => Operations.hash(oid))
      .value()
  }

  _hashDependencies(dependencies) {
  }

  static hash(str) {
    return str.split('').reduce(
      (prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0
    )
  }

  static verify(hash, sourceOperationId, operationId) {
    const sourceHash = this.hash(sourceOperationId)

    if (!_.includes(hash.src, sourceHash)) {
      throw new errors.OperationAccessDeniedError(sourceOperationId)
    }
  }

  // isOperationIdIncludedToHash(operationId, hashMap) {
  //   const convertedOperationId = this._hashCode(operationId)
  //   return (hashMap.indexOf(convertedOperationId) >= 0)
  // }

  // isOperationIdIncludedToDependencies(sourceOperationId, dependencyOperationId, operations, dependencies) {
  //   const convertedSourceOperationId     = this._hashCode(sourceOperationId)
  //   const convertedDependencyOperationId = this._hashCode(dependencyOperationId)

  //   if (!dependencies[convertedDependencyOperationId]) {
  //     return false
  //   }

  //   const operationKey = operations.indexOf(convertedSourceOperationId)

  //   const map = dependencies[convertedDependencyOperationId].split(',')
  //   if (map.indexOf(String(operationKey)) === -1) {
  //     return false
  //   }

  //   return true
  // }

  // _buildDependencies(operations, dependencies) {
  //   let dependencyOperations    = []
  //   const convertedDependencies = {}

  //   _.forEach(dependencies, dependency => {
  //     const [ sourceOperationId, dependencyOperationId ] = dependency.split('.')
  //     dependencyOperations.push(dependencyOperationId)
  //   })
  //   dependencyOperations  = _.uniq(dependencyOperations)
  //   const dependenciesMap = this._convertToHash(dependencyOperations)


  //   _.forEach(dependencies, dependency => {
  //     const [ sourceOperationId, dependencyOperationId ] = dependency.split('.')
  //     const convertedSourceOperationId     = this._hashCode(sourceOperationId)
  //     const convertedDependencyOperationId = this._hashCode(dependencyOperationId)

  //     const sourceOperationKey = operations.indexOf(convertedSourceOperationId)

  //     if (!convertedDependencies[convertedDependencyOperationId]) {
  //       convertedDependencies[convertedDependencyOperationId] = sourceOperationKey
  //     } else {
  //       convertedDependencies[convertedDependencyOperationId] += `,${sourceOperationKey}`
  //     }

  //   })

  //   return convertedDependencies
  // }

  // _convertToHash(operationsList) {
  //   const checkList       = {}
  //   const hashedOperations = _.map(operationsList, operation => {
  //     const hash = this._hashCode(operation)
  //     if (!checkList[hash]) {
  //       checkList[hash] = []
  //     }
  //     checkList[hash].push(operation)
  //     return hash
  //   })

  //   const duplicates = _.filter(hashedOperations, (value, index, iteratee) => {
  //     return _.includes(iteratee, value, index + 1)
  //   })

  //   if (duplicates.length) {
  //     const dump = _.map(duplicates, duplicate => {
  //       const dump      = {}
  //       dump[duplicate] = checkList[duplicate]

  //       return dump
  //     })

  //     throw new CollisionWasDetectedError(dump)
  //   }

  //   return hashedOperations
  // }
}

module.exports = Operations
