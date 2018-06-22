'use strict'

const db = require('./db')
const subscriber = require('./subscriber')
// const protos = require('./subscriber/protos')

Promise.all([
  db.connect()
])
  .then(subscriber.start)
  .catch(err => console.error(err.message))