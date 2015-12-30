var http = require('http');
var routers = require('./routers.js');
var log = require('./log.js');
var game = require('../library/game.js').sh;
var players ={};

var controller =routers.createController(game,players);

http.createServer(controller).listen(3000,function(){console.log("listening at port===>"+3000);
   log.log_message('writeFile','players.log','server started at '+new Date().toLocaleTimeString());
   log.log_message('writeFile','errors.log','server started at '+new Date().toLocaleTimeString());
});