var sinon = require('sinon');
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
	it("should give any position randomly in initial", function() {
		var position = grid.getMaxPriority();
		assert.equal(position.priority,1);
	});
	it("should give highest priority position", function() {
		grid.prorities[0].priority =3;
		var position = grid.getMaxPriority();
		assert.equal(position.key,'A1');
		assert.equal(position.priority,3);
	});
	it("should give any random position among highest priority positions", function() {
		grid.prorities[67].priority =3;
		grid.prorities[68].priority =3;
		grid.prorities[69].priority =3;
		grid.prorities[70].priority =2;
		var position = grid.getMaxPriority();
		assert.equal(position.priority,3);
	});
});

describe("Get Adjacent", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should give four adjacent positions", function() {
		var position = {key:'B4',priority:1};
		var adj = grid.getAdjacent(position);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['B5','B3','C4','A4'],adj);
	});
	it("should give two adjacent positions when there are two only", function() {
		var position = {key:'A1',priority:1};
		var adj = grid.getAdjacent(position);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['A2', 'B1'],adj);
	});
	it("should give two adjacent positions when there are two only", function() {
		var position = {key:'J10',priority:1};
		var adj = grid.getAdjacent(position);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['J9', 'I10'],adj);
	});
	it("should give three adjacent positions when there are three", function() {
		var position = {key:'J5',priority:1};
		var adj = grid.getAdjacent(position);
		adj = adj.map(function(k){
			return k.key;
		});
		assert.deepEqual(['J6','J4','I5'],adj);
	});
});

describe("get Positon ", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should give the highest Position and set its priority to 0", function() {
		grid.prorities[0].priority = 3;
		assert.deepEqual({key:'A1',priority:0},grid.getPosition());
	});
});

describe("set Result", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should set the previous result of the object", function() {
		var position = {key:'J5',priority:2};
		grid.setResult(position,'miss');
		assert.deepEqual(grid.prev,{position:position,result:'miss'});
	});
	it("should increase the priority of the adjacent cells", function() {
		var position = {key:'J5',priority:2};
		grid.analyzePrevious=sinon.spy(); 
		grid.setResult(position,'hit');

		assert.deepEqual(grid.select('J4'),{key:'J4',priority:2});
		assert.deepEqual(grid.select('J6'),{key:'J6',priority:2});
		assert.deepEqual(grid.select('I5'),{key:'I5',priority:2});
	});
	it("should not increase the priority of the adjacent cells if it was 0", function() {
		var missedAdj = grid.select('D6');
		missedAdj.priority = 0 ;

		grid.analyzePrevious=sinon.spy();
		
		var position = {key:'D5',priority:2};
		grid.setResult(position,'hit');

		 

		assert.deepEqual(grid.select('D6'),{key:'D6',priority:0});
		assert.deepEqual(grid.select('D4'),{key:'D4',priority:2});
		assert.deepEqual(grid.select('C5'),{key:'C5',priority:2});
		assert.deepEqual(grid.select('E5'),{key:'E5',priority:2});
		assert.deepEqual(grid.hits,[{key:'D5',priority:2}]);
	});

});

describe("isInSequence", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should return true when Horizantal positions are in sequence", function() {
		var position1 = grid.select('D6');
		var position2 = grid.select('D7');
		var position3 = grid.select('D8');

		assert.ok(grid.isHorizantalSequence(position1,position2));
		assert.ok(grid.isHorizantalSequence(position1,position3));
	});
	it("should return true when Vertical positions are in sequence", function() {
		var position1 = grid.select('D6');
		var position2 = grid.select('E6');
		var position3 = grid.select('F6');

		assert.ok(grid.isVerticalSequence(position1,position2));
		assert.ok(grid.isVerticalSequence(position1,position3));
	});
});

describe("generateSequence", function() {
	var grid;
	beforeEach(function(){
		grid = new PriorityGrid();
	});
	it("should generate a sequence of provided position Verticaly", function() {
		var position = grid.select('D6');
		var expected = [grid.select('D6'),grid.select('D7'),grid.select('D8')];
		assert.deepEqual(grid.generateVerticalSequence(position,3),expected);
	});
	it("should generate a sequence of provided position Horizantly", function() {
		var position = grid.select('D6');
		var expected = [grid.select('D6'),grid.select('E6'),grid.select('F6')];
		assert.deepEqual(grid.generateHorizantalSequence(position,3),expected);
	});
	it("should generate a sequence of provided position Verticaly if available", function() {
		var position = grid.select('D9');
		var expected = [grid.select('D9'),grid.select('D10')];
		assert.deepEqual(grid.generateVerticalSequence(position,3),expected);
	});
	it("should generate a sequence of provided position Horizantly if available", function() {
		var position = grid.select('J6');
		var expected = [grid.select('J6')];
		assert.deepEqual(grid.generateHorizantalSequence(position,3),expected);
	});
});

