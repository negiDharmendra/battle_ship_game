var Game = require('../library/game.js');
// var Player = require('../library/player.js');
var chai = require('chai');
var should=chai.should();
var ld = require('lodash');

// var deployShip = function(player){
// 	var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
// 	var deployedCarrier = player.deployShip('carrier',['C6','C7','C8','C9','C10']);
// 	var deployedSubmarine = player.deployShip('submarine',['H5','I5','J5']);
// 	var deployedBattleship = player.deployShip('battleship',['E3','E4','E5','E6']);
// 	var deployedDestroyer = player.deployShip('destroyer',['G7','H7']);
// };

// describe('sunk',function(){
// 	var player,opponentPlayer;
// 		player = new Player('Manu');
// 		deployShip(player);	
// 		opponentPlayer = new Player('Shanu');
// 		deployShip(opponentPlayer);
// 		player.playerId=1;
// 		opponentPlayer.playerId=2;
// 	var shoot=player.shoot;
// 		player.ready();
// 		opponentPlayer.ready();
// 		shoot.call(player,opponentPlayer,'G7');
// 		shoot.call(opponentPlayer,player,'A2');
// 		shoot.call(player,opponentPlayer,'H7');
// 		shoot.call(opponentPlayer,player,'C1');
// 		shoot.call(player,opponentPlayer,'C2');
// 	it('checks whether ship is sunk or not',function(){
// 			chai.expect(opponentPlayer.fleet.destroyer.isSunk()).to.be.true;
// 			chai.expect(opponentPlayer.fleet.carrier.isSunk()).to.be.false;
// 		});
// });



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
});