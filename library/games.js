var ld = require('lodash');

var Games = function (Game) {
	this.allGames = {};
	this.createGame = function(player){
		player.playerId = player.name+'_'+this.getPlayerId();
		var game = new Game(player);
		game.gameId = this.getGameId();
		this.allGames[game.gameId]=game;
		return game;
	};
	this.joinGame = function(game,player){
		player.playerId = player.name+'_'+this.getPlayerId();
		return game.addPlayer(player);
	};
};


Games.prototype = {
	getGameId : (function(){
		var id = 100;
		return function(){return id++;};
	})(),
	getPlayerId : (function(){
		var id = 1;
		return function(){return id++;};
	})(),
	getGame : function(gameId){
		var game = this.allGames[gameId];
		if(game) return game;
		return null;
	},
	getInitializedGames : function(){
		var games = this.allGames;
		var initializedGames = {};
		for(var game in games){
			game = this.getGame(game);
			if(game.status()=='Initialized'){
				initializedGames[game.gameId]=game;
			}
		}
		return initializedGames;
	},
	deleteGame : function(gameId){
		delete this.allGames[gameId];
	},
	ensureValidGame : function(gameId){
		return !!this.getGame(gameId);
	}
}


module.exports = Games;