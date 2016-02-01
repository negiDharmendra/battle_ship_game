var Games = require('../library/games.js');
var chai = require('chai');
var sinon = require('sinon');

describe('Games',function () {
	var Game;
	var games;
	beforeEach(function(){
		Game = sinon.spy();
		games = new Games(Game);
	});
	it('can create a new game',function(){
		var player = {};
		games.createGame(player);
		var noOfGames = Object.keys(games.allGames).length;
		chai.expect(noOfGames).to.be.equal(1);
		chai.expect(Game.calledOnce).to.be.true;
	});
	it('can join a game',function(){
		var game = {addPlayer:sinon.spy()};
		var player = {};
		games.joinGame(game,player);
		chai.expect(game.addPlayer.calledWith(player));
	});
	it('can find a game',function(){
		var player = {};
		var newgame = games.createGame(player);
		var game = games.getGame(newgame.gameId);
		chai.expect(game).to.be.equal(newgame);
	});
	it('gives all the games which can be joined',function(){
		var Game = function(){this.status=function(){
			return 'Initialized';
		}};
		var games = new Games(Game);
		var player = {};
		var newgame = games.createGame(player);
		var existinggames = games.getInitializedGames();
		chai.expect(Object.keys(existinggames).length).to.be.equal(1);
	});
	it('gives null if there is no game that can be joined',function(){
		var Game = function(){this.status=function(){
			return 'Initialized';
		}};
		var games = new Games(Game);
		var player = {};
		var existinggames = games.getInitializedGames();
		chai.expect(Object.keys(existinggames).length).to.be.equal(0);
	});
	it('delete a game',function(){
		var player = {};
		var newgame = games.createGame(player);
		games.deleteGame(newgame.gameId);
		var allGames = games.allGames;
		chai.expect(Object.keys(allGames).length).to.be.equal(0);
	});
	it('will ensure a that a game is valid',function(){
		var player = {};
		var newgame = games.createGame(player);
		chai.expect(games.ensureValidGame(newgame.gameId)).to.be.true;
	});
	it('will ensure a that a game is not valid',function(){
		var player = {};
		var randomGame = {gameId:434};
		chai.expect(games.ensureValidGame()).to.be.false;
	});
});