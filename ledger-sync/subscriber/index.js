const _ = require('lodash')
const { Stream } = require('sawtooth-sdk/messaging/stream')
const {
  Message,
  EventList,
  EventSubscription,
  EventFilter,
  StateChangeList,
  ClientEventsSubscribeRequest,
  ClientEventsSubscribeResponse
} = require('sawtooth-sdk/protobuf')

const deltas = require('./deltas')
const config = require('../../config')

const PREFIX = config.PREFIX
const NULL_BLOCK_ID = '0000000000000000'
const VALIDATOR_URL = config.VALIDATOR_URL
const stream = new Stream(VALIDATOR_URL)




// Handle event message received by stream
const handleEvent = msg => {
    if (msg.messageType === Message.MessageType.CLIENT_EVENTS) {
      const events = EventList.decode(msg.content).events
      deltas.handle(getBlock(events), getChanges(events))
    } else {
      console.warn('Received message of unknown type:', msg.messageType)
    }
  }



const start = () => {
    return new Promise(resolve => {
      stream.connect(() => {
        stream.onReceive(handleEvent)
        subscribe().then(resolve)
      })
    })
  }
  
  module.exports = {
    start
  }
  
