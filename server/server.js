var http = require('http');
var requestController = require('./routers.js');
var log = require('./log.js');
requestController.players = {};

http.createServer(requestController).listen(3000,function(){console.log("listening at port===>"+3000);
   log.log_message('writeFile','players.log','server started at '+new Date().toLocaleTimeString());
   log.log_message('writeFile','errors.log','server started at '+new Date().toLocaleTimeString());
});