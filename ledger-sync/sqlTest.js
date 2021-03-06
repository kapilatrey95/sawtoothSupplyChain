var mysql   = require('mysql');
var config  = require('../config.json')
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

return promise


}

connect().then(response=>{
    if(response.success){
       var query = "SELECT * FROM blocks WHERE blockNum = 100"
       connection.query(query, function (err, result) {
        console.log(err)
        console.log(result)

       })



    }
})