var ld = require('lodash');
var PriorityGrid = function(){
	var prorities = [];
	for (var i = 65; i < 75; i++)
		for (var j = 1; j < 11; j++) 
			prorities.push({key:String.fromCharCode(i)+j,priority:1});
	this.prorities = prorities;
	this.prev = null;
	this.hits =[];
	this.miss = [];
};

PriorityGrid.prototype.getMaxPriority = function() {
	var max = this.prorities.reduce(function(a,b){ return a.priority>=b.priority?a:b});
	var allBestPositons = this.prorities.filter(function(x){return (x.priority>=max.priority);});
	return ld.sample(allBestPositons);
};

PriorityGrid.prototype.select = function(p){
	return ld.find(this.prorities,function(position){ return position.key == p});
};

PriorityGrid.prototype.getAdjacent = function(position){
	var self = this;
	var adjacent = [];
	var charCode = String.fromCharCode;
	var alphnumeric = position.key.slice(0,1).charCodeAt();
	var numeric = parseInt(position.key.slice(1));
	adjacent.push(charCode(alphnumeric)+(numeric+1),charCode(alphnumeric)+(numeric-1));
	adjacent.push(charCode(alphnumeric+1)+(numeric),charCode(alphnumeric-1)+(numeric));
	adjacent = adjacent.map(function(adj){
		return self.select(adj);
	});
	return ld.compact(adjacent);
};

PriorityGrid.prototype.isHorizantalSequence = function(position1,position2){
	var pos1 = position1.key.slice(0,1).charCodeAt();
	var pos2 = position2.key.slice(0,1).charCodeAt();
	return (pos2==pos1); 
};

PriorityGrid.prototype.isVerticalSequence = function(position1,position2){
	var numeric1 = parseInt(position1.key.slice(1));
	var numeric2 = parseInt(position2.key.slice(1));
	return (numeric1==numeric2);	
};


PriorityGrid.prototype.generateVerticalSequence = function(position,size){
	size = size || 5;
	var sequence =[];
	var alphnumeric = position.key.slice(0,1);
	var numeric = parseInt(position.key.slice(1));
	for (var i = 0; i < size ; i++) 
		sequence.push(this.select(alphnumeric+(numeric+i)));
	return ld.compact(sequence);
};

PriorityGrid.prototype.generateHorizantalSequence = function(position,size){
	size = size || 5;
	var sequence =[];
	var charCode = String.fromCharCode;
	var alphnumeric = position.key.slice(0,1).charCodeAt();
	var numeric = parseInt(position.key.slice(1));
	for (var i = 0; i < size ; i++) 
		sequence.push(this.select(charCode(alphnumeric+i)+numeric));
	return ld.compact(sequence);
};


PriorityGrid.prototype.incrementPriority = function(position){
	if(position.priority != 0)
		position.priority++;
};

PriorityGrid.prototype.decrementPriority = function(position){
	if(position.priority != 0)
		position.priority--;
};

PriorityGrid.prototype.removePriority = function(position){
	position.priority = 0;
};

PriorityGrid.prototype.setResult = function(position,result){
	var self = this;
	if(result == 'hit'){
		this.hits.push(position);
		this.hits.sort(function(a,b){return a.key-b.key;});
		var adjacents = this.getAdjacent(position);
		adjacents.forEach(function(pos){
			if(pos.priority!=0) self.incrementPriority(pos);
		});
	};
	if(result=='miss'){
		this.miss.push(position);
		var _adjacents = this.getAdjacent(position);
			_adjacents.forEach(function(pos){
				if(pos.priority!=0 && pos.priority!=1) self.decrementPriority(pos);
			})
	}
	this.analyzePrevious();
	this.prev = {position:position,result:result};
};

PriorityGrid.prototype.getPosition = function(){
	var position = this.getMaxPriority();
	this.removePriority(position);
	return position;
};

PriorityGrid.prototype.analyzePrevious = function(){
	var self = this;
	var primeSuspect =[];
	this.hits.forEach(function(sample){
		self.hits.forEach(function(sample2){
			if(self.isHorizantalSequence(sample,sample2))
				primeSuspect=primeSuspect.concat(self.generateHorizantalSequence(sample))
			if(self.isVerticalSequence(sample,sample2))
				primeSuspect=primeSuspect.concat(self.generateVerticalSequence(sample));
		});
	});
	primeSuspect=ld.unique(primeSuspect);
	primeSuspect=primeSuspect.filter(function(k){return k.priority>0;});
	primeSuspect.forEach(function(sample){
		if(sample.priority!=0)
		self.incrementPriority(sample);
	});
};

PriorityGrid.prototype.fleetPosition= function(){
	var allBestPositons =  this.prorities;
	var finalPositions =[];
	var usedPositions = [];
	var alignment;
	var shipSize = { battleship: 4,cruiser: 3,carrier: 5,destroyer: 2,submarine: 3 };
	for (ship in shipSize) {
		var counter = Math.random()*10;
		var arr = [];
		arr.push(ship);
		var pos = ld.sample(allBestPositons);
		if(counter<5){
			alignment = 'vertical';
			usedPositions = usedPositions.concat(this.generateVerticalSequence(pos,shipSize[ship]));
			arr.push(pos.key);
			arr.push(alignment);			
		}
		if(counter>5){
			alignment = 'horizontal';
			usedPositions = usedPositions.concat(this.generateHorizantalSequence(pos,shipSize[ship]));				
			arr.push(pos.key);
			arr.push(alignment);
		}
		finalPositions.push(arr);
		allBestPositons=ld.difference(allBestPositons,usedPositions);
	}
	return finalPositions;
};


module.exports = PriorityGrid;