var ld = require('lodash');
var PriorityGrid = function(){
	var prorities = [];
	for (var i = 65; i < 75; i++)
		for (var j = 1; j < 11; j++) 
			prorities.push({key:String.fromCharCode(i)+j,priority:1});
	this.prorities = prorities;
	this.prev = null;
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

PriorityGrid.prototype.analyzePrevious = function(position){
	if(this.prev.result =='hit'){
		var prevPos = this.prev.position.key.slice(0,1);
		var currPos = position.key.slice(0,1);
		var next = parseInt(position.key.slice(1));
		var num = currPos.charCodeAt();
		if(prevPos == currPos){
			var target1 = this.select(currPos+(next+1));
			var target2 = this.select(currPos+(next-1));
			this.incrementPriority(target1);
			this.incrementPriority(target2);
		}
		else{
			this.incrementPriority(String.fromCharCode(num+1) +next);
			this.incrementPriority(String.fromCharCode(num+1) +next);
		}
		return true;
	}
	return false;
};

PriorityGrid.prototype.setPriority = function(position,result) {
	var self = this;
	if(result == 'hit'){
		if(!this.analyzePrevious(position)){
		var adjacents = this.getAdjacent(position);
		adjacents.forEach(function(pos){
			if(pos.priority!=0)
				self.incrementPriority(pos);
		});
		};
	};
};

PriorityGrid.prototype.setResult = function(current,result){
	if(!this.prev) this.prev = {position:current,result:result.reply};
	this.setPriority(current,result.reply);
};

PriorityGrid.prototype.getPosition = function(){
	var position = this.getMaxPriority();
	this.removePriority(position);
	return position;
};

module.exports = PriorityGrid;