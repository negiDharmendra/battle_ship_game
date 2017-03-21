var expect = require('chai').expect;
var assert = require('chai').assert;
var should = require('chai').should();
var chai = require('chai');
var Ship = require('../library/ship');
 
 describe('Ship',function(){
 	describe("identity",function(){
		it("will have only it's name",function(){
 			var ship = new Ship('Name',4);
			expect(ship).to.have.all.keys('name');
 		});
 		it("doesn't allow to change his name and lives",function(){
 			var ship = new Ship('Battleship',4);
 			var ship = new Ship('Submarine',3);
 			expect(ship).to.have.property('positions').length(0);
 		});
	});
	describe("setPosition",function(){
		it("will set the ship on the provieded positions",function(){
 			var ship = new Ship('Battleship',4);
			var player = {deployShip:function(name,positions){this.fleet[name].setPosition(positions);}};
 			player.fleet = {"Battleship":ship};
 			player.deployShip('Battleship',['A1','A2','A3','A4']);
 			assert.deepEqual(ship.positions,['A1','A2','A3','A4']);
		});
	});
	
	describe("vanishedLives",function(){
		it("should be zero initially",function(){
			var ship = new Ship('Destroyer',2);
			expect(ship).to.have.property('vanishedLives').equal(0);
		});
 	});
	describe("gotHit",function(){
		it("should increase the vanished lives by one when ever invoked",function(){
			var ship = new Ship('Battleship',4);
			var player = {deployShip:function(name,positions){this.fleet[name].setPosition(positions,'horizontal');}};
 			player.fleet = {"Battleship":ship};
 			player.deployShip('Battleship',['A1','A2','A3','A4']);
			expect(ship.gotHit('A1')).to.equal('Battleship');
			expect(ship.vanishedLives).to.equal(1);
			expect(ship.alignment).to.equal('horizontal');
		});
 	});
	describe("isSunk",function(){
		it("should say false if number of vanishedLives are less than ship lives",function(){
			var ship = new Ship('Battleship',4);
			ship.isSunk().should.equal(false);
		});
	});
 })
 describe('allPosition', function() {
    it('should give all position if alignment is horizontal', function() {
    	var ship = new Ship('battleship',4);
        var allPosition = ship.getAllPositionOfShip('A1', 'horizontal');
        chai.expect(allPosition).to.have.length(4);
        chai.assert.deepEqual(allPosition, ['A1', 'A2', 'A3', 'A4']);
    });
    it('should give all position if alignment is vertical', function() {
    	var ship = new Ship('cruiser',3);
        var allPosition = ship.getAllPositionOfShip('A1', 'vertical');
        chai.expect(allPosition).to.have.length(3);
        chai.assert.deepEqual(allPosition, ['A1', 'B1', 'C1']);
    });
    it('should give empty array if alignment is rather than horizontal or vertical', function() {
    	var ship = new Ship('battleship',4);
        var allPosition = ship.getAllPositionOfShip('A1', 'diagonal');
        chai.expect(allPosition).to.have.length(0);
        chai.assert.deepEqual(allPosition, []);
    });
    it('should give empty array if alignment is undefined', function() {
    	var ship = new Ship('battleship',4);
        var allPosition = ship.getAllPositionOfShip('A1');
        chai.expect(allPosition).to.have.length(0);
        chai.assert.deepEqual(allPosition, []);
    })
});