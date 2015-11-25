var sh = require('../server/battleship.js').sh;
var chai = require('chai');
var should=chai.should();
var ld = require('lodash');

/* battleship = 4
cruiser = 3
submarine = 3
distroyer = 2
carrier = 5*/
describe('ship',function(){
	var ship = new sh.Ship('battleship',4);
	it('has only two property namely name and holes',function(){
		chai.expect(ship).to.have.all.keys('name','holes');
	});
	it('name and holes are not editable',function(){
		ship.name="cruiser";
		ship.holes=6;
		chai.assert.equal(ship.name,'battleship');
		chai.assert.equal(ship.holes,4);
	});
	it('at initial position hittedHoles should be zero',function(){
		chai.expect(ship.hittedHoles).to.equal(0);
	});
});

describe('player',function(){
	var player;
	beforeEach(function(){
		player = new sh.Player('arun');	
	});
	it('has \'name, fleet\' properties.',function(){
		chai.expect(player).to.have.all.keys('name','fleet');
	});
	it('has \'fleet\' of five ship.',function(){
		chai.expect(player.fleet).to.have.all.keys('battleship','carrier','cruiser','distroyer','submarine');
	});
	it('has behaviour of deploying a ship',function(){
		var deployedShip = player.deployShip('cruiser',['A1','A2','A3']);
		chai.assert.ok(deployedShip);
	});
	it('should find usedPositions',function(){
		var deployedShip = player.deployShip('cruiser',['A1','A2','A3']);
		chai.assert.deepEqual(player.usedPositions,['A1','A2','A3']);
	});
	it('can deploy another ship after deploying a ship',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		chai.assert.deepEqual(player.usedPositions,['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		chai.assert.deepEqual(player.usedPositions,['A1','A2','A3','J1','J2','J3','J4']);
	});
	describe('deployShip throw an error for invalid ship positons',function(){
		it('for deploying Diagonally',function(){
			var deployedCruiser = function(){ player.deployShip('cruiser',['A1','B2','C3'])};
			chai.expect(deployedCruiser).to.throw(Error,/^Can not Deploy Ship Diagonally$/);
		});
		it('for Invalid Postion',function(){
			var deployedBattleship = function(){ player.deployShip('battleship',['A2','A4','A5','A6'])};
			chai.expect(deployedBattleship).to.throw(Error,/^Position Not Valid.$/);
		});
		it('for all same postion',function(){
			var deployedCarrier = function(){ player.deployShip('carrier',['C1','C1','C1','C1','C1'])};
			chai.expect(deployedCarrier).to.throw(Error,/^Position Not Valid.$/);
		});
		it('for size of ship',function(){
			var deployedDistroyer = function(){ player.deployShip('carrier',['A1','A2','A3'])};
			chai.expect(deployedDistroyer).to.throw(Error,/^Ship size is not Valid$/);
		})
		it('can not deploy a ship on used position',function(){
			var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
			var deployedBattleship = function(){player.deployShip('battleship',['A2','A3','A4','A5'])};
			chai.assert.ok(deployedCruiser);
			chai.expect(deployedBattleship).to.throw(Error,/^Position is already used$/);
		});
		it('has a property \'onPositions\'',function(){
			var deployedShip = player.deployShip('battleship',['A1','A2','A3','A4']);
			player.fleet['battleship'].should.have.property('onPositions');
		});
	});
	it('should contains the information about all ship have been deployed till now',function(){	
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		var deployedSubmarine = player.deployShip('submarine',['C2','D2','E2']);
		var usedPositions=['A1','A2','A3','J1','J2','J3','J4','C2','D2','E2'];
		chai.expect(player.usedPositions).to.be.deep.equal(usedPositions);
	});
});

var deployShip = function(player){
	var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
	var deployedCarrier = player.deployShip('carrier',['C6','C7','C8','C9','C10']);
	var deployedSubmarine = player.deployShip('submarine',['H5','I5','J5']);
	var deployedBattleship = player.deployShip('battleship',['E3','E4','E5','E6']);
	var deployedDistroyer = player.deployShip('distroyer',['G7','H7']);
};
describe('shoot',function(){
	var player,opponentPlayer;
	var shoot=sh.shoot;
	beforeEach(function () {
		player = new sh.Player('Manu');
		deployShip(player);
		opponentPlayer = new sh.Player('Shanu');
		deployShip(opponentPlayer);
	});
	it('player can not shoot if it is not his turn',function(){
		player.playerId = 1;
		sh.observer.turn = 2;
		chai.expect(function(){
			shoot.call(player,opponentPlayer,'A1');
		}).to.throw(Error,/^Opponent turn$/);
	});
	it('player can shoot only if it is his turn',function(){
		player.playerId = 1;
		sh.observer.turn = 1;
		chai.expect(function(){
			shoot.call(player,opponentPlayer,'A1');
		}).to.not.throw(Error);
	});
	it('player can not shoot on invalid position',function(){
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.observer.turn = 1;
		chai.expect(function(){
			shoot.call(player,opponentPlayer,'A12');
		}).to.throw(Error,/^Invalid position$/);
	});
	it('after every shoot hit or miss event will be invoked and turn will be changed',function(){
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.observer.turn = 1;
		shoot.call(player,opponentPlayer,'A1');
		chai.expect(sh.observer.turn).to.be.equal(2);
	});
	it('hit makes the changes in opponentPlayer usedPositions and fleet',function(){
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		sh.observer.turn = 1;
		shoot.call(player,opponentPlayer,'A1');
    	opponentPlayer.usedPositions.should.have.length(16);
    	chai.expect(opponentPlayer.fleet.cruiser.hittedHoles).to.be.equal(1);
	});
});


describe('Observer',function(){
	var observer = sh.observer;
	it('informs player whether the position of ship is valid',function(){
		var isValid = observer.validatePosition(['A1','A2','A3','A4','A5']);
		chai.expect(isValid).to.true;
	});
	it('says position is not valid if any of the position is not found in the available positions',function(){
		var isValid = observer.validatePosition(['A1','A2','A3','A4','Z5']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid if player diploy his ship diagonally',function(){
		var isValid = observer.validateAlignment(['A1','B2','C3']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid even ship fix in horizontal but number is greater than 10',function(){
		var isValid = observer.validatePosition(['A11','A12','A13','A14','A15']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid even ship fix in vertical but number is greater than 10',function(){
		var isValid = observer.validatePosition(['B11','B12','B13','B14','B15']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid if player provides number of position less than ship size',function(){
		var isValid=observer.validateSize(['A1','A2','A3'],'battleship');
		chai.expect(isValid).to.false;
	});
    it('checks if player had positioned 5 ships',function () {
    	var player = new sh.Player('arun');
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedCarrier = player.deployShip('carrier',['C6','C7','C8','C9','C10']);
		var deployedSubmarine = player.deployShip('submarine',['H5','I5','J5']);
		var deployedBattleship = player.deployShip('battleship',['E3','E4','E5','E6']);
		var deployedDistroyer = player.deployShip('distroyer',['G7','H7']);
    	player.usedPositions.should.have.length(17);
    });
    describe('sunk',function(){
  	var player,opponentPlayer;
		var shoot=sh.shoot;
		beforeEach(function () {
			player = new sh.Player('Manu');
			deployShip(player);
			opponentPlayer = new sh.Player('Shanu');
			deployShip(opponentPlayer);
			player.playerId=1;
			opponentPlayer.playerId=2;
			observer.turn=1;
			shoot.call(player,opponentPlayer,'G7');
			observer.turn=2;
			shoot.call(opponentPlayer,player,'A2');
			observer.turn=1;
			shoot.call(player,opponentPlayer,'H7');
			observer.turn=2;
			shoot.call(opponentPlayer,player,'C1');
			observer.turn=1;
			shoot.call(player,opponentPlayer,'C2');
		});
		it('checks whether ship is sunk or not',function(){
    		chai.expect(opponentPlayer.fleet.distroyer.isSunk()).to.be.true;
    		chai.expect(opponentPlayer.fleet.carrier.isSunk()).to.be.false;
    	});
	});

});
describe('READY event',function(){
	var player;
	beforeEach(function(){
		player = new sh.Player('arun');	
		player.playerId=1;
	});
	it('can be invoked by player when he had deployed all ships',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		var deployedSubmarine = player.deployShip('submarine',['C2','D2','E2']);
		var deployedDistroyer= player.deployShip('distroyer',['E5','E6']);
		var deployedCarrier = player.deployShip('carrier',['I1','I2','I3','I4','I5']);
		chai.expect(function(){player.ready()}).to.not.throw('Announced READY');
	});
	it('can not be invoked by player when he had not deployed all ships',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		chai.expect(function(){player.ready()}).to.throw(Error,/^Can not announce READY$/);
	});
});
describe('Assign Id when player is Created',function(){
	 it('assign a unique id to every player',function(){
    	var player1 = new sh.Player('camper');
		var player2 = new sh.Player('major');
		player1.playerId=sh.getUniqueId();
		player2.playerId=sh.getUniqueId();
		chai.expect(player1.playerId).to.be.equal(1);
		chai.expect(player2.playerId).to.be.equal(2);
    });
});

describe('who play first',function(){
	var player,opponentPlayer;
	beforeEach(function () {
		player = new sh.Player('Manu');
		deployShip(player);
		opponentPlayer = new sh.Player('Shanu');
		deployShip(opponentPlayer);
	});
	it('when ready event emit first 2 time who say ready first they will start',function(){
		player.playerId = 1;
		opponentPlayer.playerId = 2;
		player.ready();
		opponentPlayer.ready();
		chai.expect(sh.observer.turn).to.be.equal(1);
	});
	it('when shoot event is emitted hit event should called');
});

describe('fleet',function(){
	it('player should not have repeated ship');
	it('when player placed all ship they emit ready event for the start game');
});

