var sh = require('../library/game.js').sh;
var Player = require('../library/player.js');
var chai = require('chai');
var should=chai.should();
var ld = require('lodash');


var deployShip = function(player){
	var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
	var deployedCarrier = player.deployShip('carrier',['C6','C7','C8','C9','C10']);
	var deployedSubmarine = player.deployShip('submarine',['H5','I5','J5']);
	var deployedBattleship = player.deployShip('battleship',['E3','E4','E5','E6']);
	var deployedDestroyer = player.deployShip('destroyer',['G7','H7']);
};
describe('shoot',function(){
	var player,opponentPlayer;
	var shoot=sh.shoot;
	beforeEach(function () {
		player = new Player('Manu');
		deployShip(player);
		opponentPlayer = new Player('Shanu');
		deployShip(opponentPlayer);
	});
	it('player can not shoot if it is not his turn',function(){
		player.ready();
		opponentPlayer.ready();
		player.playerId = 1;
		sh.game.turn = 2;
		chai.expect(function(){
			shoot.call(player,opponentPlayer,'A1');
		}).to.throw(Error,/^Opponent turn$/);
	});
	it('player can shoot only if it is his turn',function(){
		player.ready();
		opponentPlayer.ready();
		player.playerId = 1;
		sh.game.turn = 1;
		chai.expect(function(){
			shoot.call(player,opponentPlayer,'A1');
		}).to.not.throw(Error);
	});
	it('player can not shoot on invalid position',function(){
		player.ready();
		opponentPlayer.ready();
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.game.turn = 1;
		chai.expect(function(){
			shoot.call(player,opponentPlayer,'A12');
		}).to.throw(Error,/^Invalid position$/);
	});
	it('after every shoot hit or miss event will be invoked and turn will be changed',function(){
		player.ready();
		opponentPlayer.ready();
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.game.turn = 1;
		shoot.call(player,opponentPlayer,'A1');
		chai.expect(sh.game.turn).to.be.equal(2);
	});
	it('hit makes the changes in opponentPlayer usedPositions and fleet',function(){
		player.ready();
		opponentPlayer.ready();
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.game.turn = 1;
		shoot.call(player,opponentPlayer,'A1');
    	opponentPlayer.usedPositions.should.have.length(16);
    	chai.expect(opponentPlayer.fleet.cruiser.vanishedLives).to.be.equal(1);
	});
	it('can not shoot if not announced ready',function() {
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.game.turn = 1;
    	chai.expect(function() {shoot.call(player,opponentPlayer,'A1');}).to.throw(Error,/^Not announced ready$/);
	})
});




describe('sunk',function(){
	var player,opponentPlayer;
	var shoot=sh.shoot;
		player = new Player('Manu');
		deployShip(player);
		opponentPlayer = new Player('Shanu');
		deployShip(opponentPlayer);
		player.playerId=1;
		opponentPlayer.playerId=2;
		player.ready();
		opponentPlayer.ready();
		shoot.call(player,opponentPlayer,'G7');
		shoot.call(opponentPlayer,player,'A2');
		shoot.call(player,opponentPlayer,'H7');
		shoot.call(opponentPlayer,player,'C1');
		shoot.call(player,opponentPlayer,'C2');
	it('checks whether ship is sunk or not',function(){
			chai.expect(opponentPlayer.fleet.destroyer.isSunk()).to.be.true;
			chai.expect(opponentPlayer.fleet.carrier.isSunk()).to.be.false;
		});
});

describe('READY event',function(){
	var player;
	beforeEach(function(){
		player = new Player('arun');
		player.playerId=1;
	});
	it('can be invoked by player when he had deployed all ships',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		var deployedSubmarine = player.deployShip('submarine',['C2','D2','E2']);
		var deployedDestroyer= player.deployShip('destroyer',['E5','E6']);
		var deployedCarrier = player.deployShip('carrier',['I1','I2','I3','I4','I5']);
		chai.expect(function(){player.ready()}).to.not.throw('Announced READY');
	});
	it('can not be invoked by player when he had not deployed all ships',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		chai.expect(function(){player.ready()}).to.throw(Error,/^Can not announce READY$/);
	});
});


describe('who play first',function(){
	var player,opponentPlayer;
	beforeEach(function () {
		player = new Player('Manu');
		deployShip(player);
		opponentPlayer = new Player('Shanu');
		deployShip(opponentPlayer);
	});
	it('when ready event emit first 2 time who say ready first they will start',function(){
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		player.ready();
		opponentPlayer.ready();
		chai.expect(sh.game.turn).to.be.equal(1);
	});
});

describe('fleet',function(){
	var player,opponentPlayer;
	beforeEach(function () {
		player = new Player('Manu');
		deployShip(player);
	});
	it('players should not have repeated ship',function () {
		chai.expect(function() {
		 	player.deployShip('battleship',['I1','I2','I3','I4']);
		}).to.throw(Error,/^Can not afford more Ships$/);
		player.usedPositions.should.have.length(17);
		player.fleet.should.have.all.keys('battleship','carrier','cruiser','destroyer','submarine');
	});
});

describe('destroy',function () {
	var player,opponentPlayer;
	beforeEach(function () {
		player = new Player('Manu');
		deployShip(player);
		opponentPlayer = new Player('Sanu');
		deployShip(opponentPlayer);
	});
	it('destroyes the opponent ship',function () {
		var targetShip=sh.destroy(opponentPlayer,'A1');
		chai.expect(targetShip).to.be.equal('cruiser');
	});
});
