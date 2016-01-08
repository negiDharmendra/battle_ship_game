var http = require('http');
var routers = require('./routers.js');
var log = require('./log.js');
var Game = require('../library/game.js');
var Games = require('../library/games.js');
const PORT = 5000;
var games = new Games(Game);

var controller =routers.createController(games);
http.createServer(controller).listen(process.env.PORT || PORT,function(){
	console.log("listening at port===>"+ PORT);
   log.log_message('writeFile','players.log','server started at '+new Date().toLocaleTimeString());
   log.log_message('writeFile','errors.log','server started at '+new Date().toLocaleTimeString());
});