
function queue() {

    var queue = [];
    var previousCommand;
    var count = 0
    queue.active = false;
    queue.place = function (command) { 
      queue.push(command);
      if (!queue.active) queue.next();
    };
    queue.next = function () {
       
      if (!queue.length) {
        queue.active = false;
        return;
      } 
    
      var command = queue.shift();
      
      previousCommand=command;   
     // console.log(command);   
      queue.active = true;
     
      command();
    };
    queue.loadPrevious =function () {        
        
        if (!previousCommand){            
            return 
        }
        console.log("here",previousCommand)
        console.log(queue.active) 
        queue.unshift(previousCommand)   
        
       // queue.next();    
        if (!queue.active) {            
            queue.next();
        } 
    }

    //////CUSTOM AND TESTED////////////
    queue.putFirst = function (command) {
        queue.unshift(command)
        if (!queue.active) queue.next();
    }

    
    //////////////////////////////////////

    queue.clear = function(){
      queue.length = 0;
      queue.active = false;
    };

    return queue;
  }


  module.exports = queue;