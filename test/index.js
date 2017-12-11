'use strict'

const bluebird = require('bluebird')
const redis    = require('redis')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

before(go => {
  const client = redis.createClient({ host: '127.0.0.1', port: 6379 })

  client.on('ready', () => {
    global.redis = client
    go()
  })
})

require('./authentication')
