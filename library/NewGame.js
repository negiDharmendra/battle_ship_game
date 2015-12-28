var Player = require('./player.js');
var Game = function(player1,player2,gameid){
	this.player1 = player1;
	this.player2 = player2;
	this.gameId = gameid;
}

module.exports = Game;