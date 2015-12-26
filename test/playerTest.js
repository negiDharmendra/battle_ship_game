// var sh = require('../library/player.js').sh;
var Player = require('../library/player.js');
var chai = require('chai');
var should=chai.should();

describe('Player',function(){
	var player;
	beforeEach(function(){
		player = new Player('arun');
	});
	it('has \'fleet\' of five ship.',function(){
		chai.expect(player.fleet).to.have.all.keys('battleship','carrier','cruiser','destroyer','submarine');
	});
	describe('deployShip',function(){
		describe('player',function(){
			it('should able to deploy ship',function(){
				var deployedShip = player.deployShip('cruiser',['A1','A2','A3']);
				chai.assert.ok(deployedShip);
			});
			it('should have deployed ship position in usedPositions',function(){
				var deployedShip = player.deployShip('cruiser',['A1','A2','A3']);
				chai.assert.deepEqual(player.usedPositions,['A1','A2','A3']);
			});
			it('should have all deployed ship position in usedPositions',function(){
				var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
				chai.assert.deepEqual(player.usedPositions,['A1','A2','A3']);
				var deployedBattleship = player.deployShip('battleship',['J1','J2','J3','J4']);
				chai.assert.deepEqual(player.usedPositions,['A1','A2','A3','J1','J2','J3','J4']);
			});
		});
		describe('throws an error when player tries to deploy his ship',function(){
			it('diagonally',function(){
				var deployedCruiser = function(){ player.deployShip('cruiser',['A1','B2','C3'])};
				chai.expect(deployedCruiser).to.throw(Error,/^Can not Deploy Ship Diagonally$/);
			});
			it('on invalid postions',function(){
				var deployedBattleship = function(){ player.deployShip('battleship',['A2','A4','A5','A6'])};
				chai.expect(deployedBattleship).to.throw(Error,/^Position Not Valid.$/);
			});
			it('on same postions',function(){
				var deployedCarrier = function(){ player.deployShip('carrier',['C1','C1','C1','C1','C1'])};
				chai.expect(deployedCarrier).to.throw(Error,/^Position Not Valid.$/);
			});
			it('on positions less than ship size',function(){
				var deployedCarrier = function(){ player.deployShip('carrier',['A1','A2','A3'])};
				chai.expect(deployedCarrier).to.throw(Error,/^Ship size is not Valid$/);
			})
			it('on used positions',function(){
				var deployedCruiser = player.deployShip('cruiser',['A1','A2','A3']);
				var deployedBattleship = function(){player.deployShip('battleship',['A2','A3','A4','A5'])};
				chai.assert.ok(deployedCruiser);
				chai.expect(deployedBattleship).to.throw(Error,/^Position is already used$/);
			});
		});
	});
	describe('validatePosition',function(){
		it('informs player whether the position of ship is valid',function(){
			var isValid = player.validatePosition(['A1','A2','A3','A4','A5']);
			chai.expect(isValid).to.true;
		});
		it('says position is not valid if any of the position is not found in the available positions',function(){
			var isValid = player.validatePosition(['A1','A2','A3','A4','Z5']);
			chai.expect(isValid).to.false;
		});
		it('says position is not valid even ship fix in horizontal but number is greater than 10',function(){
			var isValid = player.validatePosition(['A11','A12','A13','A14','A15']);
			chai.expect(isValid).to.false;
		});
		it('says position is not valid even ship fix in vertical but number is greater than 10',function(){
			var isValid = player.validatePosition(['B11','B12','B13','B14','B15']);
			chai.expect(isValid).to.false;
		});
	});
	describe('validateAlignment',function(){
		it('says position is valid if player diploy his ship horizontally',function(){
			var isValid = player.validateAlignment(['A1','A2','A3']);
			chai.expect(isValid).to.true;
		});
		it('says position is valid if player diploy his ship vertically',function(){
			var isValid = player.validateAlignment(['A1','B1','C1']);
			chai.expect(isValid).to.true;
		});
		it('says position is not valid if player diploy his ship diagonally',function(){
			var isValid = player.validateAlignment(['A1','B2','C3']);
			chai.expect(isValid).to.false;
		});
	});
	describe('validateSize',function(){
		it('says ship size is valid if provided positions are equal to ship size',function(){
			var isValid=player.validateSize(['A1','A2','A3'],'submarine');
			chai.expect(isValid).to.true;
		});
		it('says ship size is not valid if provided positions are less than ship size',function(){
			var isValid=player.validateSize(['A1','A2','A3'],'battleship');
			chai.expect(isValid).to.false;
		});
		it('says ship size is not valid if provided positions are more than ship size',function(){
			var isValid=player.validateSize(['A1','A2','A3'],'destroyer');
			chai.expect(isValid).to.false;
		});
	});
	    it('checks if player had positioned 5 ships',function () {
	    	var player = new Player('arun');
			//deployShip(player);
	    	//player.usedPositions.should.have.length(17);
	    });
});

