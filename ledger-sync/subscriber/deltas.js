'use strict'

const _ = require('lodash')
const blocks = require('../db/blocks')
const index = require('../db/index')
//const state = require('../db/state')
//const protos = require('../protos/sofochain.proto')
var syncQueue = require('../../app/sync-queue.js')
syncQueue = new syncQueue()
var mysql   = require('mysql');
var config  = require('../../config.json')
let connection ;


   



// const deltaQueue = {
//     _queue: [],
//     _running: false,
//     _previousFunction : "",
  
//     add (promisedFn) {
//       this._queue.push(promisedFn)
//       this._runUntilEmpty()
//     },
  
//     _runUntilEmpty () {
//       if (this._running) return
//       this._running = true
//       this._runNext()
//     },
  
//     _runNext () {
//       if (this._queue.length === 0) {
//         this._running = false
//       } else {
//         const current = this._queue.shift()
//         return current().then(() => this._runNext())
//       }
//     },
//     _runPrevious () {

//     }

//   }






const handle = (block, changes) => {
    

       
          //  syncQueue.place(
          //   function(){

          //       //console.log(syncQueue)
          //      // console.log(block)
          //         var query = mysql.format("INSERT INTO blocks  set ? ",[block])
          //         if((block.blockNum) == 14 ){
          //           query = mysql.format("INSERT INTO blocks  set ? ",[block])
          //         }
                 
          //         index.queryTable(query).then(insertMessage=>{
                  
          //             console.log("insertMessage",insertMessage)
                   
                    
          //             if(insertMessage.success){
          //             //  console.log("here in 1")
          //                 syncQueue.next()
          //             }
          //         }).catch((e)=>{
          //         setTimeout(()=>{
                              
          //           console.log("LOGGING")
          //           syncQueue.loadPrevious()
          //           syncQueue.next()
          //       },1000)
                
          //       })
          //     }
          //  )
          blocks.insertWithQueue(block);
      
    //   const [ pageChanges, otherChanges ] = _.partition(changes, change => {
    //     return getProtoName(change.address) === 'PropertyPage'
    //   })
  
    //   return Promise.all(otherChanges.map(entryAdder(block)))
    //     .then(() => {
    //       // If there are page changes, give other changes a chance to propagate
    //       const wait = pageChanges.length === 0 ? 0 : 100
    //       return new Promise(resolve => setTimeout(resolve, wait))
    //     })
    //     .then(() =>  Promise.all(pageChanges.map(entryAdder(block))))
    //     .then(() => blocks.insert(block))
    
  
  }
  
  module.exports = {
    handle
  }
  

