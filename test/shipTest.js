var sh = require('../server/battleship.js').sh;
var assert = require('assert');
var chai = require('chai');
var test = {};
exports.test = test;


/* battleship = 4
cruiser = 3
submarine = 3
distroyer = 2
carrier = 5*/
describe('ship',function(){
	it('has only two property namely name and holes',function(){
		var ship = new sh.Ship('battleship',4);
		chai.assert.deepEqual(Object.keys(ship),['name','holes'])
	});
	it('name and holes are not editable',function(){
		var ship = new sh.Ship('battleship',4);
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
	it('has \'name, fleet,usedPositions,shoot\' properties');
    it('should place five ships');
    it('cannot place a ship on top of another');
    it('should announce READY to play');

})

describe('game object',function(){
	it('game object should have only to keys',function(){
		assert.equal(Object.keys(sh.game_object),['player1','player2']);
	});
    it('starts only when both players says READY');
});

describe('player1',function(){
	it('player1 should have only follow properties',function(){
		assert.equal(Object.keys(sh.game_object.player1),['name','fleet']);
	});
});

describe('shoot',function(){
	it('should have events name as HIT MISSED YOUR TURN');
});

describe('usedPositions',function(){
	it('should contains the information about all those positions which occupied by all the ship have been deployed till now');
});

describe('distroy',function(){
	describe('holes',function(){
		it('should have total number of holes is zero after destroy',function(){
			assert.deepEqual(sh.distroy('cruiser'),0);
		
		});
	});
});
describe('shunk',function(){
	it('to check ship is shunk or not',function(){
		assert.ok(sh.isShunk('cruiser'));
		assert.ok(sh.isShunk('battleship'));
		assert.ok(sh.isShunk('carrier'));
		assert.ok(sh.isShunk('submarine'));
		assert.ok(sh.isShunk('distroyer'));

	});
});
describe('hitted holes',function(){
	it('after ship  hitted holes should be increase by one',function(){
		var ship = new sh.Ship();
		assert.equal(ship.hittedHoles('cruiser'),1);
		assert.equal(ship.hittedHoles('battleship'),1);
		assert.equal(ship.hittedHoles('submarine'),1);
		assert.equal(ship.hittedHoles('carrier'),1);
		assert.equal(ship.hittedHoles('distroyer'),1);
	});
	it('at initial position hittedHoles should be zero',function(){
		var ship = new sh.Ship();
		assert.equal(ship.hittedHoles('cruiser'),0);
		assert.equal(ship.hittedHoles('battleship'),0);
		assert.equal(ship.hittedHoles('submarine'),0);
		assert.equal(ship.hittedHoles('carrier'),0);
		assert.equal(ship.hittedHoles('distroyer'),0);
	});
});

describe('fleet',function(){
	it('5 ship should have each player');
	it('player should not have repeated ship');
	it('when player puted all ship they emit ready event for the start game');
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