var Game = require('../library/game.js');
var chai = require('chai');
var should = chai.should();
var ld = require('lodash');

describe('Game',function(){
	describe('player',function(){
		it('can join the game',function(){
			var player1 = {playerId:1,name:'guruji'};
			var game = new Game(player1);
			chai.expect(game.players).all.keys('1');
		});
	});
	describe('players',function(){
		it('can join the game',function(){
			var player1 = {playerId:1,name:'guruji'};
			var player2 = {playerId:2,name:'guptaji'};
			var game = new Game(player1);
			game.addPlayer(player2);
			chai.expect(game.players).all.keys('1','2');
		});
	});
	it('can not have more than two players',function(){
		var player1 = {playerId:1,name:'guruji'};
		var player2 = {playerId:2,name:'guptaji'};
		var player3 = {playerId:3,name:'googleji'};
		var game = new Game(player1);
		game.addPlayer(player2);
		var addThirdPlayer = function(){game.addPlayer(player3)};
		chai.expect(addThirdPlayer).to.throw(Error,/^Can not join the running game$/)
	})
	describe('access players',function(){
		var player1 = {playerId:1,name:'guruji'};
		var player2 = {playerId:2,name:'guptaji'};
		var game = new Game(player1);
		game.addPlayer(player2);
		it('getPlayer gives first player',function(){
			chai.assert.deepEqual(game.getPlayer(1),player1);
		});
		it('getPlayer throws an error for unauthorized player',function(){
			var getPlayer = function(){ game.getPlayer(3)};
			chai.expect(getPlayer).to.throw(Error,/^player is unauthorized$/);
		});
		it('getOpponentplayer gives opponent player',function(){
			chai.assert.deepEqual(game.getOpponentplayer(1),player2);
		});
		it('getOpponentplayer throws an error for unauthorized player',function(){
			var getOpponentplayer = function(){ game.getOpponentplayer(3)};
			chai.expect(getOpponentplayer).to.throw(Error,/^player is unauthorized$/);
		});
	});
	describe("gameStatus",function(){
		it('should be started when a player create a game',function(){
			var player1 = {playerId:1,name:'guruji'};
			var game = new Game(player1);
			chai.expect(game.status()).to.be.equals('Initialized');

		});
		it('should be running when second players join the game',function(){
			var player1 = {playerId:1,name:'guruji'};
			var player2 = {playerId:2,name:'guptaji'};
			var game = new Game(player1);
			game.addPlayer(player2);
			chai.expect(game.status()).to.be.equals('Running');
		});
		it('should be game over when anyone of the player dies',function(){
			var player1 = {playerId:1,name:'guruji',isAlive:true};
			var player2= {playerId:2,name:'guptaji',isAlive:false};
			var game = new Game(player1);
			game.addPlayer(player2);

			chai.expect(game.status()).to.be.equals('Game Over');
		})

	});
	describe('destroy',function(){
		it('should return which ship got hit',function(){
			var player = {playerId:1,name:'guruji',usedPositions:['A1','A2','A3','D1','D2','D3'],fleet:{
				Cruiser:{name:'Cruiser',positions:['D1','D2','D3'],vanishedLives:0,
					gotHit:function(position){
						if(this.positions.indexOf(position) >= 0)
							this.vanishedLives++;return this.name;
					}
				}
			}};
			player.removeDamagePosition = function(position){
				ld.remove(this.usedPositions,function(pos){return pos==position;});
			}
			var game = new Game(player);
			var ship = game.destroy(player,'D1');
			chai.assert.equal(ship,'Cruiser');
			chai.expect(player.fleet[ship].vanishedLives).to.equal(1);
			chai.expect(player.usedPositions).to.deep.equal(['A1','A2','A3','D2','D3']);
		});
	});
	describe('validatePosition',function(){
		var game = new Game('player1');
		it('informs player whether the position of ship is valid',function(){
			var isValid = game.validatePosition(['A1','A2','A3','A4','A5']);
			chai.expect(isValid).to.true;
		});
		it('says position is not valid if any of the position is not found in the available positions',function(){
			var isValid = game.validatePosition(['A1','A2','A3','A4','Z5']);
			chai.expect(isValid).to.false;
		});
		it('says position is not valid even ship fix in horizontal but number is greater than 10',function(){
			var isValid = game.validatePosition(['A11','A12','A13','A14','A15']);
			chai.expect(isValid).to.false;
		});
		it('says position is not valid even ship fix in vertical but number is greater than 10',function(){
			var isValid = game.validatePosition(['B11','B12','B13','B14','B15']);
			chai.expect(isValid).to.false;
		});
	});
	describe('validateAlignment',function(){
		var game = new Game('player1');
		it('says position is valid if player diploy his ship horizontally',function(){
			var isValid = game.validateAlignment(['A1','A2','A3']);
			chai.expect(isValid).to.true;
		});
		it('says position is valid if player diploy his ship vertically',function(){
			var isValid = game.validateAlignment(['A1','B1','C1']);
			chai.expect(isValid).to.true;
		});
		it('says position is not valid if player diploy his ship diagonally',function(){
			var isValid = game.validateAlignment(['A1','B2','C3']);
			chai.expect(isValid).to.false;
		});
	});
	describe('validateSize',function(){
		var game = new Game('player1');
		it('says ship size is valid if provided positions are equal to ship size',function(){
			var isValid=game.validateSize(['A1','A2','A3'],'submarine');
			chai.expect(isValid).to.true;
		});
		it('says ship size is not valid if provided positions are less than ship size',function(){
			var isValid=game.validateSize(['A1','A2','A3'],'battleship');
			chai.expect(isValid).to.false;
		});
		it('says ship size is not valid if provided positions are more than ship size',function(){
			var isValid=game.validateSize(['A1','A2','A3'],'destroyer');
			chai.expect(isValid).to.false;
		});
	});
	describe('getUpdates',function(){
		it('should give latest updates of game',function(){
			var player1 = {playerId:1,name:'guruji',usedPositions:['A1','A2','A3','D1','D2','D3'],
			readyState:true,isAlive:true,fleet:{
				submarine:{positions:['A1','A2','A3'],vanishedLives:0,isSunk:function(){return false;}},
				cruiser:{positions:['D1','D2','D3'],vanishedLives:0,isSunk:function(){return false;}}
			}};
			var player2= {playerId:2,name:'guptaji',usedPositions:['A1','A2','A3','D1','D2','D3'],
			readyState:true,isAlive:true,fleet:{
				submarine:{positions:['A1','A2','A3'],vanishedLives:0,isSunk:function(){return false;}},
				cruiser:{positions:['D1','D2','D3'],vanishedLives:0,isSunk:function(){return false;}}
			}};
			var game = new Game(player1);
			game.addPlayer(player2);
			game.turn = 1;
			var updates = game.getUpdates(1);

			chai.expect(updates).to.have.all.keys('positions','ships','gotHit','turn','gameEnd');
			chai.expect(updates.positions).to.deep.equal(['A1','A2','A3','D1','D2','D3']);
			chai.expect(updates.gotHit).to.deep.equal([]);
			chai.expect(updates.turn).to.equal(1);
		});
		it('should says game end if anyone of the player dies',function(){
			var player1 = {playerId:1,name:'guruji',usedPositions:['A1','A2','A3','D1','D2','D3'],
			readyState:true,isAlive:true,fleet:{
				submarine:{positions:['A1','A2','A3'],vanishedLives:0,isSunk:function(){return false;}},
				cruiser:{positions:['D1','D2','D3'],vanishedLives:0,isSunk:function(){return false;}}
			}};
			var player2= {playerId:2,name:'guptaji',usedPositions:['A1','A2','A3','D1','D2','D3'],
			readyState:true,isAlive:false,fleet:{
				submarine:{positions:['A1','A2','A3'],vanishedLives:0,isSunk:function(){return false;}},
				cruiser:{positions:['D1','D2','D3'],vanishedLives:0,isSunk:function(){return false;}}
			}};
			var game = new Game(player1);
			game.addPlayer(player2);
			game.turn = 1;
			var updates = game.getUpdates(1);

			chai.expect(updates.gameEnd).to.equal(true);
		});
	});

	describe('serveShipInfo',function(){
		it('should give latest status of the fleet',function(){
			var player1 = {playerId:1,name:'guruji',usedPositions:['A1','A2','A3','D1','D2','D3'],
			readyState:true,isAlive:true,fleet:{
				submarine:{positions:['A1','A2','A3'],vanishedLives:3,isSunk:function(){return true;}},
				cruiser:{positions:['D1','D2','D3'],vanishedLives:2,isSunk:function(){return false;}}
			}};
			var player2= {playerId:2,name:'guptaji',usedPositions:['A1','A2','A3','D1','D2','D3'],
			readyState:true,isAlive:true,fleet:{
				submarine:{positions:['A1','A2','A3'],vanishedLives:3,isSunk:function(){return true;}},
				cruiser:{positions:['D1','D2','D3'],vanishedLives:1,isSunk:function(){return false;}}
			}};
			var game = new Game(player1);
			game.addPlayer(player2);
			game.turn = 1;
			var shipInfo = game.serveShipInfo(1);
			chai.expect(shipInfo).to.have.all.keys('cruiser','submarine');
			chai.expect(shipInfo.cruiser).to.have.all.keys('hits','status');
			chai.expect(shipInfo.cruiser.hits).to.equal(2);
			chai.expect(shipInfo.submarine.hits).to.equal(3);
			chai.expect(shipInfo.cruiser.status).to.equal(false);
			chai.expect(shipInfo.submarine.status).to.equal(true);
		});
	});
});
