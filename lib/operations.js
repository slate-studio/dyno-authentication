'use strict'

const _ = require('lodash')

class CollisionWasDetectedError extends Error {
  constructor() {
    super('Collision was detected during the converting of operations')

    this.name           = this.constructor.name
    this.httpStatusCode = 'Internal Server Error'
    this.statusCode     = 500
  }
}

class Operations {
  constructor(operations) {
    this.operations = operations
    this._convert()
  }

  _convert() {
    if (!_.isArray(this.operations)) {
      this.hashedOperations = this._hashCode(this.operations)
      return
    }

    const checkList       = {}
    this.hashedOperations = _.map(this.operations, operation => {
      const hash = this._hashCode(operation)
      if (!checkList[hash]) {
        checkList[hash] = []
      }
      checkList[hash].push(operation)
      return hash
    })

    const duplicates = _.filter(this.hashedOperations, (value, index, iteratee) => {
      return _.includes(iteratee, value, index + 1)
    })

    if (duplicates) {
      const dump = _.map(duplicates, duplicate => {
        const dump      = {}
        dump[duplicate] = checkList[duplicate]

        return dump
      })

      throw new CollisionWasDetectedError(dump)
    }
  }

  _hashCode(str) {
    return str.split('').reduce(
      (prevHash, currVal) => ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0
    )
  }
}

module.exports = Operations
