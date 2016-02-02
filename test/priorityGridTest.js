var PriorityGrid = require('../library/priorityGridLib.js');
var chai = require('chai');
var should = chai.should();
var assert = chai.assert;

describe("Initial Priorities", function() {
	it("should have 100 positions all have priorities 1", function() {
		var grid = new PriorityGrid();
		grid.prorities.should.have.length.of(100);
		grid.prorities.forEach(function(key){
			assert.equal(key.priority,1);
		});
	});
});

describe("best Deal", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should give any postion randomly in initial", function() {
		var postion = grid.getMaxPriority();
		assert.equal(postion.priority,1);
	});
	it("should give highest priority postion", function() {
		grid.prorities[0].priority =3;
		var postion = grid.getMaxPriority();
		assert.equal(postion.key,'A1');
		assert.equal(postion.priority,3);
	});
	it("should give any random postion among highest priority postions", function() {
		grid.prorities[67].priority =3;
		grid.prorities[68].priority =3;
		grid.prorities[69].priority =3;
		grid.prorities[70].priority =2;
		var postion = grid.getMaxPriority();
		assert.equal(postion.priority,3);
	});
});

describe("Get Adjacent", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should give four adjacent positions", function() {
		var postion = {key:'B4',priority:1};
		var adj = grid.getAdjacent(postion);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['B5','B3','C4','A4'],adj);
	});
	it("should give two adjacent positions when there are two only", function() {
		var postion = {key:'A1',priority:1};
		var adj = grid.getAdjacent(postion);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['A2', 'B1'],adj);
	});
	it("should give two adjacent positions when there are two only", function() {
		var postion = {key:'J10',priority:1};
		var adj = grid.getAdjacent(postion);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['J9', 'I10'],adj);
	});
	it("should give three adjacent positions when there are three", function() {
		var postion = {key:'J5',priority:1};
		var adj = grid.getAdjacent(postion);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['J6','J4','I5'],adj);
	});
});

