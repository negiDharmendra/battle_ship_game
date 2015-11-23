var sh = require('../server/battleship.js').sh;
var chai = require('chai');

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
		chai.expect(player.fleet.length).to.be.equal(5);
	});
	it('has \'fleet\' of following ships',function(){
		var ships = player.fleet.map(function(ship){return ship.name;}).sort();
		var expected = [ 'battleship', 'carrier', 'cruiser', 'distroyer', 'submarine' ];
		chai.expect(ships).to.be.deep.equal(expected);
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
	it('deployShip throw an error for invalid ship positon',function(){
		var deployedCruiser = function(){ player.deployShip('cruiser',['A1','B2','C3'])};
		chai.expect(deployedCruiser).to.throw(Error,/^Can not deploy the ship on this positon$/);
		var deployedCruiser = function(){ player.deployShip('battleship',['A2','A4','A5'])};
		chai.expect(deployedCruiser).to.throw(Error,/^Can not deploy the ship on this positon$/);
		var deployedCruiser = function(){ player.deployShip('carrier',['C1','C1','C1'])};
		chai.expect(deployedCruiser).to.throw(Error,/^Can not deploy the ship on this positon$/);
	});
	it('can not deploy a ship on used position',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = function(){player.deployShip('battleship',['A1','B1','C1','D1'])};
		chai.assert.ok(deployedCruiser);
		chai.expect(deployedBattleship).to.throw(Error,/^Can not deploy the ship on this positon$/);
	});
	it('should contains the information about all those positions which occupied by all the ship have been deployed till now',function(){
		var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
		var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
		var deployedSubmarine = player.deployShip('submarine',['C2','D2','E2']);
		var usedPositions=['A1','A2','A3','J1','J2','J3','J4','C2','D2','E2'];
		chai.expect(player.usedPositions).to.be.deep.equal(usedPositions);
	});
});

describe('shoot',function(){
	it('should have events name as HIT MISSED YOUR TURN');
});

describe('distroy',function(){
	describe('holes',function(){
		it('should have total number of holes is zero after destroy');
	});
});

describe('sunk',function(){
	it('to check ship is sunk or not');
});
describe('hitted holes',function(){
	it('after ship  hitted holes should be increase by one');
});

describe('fleet',function(){
	it('player should not have repeated ship');
	it('when player placed all ship they emit ready event for the start game');
});

describe('who play first',function(){
	it('when ready event emit first 2 time who say ready first they will start');
	it('when shoot event is emitted hit event should called');
});
describe('toCheck ship is hitted or not',function(){
	it('check hitted co-ordinate and ship co-ordinate');
	it('if shoot is miss just give a message');
});

describe('toCheck game over',function(){
	it('if all ship holes is zero called game over');
});

describe('Observer',function(){
	var observer = sh.observer;
	it('informs player whether the position of ship is valid',function(){
		var isValid = observer.validatePosition('carrier',['A1','A2','A3','A4','A5']);
		chai.expect(isValid).to.true;
	});
	it('says position is not valid if any of the position is not found in the available positions',function(){
		var isValid = observer.validatePosition('carrier',['A1','A2','A3','A4','Z5']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid if player diploy his ship diagonally',function(){
		var isValid = observer.validatePosition('submarine',['A1','B2','C3']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid even ship fix in horizontal but number is greater than 10',function(){
		var isValid = observer.validatePosition('carrier',['A11','A12','A13','A14','A15']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid even ship fix in vertical but number is greater than 10',function(){
		var isValid = observer.validatePosition('carrier',['B11','B12','B13','B14','B15']);
		chai.expect(isValid).to.false;
	});
	it('says position is not valid if player provides number of position less than ship size',function(){
		var isValid=observer.validatePosition('battleship',['A1','A2','A3']);
		chai.expect(isValid).to.false;
	});
    it('starts only when both players says READY');
});
