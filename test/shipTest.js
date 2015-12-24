var expect = require('chai').expect;
var assert = require('chai').assert;
var should = require('chai').should();
var Ship = require('../library/ship');
var Player = require('../library/player.js')
var sinon = require('sinon');
 
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
		it("will set the ship's positions on the provieded positions",function(){
 			var ship = new Ship('Battleship',4);
			var player = {deployShip:function(name,positions){this.fleet[name].positions = positions}};
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
 	})
	describe("isSunk",function(){
		it("should say false if number of vanishedLives are less than ship lives",function(){
			var ship = new Ship('Battleship',4);
			ship.isSunk= sinon.spy()
			ship.isSunk.called.should.equal(false);
		});
	});
 })