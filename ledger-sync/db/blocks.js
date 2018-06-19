var mysql   = require('mysql');
const db = require('./')
var config = require("../../config.json")
var rp = require('request-promise');

var stateTables = [
    "Product",
    "Sku",
    "Batch",
    "Unit",
    "Package",
    "Location",
    "Account",
    "Scheme",
    "Sla",
    "IOTDataFeed",
    "GoodsTX"
]

const resolveFork = async (block) =>{
    var promises = []
    var query = "DELETE FROM blocks WHERE blockNum >= "+block.blockNum
    modifyTable(query).then(deleteMessage=>{ // deleting from the block table all the rows with blovk number >= current block
        if(deleteMessage.success){
             query = "INSERT INTO blocks (blockId, blockNum, stateRootHash) VALUES ("+block.blockId+","+block.blockNum+","+block.stateRootHash+")"
            modifyTable(query).then(insertMessage=>{
                if(insertMessage.success){
                    for (var i in stateTables){
                        query = "SELECT * FROM "+stateTables[i]+" WHERE currentBlock >= "+block.blockNum
                        var queryResponse =  db.queryTable(query)
                        if(queryResponse.success){
                            var rowToModifyArray =  queryResponse.message
                            for(var j in rowToModifyArray){
                               if(rowToModifyArray[j].stateAddress)
                               {
                                var apiResponse = await rp(config.RESTapiUrl+'/state/'+rowToModifyArray[j].stateAddress)
                                apiResponse = JSON.parse(apiResponse);
                                var rowData = apiResponse.main
                                query = mysql.format("UPDATE into "+ stateTables[i] +" SET ? where stateAddress = "+rowToModifyArray[j].stateAddress,[rowData])
                                var modifyCheck = await modifyTable(query)
                                promises.push(modifyCheck)
                               }
                            }   
                        }
                      }
                }
            })
        }else{
            promises.push(deleteMessage)
        }
    })
}

const insert = block => {
    var query = "SELECT * FROM blocks WHERE blockNum = "+block.blockNum
    db.queryTable(query).then(data => {
        if(data.success){
            if(data.message.length>0){
                return resolveFork(block)
            }else{
                var query = "INSERT INTO blocks (blockId, blockNum, stateRootHash) VALUES ("+block.blockId+","+block.blockNum+","+block.stateRootHash+")"
                modifyTable(query).then(insertMessage=>{
                    return insertMessage
                })
               
            }
        }else{
            return data   // contain the error message from  SQL
        }
    })


}



module.exports = {
    insert
  }