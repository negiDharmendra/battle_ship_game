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
});

describe('game object',function(){
	it.skip('game object should have only to keys',function(){
		chai.assert.equal(Object.keys(sh.game_object),['player1',player2]);
	});
});

describe('player1',function(){
	it.skip('player1 should have only follow properties',function(){
		chai.assert.equal(Object.keys(sh.game_object.player1),['name','fleet']);
	});
});

describe('shoot',function(){
	it.skip('should have events name as HIT MISSED YOUR TURN');
});

describe('usedPositions',function(){
	it.skip('should contains the information about all those positions which occupied by all the ship have been deployed till now');
});

describe('distroy',function(){
	describe('holes',function(){
		it.skip('should have total number of holes is zero after destroy',function(){
			chai.assert.deepEqual(sh.distroy('cruiser'),0);
		
		});
	});
});
describe('shunk',function(){
	it.skip('to check ship is shunk or not',function(){
		chai.assert.ok(sh.isShunk('cruiser'));
		chai.assert.ok(sh.isShunk('battleship'));
		chai.assert.ok(sh.isShunk('carrier'));
		chai.assert.ok(sh.isShunk('submarine'));
		chai.assert.ok(sh.isShunk('distroyer'));

	});
});
describe('hitted holes',function(){
	it.skip('after ship  hitted holes should be increase by one',function(){
		var ship = new sh.Ship();
		chai.assert.equal(ship.hittedHoles('cruiser'),1);
		chai.assert.equal(ship.hittedHoles('battleship'),1);
		chai.assert.equal(ship.hittedHoles('submarine'),1);
		chai.assert.equal(ship.hittedHoles('carrier'),1);
		chai.assert.equal(ship.hittedHoles('distroyer'),1);
	});
	it.skip('at initial position hittedHoles should be zero',function(){
		var ship = new sh.Ship();
		chai.assert.equal(ship.hittedHoles('cruiser'),0);
		chai.assert.equal(ship.hittedHoles('battleship'),0);
		chai.assert.equal(ship.hittedHoles('submarine'),0);
		chai.assert.equal(ship.hittedHoles('carrier'),0);
		chai.assert.equal(ship.hittedHoles('distroyer'),0);
	});
});

describe('fleet',function(){
	it.skip('5 ship should have each player');
	it.skip('player should not have repeated ship');
	it.skip('when player puted all ship they emit ready event for the start game');
});

describe('who play first',function(){
	it.skip('when ready event emit first 2 time who say ready first they will start');
	it.skip('when shoot event is emitted hit event should called');
});
describe('toCheck ship is hitted or not',function(){
	it.skip('check hitted co-ordinate and ship co-ordinate');
	it.skip('if shoot is miss just give a message');
});

describe('toCheck game over',function(){
	it.skip('if all ship holes is zero called game over');
});


