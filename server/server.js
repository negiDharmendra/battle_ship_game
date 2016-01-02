var http = require('http');
var routers = require('./routers.js');
var log = require('./log.js');
var Game = require('../library/game.js');
var Games = require('../library/games.js');

var games = new Games(Game);

var controller =routers.createController(games);

http.createServer(controller).listen(3000,function(){console.log("listening at port===>"+3000);
   log.log_message('writeFile','players.log','server started at '+new Date().toLocaleTimeString());
   log.log_message('writeFile','errors.log','server started at '+new Date().toLocaleTimeString());
});