var mysql = require('mysql');
const db = require('./')
var config = require("../../config.json")
var rp = require('request-promise');
var syncQueue = require('../../app/sync-queue.js')
syncQueue = new syncQueue()

// var stateTables = [
//     "Product",
//     "Sku",
//     "Batch",
//     "Unit",
//     "Package",
//     "Location",
//     "Account",
//     "Scheme",
//     "Sla",
//     "IOTDataFeed",
//     "GoodsTX"
// ]


var stateTables = []

const resolveFork = async (block) => {
    var promise = new Promise(function(resolve,reject){
    var promises = []
    var query = "DELETE FROM blocks WHERE blockNum >= " + block.blockNum
    return db.modifyTable(query).then(deleteMessage => { // deleting from the block table all the rows with blovk number >= current block
        if (deleteMessage.success) {
            //query = "INSERT INTO blocks (blockId, blockNum, stateRootHash) VALUES ("+block.blockId+","+block.blockNum+","+block.stateRootHash+")"
            query = mysql.format("INSERT INTO blocks  set ? ", [block])
            return db.modifyTable(query).then(async insertMessage => {
                console.log("insertAGain",insertMessage)
                if (insertMessage.success) {
                    for (var i in stateTables) {
                        query = "SELECT * FROM " + stateTables[i] + " WHERE currentBlock >= " + block.blockNum
                        var queryResponse = db.queryTable(query)
                        if (queryResponse.success) {
                            var rowToModifyArray = queryResponse.message
                            for (var j in rowToModifyArray) {
                                if (rowToModifyArray[j].stateAddress) {
                                    var apiResponse = await rp(config.RESTapiUrl + '/state/' + rowToModifyArray[j].stateAddress)
                                    apiResponse = JSON.parse(apiResponse);
                                    var rowData = apiResponse.main
                                    query = mysql.format("UPDATE into " + stateTables[i] + " SET ? where stateAddress = " + rowToModifyArray[j].stateAddress, [rowData])
                                    var modifyCheck = await modifyTable(query)
                                    promises.push(modifyCheck)
                                }
                            }
                            
                        }
                    }
                    syncQueue.next()
                    resolve();
                }
            }).catch(e=>{
                reject(e);
            })
        }
    }).catch(e =>{
        reject(e);
    })
})

return promise
}

const insert = block => {

    var query = "SELECT * FROM blocks WHERE blockNum = " + block.blockNum
    db.queryTable(query).then(data => {
        console.log("kapil",data)
        if (data.success) {
            if (data.message.length > 0) {
                
                return resolveFork(block)
            } else {
                var query = "INSERT INTO blocks (blockId, blockNum, stateRootHash) VALUES (" + block.blockId + "," + block.blockNum + "," + block.stateRootHash + ")"
                db.modifyTable(query).then(insertMessage => {
                    return insertMessage
                })

            }
        } else {
            return data // contain the error message from  SQL
        }
    })

}

const checkIfBlockExist = block => {
    var promise = new Promise(function(resolve, reject) {
        var query = "SELECT * FROM blocks WHERE blockNum = " + block.blockNum
        db.queryTable(query).then(message => {

            if (message.success) {
                if (message.message && message.message.length > 0) {
                    resolve(true)
                }
                resolve(false)
            }

        }).catch(e=>{
           // console.log("checkblock error",e)
            reject(e)
        })
    })
    return promise
}

const timeOutLoadPrevious = wait => {
    setTimeout(() => {
        console.log("LOGGING")
        syncQueue.loadPrevious()
        syncQueue.next()
    }, wait)
}

const insertWithQueue = block => {
    
    syncQueue.place(
        function() {
           
            checkIfBlockExist(block).then(blockExists => {
                console.log("blockExist",blockExists)
                if (blockExists) {
                    resolveFork(block).then(()=>{

                    }).catch(e=>{
                        console.log("error in resolve",e)
                        timeOutLoadPrevious(1000)
                    })
                } else {
                    query = mysql.format("INSERT INTO blocks  set ? ", [block])

                    db.queryTable(query).then(insertMessage => {

                        console.log("insertMessage", insertMessage)


                        if (insertMessage.success) {
                            //  console.log("here in 1")
                            syncQueue.next()
                        }
                    }).catch((e) => {
                        timeOutLoadPrevious(1000)
                    })
                }
            }).catch(e=>{
               // console.log("blockcheck error ",e)
                timeOutLoadPrevious(1000)
            })



        })


}


module.exports = {
    insert,
    insertWithQueue
}