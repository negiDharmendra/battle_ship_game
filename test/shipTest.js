var sh = require('../server/battleship.js').sh;
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

});

describe('player',function(){
	it('has \'name, fleet,usedPositions,shoot\' properties');
})


