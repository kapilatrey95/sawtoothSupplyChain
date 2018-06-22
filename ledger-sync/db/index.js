var mysql   = require('mysql');
var config  = require('../../config.json')
var syncQueue = require('../../app/sync-queue.js')
syncQueue = new syncQueue()
let connection ;


const connect = () => {
  
  var promise = new Promise(function(resolve,reject){
 connection = mysql.createConnection({
  host     : config.db_host,
  user     : config.db_user,
  password : config.db_password,
  database : config.db_name
});


connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
     reject({"success":false,"message":err})
    }
    var sql = "CREATE TABLE IF NOT EXISTS blocks (blockId VARCHAR(255),blockNum int, stateRootHash VARCHAR(255))";   // updated now
        connection.query(sql, function (err, result) {
        if (err){ 
          console.log(err)
          reject({"success":false,"message":err});

        }

        console.log("Table created");
        console.log('connected as id ' + connection.threadId);
        
      
        resolve({"success":true})
      });
  

  });

})


}


const queryTable = (query) => {
    var promise = new Promise(function(resolve,reject){
      
    connection.query(query, function (err, result) {
     
       if(result){
         resolve({"success":true,"message":result});
       }else if(err){
        reject({"success":false,"message":err});
       }

      });


   
    })

    return promise


}


const modifyTable = (query) => {
    return  queryTable(query)
        .then(result => {
           return result
        })
}



var function1 = function(block){

console.log("here in this")

  var query = mysql.format("INSERT INTO blocks  set ? ",[block])
  if((block.blockNum) == 3 ){
    query = mysql.format("INSERT ITO blocks  set ? ",[block])
  }
  queryTable(query).then(insertMessage=>{
    console.log("insertMessage",insertMessage)
      if(insertMessage.success){
          syncQueue.next()
      }else{
          setTimeout(()=>{
            console.log("hello error")
              syncQueue.loadPrevious()
          },5000)
      }
  })
}





module.exports = {
  connect,
  queryTable,
  modifyTable,
  function1
  
  }
