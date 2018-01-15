'use strict'

const _ = require('lodash')

class CollisionWasDetectedError extends Error {
  constructor(operations) {
    const json = JSON.stringify(operations)
    super(`Collision was detected during the converting of operations: ${json}`)

    this.name           = this.constructor.name
    this.httpStatusCode = 'Internal Server Error'
    this.statusCode     = 500
  }
}

class Operations {
  convertOperationIds({ operationIds, dependencies }) {
    const result        = { operationIds: [], dependencies: {} }
    const operations    = this._buildOperations(operationIds)
    result.operationIds = operations
    
    if (dependencies) {
      result.dependencies = this._buildDependencies(operations, dependencies)
    }

    return result
  }

  isOperationIdIncludedToHash(operationId, hashMap) {
    const convertedOperationId = this._hashCode(operationId)
    return _.includes(hashMap, convertedOperationId)
  }

  isOperationIdIncludedToDependencies(sourceOperationId, dependencyOperationId, operations, dependencies) {
    const convertedSourceOperationId     = this._hashCode(sourceOperationId)
    const convertedDependencyOperationId = this._hashCode(dependencyOperationId)

    if (!dependencies[convertedDependencyOperationId]) {
      return false
    }

    const operationKey = operations.indexOf(convertedSourceOperationId)

    const map = dependencies[convertedDependencyOperationId].split(',')
    if (map.indexOf(String(operationKey)) === -1) {
      return false
    }

    return true
  }

  _buildOperations(operationIds) {
    return this._convertToHash(operationIds)
  }

  _buildDependencies(operations, dependencies) {
    const convertedDependencies = {}

    _.forEach(_.uniq(dependencies), dependency => {
      const [ sourceOperationId, dependencyOperationId ] = dependency.split('.')
      const convertedSourceOperationId     = this._hashCode(sourceOperationId)
      const convertedDependencyOperationId = this._hashCode(dependencyOperationId)
      
      const sourceOperationKey = operations.indexOf(convertedSourceOperationId)
      
      if (!convertedDependencies[convertedDependencyOperationId]) {
        convertedDependencies[convertedDependencyOperationId] = String(sourceOperationKey)
      } else {
        convertedDependencies[convertedDependencyOperationId] += `,${sourceOperationKey}`
      }

    })

    return convertedDependencies
  }

  _convertToHash(operationsList) {
    const checkList       = {}
    const hashedOperations = _.map(operationsList, operation => {
      const hash = this._hashCode(operation)
      if (!checkList[hash]) {
        checkList[hash] = []
      }
      checkList[hash].push(operation)
      return hash
    })

    const duplicates = _.filter(hashedOperations, (value, index, iteratee) => {
      return _.includes(iteratee, value, index + 1)
    })

    if (duplicates.length) {
      const dump = _.map(duplicates, duplicate => {
        const dump      = {}
        dump[duplicate] = checkList[duplicate]

        return dump
      })

      throw new CollisionWasDetectedError(dump)
    }

    return hashedOperations
  }

  _hashCode(str) {
    return str.split('').reduce(
      (prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0
    )
  }
}

module.exports = Operations
