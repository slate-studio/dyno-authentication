'use strict'

const errors = require('./errors')
const config = require('@slatestudio/dyno/lib/config')

module.exports = async (req, roleIds) => {
  const { permissions }   = config
  const operationId       = req.swagger.operation.operationId
  const sourceOperationId = req.requestNamespace.get('sourceOperationId')

  let operationIds = []
  let dependencies = []

  for (const roleId of roleIds) {
    operationIds = operationIds.concat(permissions[roleId].operationIds)
    dependencies = dependencies.concat(permissions[roleId].dependencies)
  }

  if (operationIds.indexOf(sourceOperationId) < 0) {
    throw new errors.OperationAccessDeniedError(operationId)
  }

  if (operationId != sourceOperationId) {
    const dependency = `${sourceOperationId}.${operationId}`

    if (dependencies.indexOf(dependency) < 0) {
      throw new errors.OperationAccessDeniedError(dependency)
    }
  }
}
