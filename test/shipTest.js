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
		chai.assert.deepEqual(Object.keys(ship),['name','holes']);
	});
	it('name and holes are not editable',function(){
		ship.name="cruiser";
		ship.holes=6;
		chai.assert.equal(ship.name,'battleship');
		chai.assert.equal(ship.holes,4);
	});
    it('should placed in valid position');
    it('should placed horizontal or vertical position');
    it('cannot change the position of any ship after announcing READY');
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
	it('validatePosition returns true for valid positons of ship',function(){
		var isValid = player.validatePosition('carrier',['A1','A2','A3','A4','A5']);
		chai.assert.ok(isValid);
	});
	it('validatePosition returns false for invalid positons of ship',function(){
		var isValid = player.validatePosition('carrier',['A1','A2','A3','A4','Z5']);
		chai.assert.ok(!isValid);
		var isValid = player.validatePosition('carrier',['A1','B2','C3','D4','E5']);
		chai.assert.ok(!isValid);
	});
	it('validatePosition returns false if numberOf positons are less than holes of ship',function(){
		var isValid=player.validatePosition('battleship',['A1','A2','A3']);
		chai.assert.ok(!isValid);
	});
	it('has behaviour of deploying a ship',function(){
		var deployedShip = player.diployShip('cruiser',['A1','A2','A3']);
		chai.assert.ok(deployedShip);
		chai.assert.deepEqual(player.usedPositions,['A1','A2','A3']);
	});
	it('deployShip throw an error for invalid ship positon',function(){
		var deployedShip = player.diployShip.bind(null,'cruiser',['A1','B2','C3']);
		chai.expect(deployedShip).to.throw(Error,'Can not deploy the ship on this positon');
	});
	it('at initial position hittedHoles should be zero');
});

describe('game object',function(){
	it('game object should have only to keys');
    it('starts only when both players says READY');
});

describe('shoot',function(){
	it('should have events name as HIT MISSED YOUR TURN');
});

describe('usedPositions',function(){
	it('should contains the information about all those positions which occupied by all the ship have been deployed till now');
});

describe('distroy',function(){
	describe('holes',function(){
		it('should have total number of holes is zero after destroy');
	});
});
describe('shunk',function(){
	it('to check ship is shunk or not');
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


